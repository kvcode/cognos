define([], function () {
  "use strict";

  function PreLoad() {
    console.log("[PreLoad] 🏗 Constructor called");
  }

  PreLoad.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[PreLoad] 🔧 initialize() called");

    const config = oControlHost.configuration || {};
    const basePaths = config.BaseScriptPaths || {};
    const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPageGH/";

    // Inject CSS
    const cssPath = basePaths.LeftPaneCSS || fallbackBase + "LeftPane.css";
    this.injectCSS(cssPath);

    const customPromptPath = basePaths.CustomPromptPage || fallbackBase + "CustomPromptPage.js";
    console.log(`[PreLoad] 🚀 Loading CustomPromptPage from: ${customPromptPath}`);

    require([customPromptPath], function (CustomPromptPage) {
      console.log("[PreLoad] ✅ CustomPromptPage loaded");

      try {
        const control = new CustomPromptPage();
        oControlHost.control = control;
        control.initialize(oControlHost, fnDoneInitializing);
      } catch (err) {
        console.error("[PreLoad] ❌ Error initializing CustomPromptPage:", err);
        fnDoneInitializing();
      }
    }, function (err) {
      console.error("[PreLoad] ❌ Failed to load CustomPromptPage:", err);
      fnDoneInitializing();
    });
  };

  PreLoad.prototype.injectCSS = function (cssUrl) {
    require(["text!" + cssUrl], function (cssContent) {
      try {
        const style = document.createElement("style");
        style.textContent = cssContent;
        document.head.appendChild(style);
        console.log("[PreLoad] ✅ CSS injected from:", cssUrl);
      } catch (e) {
        console.error("[PreLoad] ❌ Failed to inject CSS:", e);
      }
    }, function (err) {
      console.error("[PreLoad] ❌ Failed to load CSS file:", err);
    });
  };

  PreLoad.prototype.draw = function (oControlHost) {
    console.log("[PreLoad] 🖼 draw() called");

    if (oControlHost.control && typeof oControlHost.control.draw === "function") {
      oControlHost.control.draw(oControlHost);
    } else {
      console.warn("[PreLoad] ⚠️ draw() skipped — control not ready");
    }
  };

  PreLoad.prototype.destroy = function (oControlHost) {
    console.log("[PreLoad] 🧨 destroy() called");

    if (oControlHost.control && typeof oControlHost.control.destroy === "function") {
      oControlHost.control.destroy();
    }
  };

  return PreLoad;
});
