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
   * Inject CSS dynamically.
   * Works with both local RequireJS paths and external URLs.
   */
  PreLoad.prototype.injectCSS = function (cssUrl) {
    try {
      // External CSS (absolute URL)
      if (/^https?:\/\//i.test(cssUrl)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        link.type = "text/css";
        document.head.appendChild(link);
        console.log("[PreLoad] ✅ External CSS linked from:", cssUrl);
        return;
      }
      // Local CSS (RequireJS text plugin)
      require(["text!" + cssUrl], function (cssContent) {
        const style = document.createElement("style");
        style.textContent = cssContent;
        document.head.appendChild(style);
        console.log("[PreLoad] ✅ Local CSS injected from:", cssUrl);
      }, function (err) {
        console.error("[PreLoad] ❌ Failed to load local CSS via RequireJS:", err);
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

  // ✨✨✨ NEW: getParameters method ✨✨✨
  PreLoad.prototype.getParameters = function () {
    console.log("[PreLoad] 🚨🚨🚨 getParameters() called by Cognos!");
    console.log("[PreLoad] 📋 Timestamp:", new Date().toISOString());

    if (this.control && typeof this.control.getParameters === "function") {
      console.log("[PreLoad] ✅ Delegating to CustomPromptPage.getParameters()");
      const params = this.control.getParameters();
      console.log("[PreLoad] 📤 Returning parameters:", JSON.stringify(params, null, 2));
      return params;
    } else {
      console.warn("[PreLoad] ⚠️ getParameters() skipped — control not ready or method missing");
      console.log("[PreLoad] 🔍 this.control exists:", !!this.control);
      console.log(
        "[PreLoad] 🔍 this.control.getParameters type:",
        typeof (this.control ? this.control.getParameters : undefined)
      );
      console.log("[PreLoad] 📤 Returning empty array []");
      return [];
    }
  };

  // ✨✨✨ ADD THESE TWO METHODS ✨✨✨

  CustomPromptPage.prototype.isInValidState = function () {
    console.log("[CustomPromptPage] 🔍 isInValidState() called");

    // Check if we have at least one card with a value
    if (this.rightPane && typeof this.rightPane.getParameters === "function") {
      const params = this.rightPane.getParameters();
      console.log("[CustomPromptPage] 📊 Current parameters:", params);

      // Valid if we have at least one parameter (or true if none required)
      const isValid = true; // Always valid - parameters are optional
      console.log("[CustomPromptPage] ✅ Control is valid:", isValid);
      return isValid;
    }

    console.log("[CustomPromptPage] ✅ Control is valid (default)");
    return true;
  };

  CustomPromptPage.prototype.setData = function (oControlHost, oDataStore) {
    console.log("[CustomPromptPage] 📊 setData() called");
    console.log("[CustomPromptPage] 📊 oControlHost:", oControlHost);
    console.log("[CustomPromptPage] 📊 oDataStore:", oDataStore);

    // You may not need this for your use case, but Cognos expects it
    // Store for future use if needed
    this.dataStore = oDataStore;
  };

  PreLoad.prototype.destroy = function (oControlHost) {
    console.log("[PreLoad] 🧨 destroy() called");
    if (this.control && typeof this.control.destroy === "function") {
      this.control.destroy();
    }
  };
  return PreLoad;
});
