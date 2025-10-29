define([], function () {
  "use strict";

  function PreLoad() {
    console.log("[PreLoad] 🏗 Constructor called");
    this.control = null;
  }

  PreLoad.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[PreLoad] 🔧 initialize() called");

    const config = oControlHost.configuration || {};
    const basePaths = config.BaseScriptPaths || {};
    const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPageGH/";

    // === Inject CSS ===
    const cssPath = basePaths.LeftPaneCSS || fallbackBase + "LeftPane.css";
    this.injectCSS(cssPath);

    // === Load CustomPromptPage.js ===
    const customPromptPath = basePaths.CustomPromptPage || fallbackBase + "CustomPromptPage.js";
    console.log(`[PreLoad] 🚀 Loading CustomPromptPage from: ${customPromptPath}`);

    const self = this;
    require([customPromptPath], function (CustomPromptPage) {
      console.log("[PreLoad] ✅ CustomPromptPage loaded");

      try {
        self.control = new CustomPromptPage();
        if (typeof self.control.initialize === "function") {
          self.control.initialize(oControlHost, fnDoneInitializing);
        } else {
          console.warn("[PreLoad] ⚠️ CustomPromptPage has no initialize() method");
          fnDoneInitializing();
        }
      } catch (err) {
        console.error("[PreLoad] ❌ Error initializing CustomPromptPage:", err);
        fnDoneInitializing();
      }
    }, function (err) {
      console.error("[PreLoad] ❌ Failed to load CustomPromptPage:", err);
      fnDoneInitializing();
    });
  };

  /**
   * Inject CSS dynamically. Works with both local (relative) and external URLs.
   */
  PreLoad.prototype.injectCSS = function (cssUrl) {
    try {
      // If CSS is a remote URL (starts with http/https), inject <link>
      if (/^https?:\/\//i.test(cssUrl)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        link.type = "text/css";
        document.head.appendChild(link);
        console.log("[PreLoad] ✅ External CSS linked from:", cssUrl);
        return;
      }

      // Otherwise, try RequireJS text plugin for local CSS files
      require(["text!" + cssUrl], function (cssContent) {
        const style = document.createElement("style");
        style.textContent = cssContent;
        document.head.appendChild(style);
        console.log("[PreLoad] ✅ Local CSS injected from:", cssUrl);
      }, function (err) {
        console.error("[PreLoad] ❌ Failed to load local CSS via require:", err);
      });
    } catch (e) {
      console.error("[PreLoad] ❌ Failed to inject CSS:", e);
    }
  };

  PreLoad.prototype.draw = function (oControlHost) {
    console.log("[PreLoad] 🖼 draw() called");

    if (this.control && typeof this.control.draw === "function") {
      this.control.draw(oControlHost);
    } else {
      console.warn("[PreLoad] ⚠️ draw() skipped — control not ready");
    }
  };

  PreLoad.prototype.destroy = function (oControlHost) {
    console.log("[PreLoad] 🧨 destroy() called");

    if (this.control && typeof this.control.destroy === "function") {
      this.control.destroy();
    }
  };

  return PreLoad;
});
