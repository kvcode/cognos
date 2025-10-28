define([], function() {
    "use strict";
  
    function injectCSS(cssUrl) {
      require(["text!" + cssUrl], function(cssContent) {
        try {
          const style = document.createElement("style");
          style.textContent = cssContent;
          document.head.appendChild(style);
          console.log("[preLoad] ✅ CSS injected from:", cssUrl);
        } catch (e) {
          console.error("[preLoad] ❌ Failed to inject CSS:", e);
        }
      }, function(err) {
        console.error("[preLoad] ❌ Failed to load CSS file:", err);
      });
    }
  
    return {
      initialize: function(oControlHost, fnDoneInitializing) {
        console.log("[preLoad] 🔧 initialize() called");
  
        const config = oControlHost.configuration || {};
        const basePaths = config.BaseScriptPaths || {};
        const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPageGH/";
  
        const cssPath = basePaths.LeftPaneCSS || (fallbackBase + "LeftPane.css");
        injectCSS(cssPath);
  
        const customPromptPath = fallbackBase + "CustomPromptPage.js";
        console.log(`[preLoad] 🚀 Loading CustomPromptPage from: ${customPromptPath}`);
  
        require([customPromptPath], function(CustomPromptPage) {
          console.log("[preLoad] ✅ CustomPromptPage loaded");
  
          try {
            const control = new CustomPromptPage();
            oControlHost.control = control;
            control.initialize(oControlHost, fnDoneInitializing);
          } catch (err) {
            console.error("[preLoad] ❌ Error initializing CustomPromptPage:", err);
            fnDoneInitializing();
          }
        }, function(err) {
          console.error("[preLoad] ❌ Failed to load CustomPromptPage:", err);
          fnDoneInitializing();
        });
      },
  
      draw: function(oControlHost) {
        console.log("[preLoad] 🖼 draw() called");
  
        if (oControlHost.control && typeof oControlHost.control.draw === "function") {
          oControlHost.control.draw(oControlHost);
        } else {
          console.warn("[preLoad] ⚠️ draw() skipped — control not ready");
        }
      },
  
      destroy: function(oControlHost) {
        console.log("[preLoad] 🧨 destroy() called");
  
        if (oControlHost.control && typeof oControlHost.control.destroy === "function") {
          oControlHost.control.destroy();
        }
      }
    };
  });
