define([], function () {
  "use strict";
  function PreLoad() {
    console.log("[PreLoad] 🏗 Constructor called");
    this.control = null;

    // ⚠️ CRITICAL DEBUG: Check if methods exist at construction time
    console.log("[PreLoad] Constructor - typeof this.getParameters:", typeof this.getParameters);
    console.log("[PreLoad] Constructor - typeof this.isInValidState:", typeof this.isInValidState);
    console.log("[PreLoad] Constructor - typeof this.setData:", typeof this.setData);
    console.log("[PreLoad] Constructor - typeof this.draw:", typeof this.draw);
    console.log("[PreLoad] Constructor - typeof this.destroy:", typeof this.destroy);
  }
  PreLoad.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[PreLoad] 🔧 initialize() called");
    const config = oControlHost.configuration || {};
    const basePaths = config.BaseScriptPaths || {};
    const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPage/";
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

  // GET PARAMETERS WITH MAX TRACEABILITY
  PreLoad.prototype.getParameters = function (oControlHost) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[PreLoad] 🚨🚨🚨 getParameters() CALLED BY COGNOS!!!");
    console.log("[PreLoad] 📋 Timestamp:", new Date().toISOString());
    console.log("[PreLoad] 📋 Stack trace:", new Error().stack);

    // Log the oControlHost parameter
    console.log("[PreLoad] 🔍 oControlHost received:", oControlHost);
    console.log("[PreLoad] 🔍 oControlHost type:", typeof oControlHost);

    if (oControlHost) {
      console.log("[PreLoad] ✅ oControlHost exists");
      console.log("[PreLoad] 🔍 oControlHost.configuration:", oControlHost.configuration);
      console.log("[PreLoad] 🔍 oControlHost.container:", oControlHost.container);
      console.log("[PreLoad] 🔍 oControlHost.control:", oControlHost.control);
    } else {
      console.warn("[PreLoad] ⚠️ oControlHost is null/undefined!");
    }

    // Check if control exists
    console.log("[PreLoad] 🔍 Checking this.control...");
    console.log("[PreLoad] 🔍 this.control exists:", !!this.control);
    console.log("[PreLoad] 🔍 this.control type:", typeof this.control);

    if (this.control) {
      console.log("[PreLoad] ✅ Control instance found");
      console.log("[PreLoad] 🔍 this.control.getParameters exists:", !!this.control.getParameters);
      console.log("[PreLoad] 🔍 this.control.getParameters type:", typeof this.control.getParameters);

      if (typeof this.control.getParameters === "function") {
        console.log("[PreLoad] ✅ Delegating to CustomPromptPage.getParameters()");
        console.log("[PreLoad] 📞 Calling this.control.getParameters(oControlHost)...");

        try {
          const params = this.control.getParameters(oControlHost);

          console.log("[PreLoad] 📦 Parameters received from CustomPromptPage");
          console.log("[PreLoad] 📦 Return value type:", typeof params);
          console.log("[PreLoad] 📦 Return value is array:", Array.isArray(params));
          console.log("[PreLoad] 📦 Return value is null:", params === null);

          if (params) {
            console.log("[PreLoad] 📦 Parameters count:", Array.isArray(params) ? params.length : "N/A");
            console.log("[PreLoad] 📦 Parameters JSON:", JSON.stringify(params, null, 2));

            // Validate structure
            if (Array.isArray(params) && params.length > 0) {
              params.forEach((param, idx) => {
                console.log(`[PreLoad] 🔍 Parameter ${idx}:`);
                console.log(`[PreLoad] 🔍   - parameter name:`, param.parameter);
                console.log(`[PreLoad] 🔍   - values:`, param.values);
                console.log(`[PreLoad] 🔍   - values count:`, param.values ? param.values.length : 0);
              });
            }
          } else {
            console.log("[PreLoad] 📦 Parameters are null/undefined");
          }

          console.log("[PreLoad] 📤 RETURNING to Cognos:", params);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return params;
        } catch (err) {
          console.error("[PreLoad] ❌ ERROR calling control.getParameters():");
          console.error("[PreLoad] ❌ Error message:", err.message);
          console.error("[PreLoad] ❌ Error stack:", err.stack);
          console.log("[PreLoad] 📤 RETURNING null due to error");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return null;
        }
      } else {
        console.error("[PreLoad] ❌ this.control.getParameters is NOT a function!");
        console.log("[PreLoad] 🔍 Available methods on this.control:", Object.keys(this.control));
      }
    } else {
      console.error("[PreLoad] ❌ this.control does not exist!");
      console.log("[PreLoad] 🔍 this object keys:", Object.keys(this));
    }

    console.warn("[PreLoad] ⚠️ Control not ready or method missing - returning null");
    console.log("[PreLoad] 📤 RETURNING null to Cognos");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return null; // ← Changed from [] to null as per official docs
  };

  // ✨✨✨ CORRECT: PreLoad methods (NOT CustomPromptPage!) ✨✨✨

  PreLoad.prototype.isInValidState = function () {
    console.log("[PreLoad] 🔍 isInValidState() called");

    if (this.control && typeof this.control.isInValidState === "function") {
      console.log("[PreLoad] ✅ Delegating to CustomPromptPage.isInValidState()");
      return this.control.isInValidState();
    }

    console.log("[PreLoad] ✅ Control is valid (default)");
    return true;
  };

  PreLoad.prototype.setData = function (oControlHost, oDataStore) {
    console.log("[PreLoad] 📊 setData() called");

    if (this.control && typeof this.control.setData === "function") {
      console.log("[PreLoad] ✅ Delegating to CustomPromptPage.setData()");
      this.control.setData(oControlHost, oDataStore);
    } else {
      console.log("[PreLoad] ⚠️ setData() skipped — control not ready");
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
