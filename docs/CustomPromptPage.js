define([], function () {
  "use strict";

  console.log("[CustomPromptPage] === Module Loaded ===");

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════
  function CustomPromptPage() {
    console.log("[CustomPromptPage] 🏗 Constructor called");
    this.domNode = null;
    this.leftPane = null;
    this.rightPane = null;
    this.dragDrop = null;
    this.m_oControlHost = null; // Store for later use

    // ❌ DO NOT BIND HERE - it breaks the oControlHost parameter signature!
    // Cognos needs to pass oControlHost as first parameter
    // The methods are on the prototype, 'this' will work fine when called
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[CustomPromptPage] 🔧 initialize() called");
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);

    try {
      // Create main container
      this.domNode = document.createElement("div");
      this.domNode.className = "custom-prompt-page-container";
      console.log("[CustomPromptPage] 📦 DOM node created:", this.domNode);

      // Read config
      const config = oControlHost.configuration || {};
      console.log("[CustomPromptPage] ⚙️ Raw configuration received:", config);
      console.log("[CustomPromptPage] 🔍 buttonGroups:", config.buttonGroups);

      const basePaths = config.BaseScriptPaths || {};
      const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPage/";
      console.log("[CustomPromptPage] 🧩 BaseScriptPaths detected:", basePaths);
      console.log("[CustomPromptPage] 🧩 Fallback BaseScriptPath:", fallbackBase);

      // Determine final paths
      const LeftPanePath = basePaths.LeftPane || fallbackBase + "LeftPane.js";
      const RightPanePath = basePaths.RightPane || fallbackBase + "RightPane.js";
      const DragDropPath = basePaths.DragDrop || fallbackBase + "DragNDrop.js";

      console.log("[CustomPromptPage] ✅ Computed module paths:", {
        LeftPanePath,
        RightPanePath,
        DragDropPath,
      });

      // --- Load LeftPane first
      console.log(`[CustomPromptPage] 🚀 Loading LeftPane from: ${LeftPanePath}`);
      require([LeftPanePath], (LeftPane) => {
        console.log(`[CustomPromptPage] ✅ LeftPane loaded from: ${LeftPanePath}`);

        this.leftPane = new LeftPane();
        console.log("[CustomPromptPage] 🧱 LeftPane instance created");

        this.leftPane.initialize(oControlHost, () => {
          console.log("[CustomPromptPage] ✅ LeftPane initialized");

          // --- Now load RightPane
          console.log(`[CustomPromptPage] 🚀 Loading RightPane from: ${RightPanePath}`);
          require([RightPanePath], (RightPane) => {
            console.log(`[CustomPromptPage] ✅ RightPane loaded from: ${RightPanePath}`);

            this.rightPane = new RightPane();
            console.log("[CustomPromptPage] 🧱 RightPane instance created");

            this.rightPane.initialize(oControlHost, () => {
              console.log("[CustomPromptPage] ✅ RightPane initialized");

              // --- Now load DragDrop with BOTH panes ready
              console.log(`[CustomPromptPage] 🚀 Loading DragDrop from: ${DragDropPath}`);
              require([DragDropPath], (DragDrop) => {
                console.log(`[CustomPromptPage] ✅ DragDrop loaded from: ${DragDropPath}`);

                this.dragDrop = new DragDrop();
                console.log("[CustomPromptPage] 🧱 DragDrop instance created");

                // CRITICAL: Set the panes BEFORE initializing
                this.dragDrop.leftPane = this.leftPane;
                this.dragDrop.rightPane = this.rightPane;
                console.log("[CustomPromptPage] 🔗 Panes assigned to DragDrop");

                this.dragDrop.initialize(oControlHost, () => {
                  console.log("[CustomPromptPage] ✅ DragDrop initialized");
                  console.log("[CustomPromptPage] ✅ All modules loaded successfully");

                  fnDoneInitializing();
                });
              }, (err) => {
                console.warn("[CustomPromptPage] ⚠️ DragDrop failed to load:", err);
                fnDoneInitializing();
              });
            });
          }, (err) => {
            console.error("[CustomPromptPage] ❌ RightPane failed to load:", err);
            fnDoneInitializing();
          });
        });
      }, (err) => {
        console.error("[CustomPromptPage] ❌ LeftPane failed to load:", err);
        fnDoneInitializing();
      });
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Fatal error during initialize():", err);
      fnDoneInitializing();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.draw = function (oControlHost) {
    console.log("[CustomPromptPage] 🖼 draw() called");

    try {
      this.m_oControlHost = oControlHost;
      console.log("[CustomPromptPage] 💾 Stored oControlHost");

      // Simple parameter detection from config
      const config = oControlHost.configuration || {};

      if (config.buttonGroups && Array.isArray(config.buttonGroups)) {
        const allParamNames = new Set();

        config.buttonGroups.forEach((group) => {
          if (group.buttons && Array.isArray(group.buttons)) {
            group.buttons.forEach((btn) => {
              if (btn.paramName) {
                allParamNames.add(btn.paramName);
              }
            });
          }
        });

        console.log("[CustomPromptPage] 📋 Parameters in config:", Array.from(allParamNames));
      }

      if (!this.domNode) {
        console.warn("[CustomPromptPage] ⚠️ domNode not initialized, aborting draw");
        return;
      }

      this.domNode.innerHTML = "";
      console.log("[CustomPromptPage] 🧹 Cleared previous DOM content");

      const layout = document.createElement("div");
      layout.className = "custom-prompt-layout";
      layout.style.display = "flex";
      layout.style.width = "100%";
      layout.style.height = "100%";

      if (this.leftPane && this.leftPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing LeftPane...");
        this.leftPane.draw(oControlHost);
        layout.appendChild(this.leftPane.domNode);
      }

      if (this.rightPane && this.rightPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing RightPane...");
        this.rightPane.draw(oControlHost);
        layout.appendChild(this.rightPane.domNode);
      }

      this.domNode.appendChild(layout);
      oControlHost.container.appendChild(this.domNode);
      console.log("[CustomPromptPage] ✅ Layout rendered successfully");

      if (this.dragDrop && typeof this.dragDrop.draw === "function") {
        console.log("[CustomPromptPage] 🔗 Setting up DragDrop handlers");
        this.dragDrop.draw();
      }

      console.log("[CustomPromptPage] 🔍 VERIFICATION after draw() complete:");
      console.log("[CustomPromptPage] 🔍   this.rightPane exists:", !!this.rightPane);
      console.log(
        "[CustomPromptPage] 🔍   this.rightPane.getParameters exists:",
        !!(this.rightPane && typeof this.rightPane.getParameters === "function")
      );
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GET PARAMETERS (Called by Cognos on FINISH button)
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.getParameters = function (oControlHost) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[CustomPromptPage] 🚨🚨🚨 COGNOS CALLED getParameters()!!! 🚨🚨🚨");
    console.log("[CustomPromptPage] 📋 Timestamp:", new Date().toISOString());
    console.log("[CustomPromptPage] 📋 Stack trace:", new Error().stack);

    // Log what we received
    console.log("[CustomPromptPage] 🔍 oControlHost received:", oControlHost);
    console.log("[CustomPromptPage] 🔍 oControlHost type:", typeof oControlHost);

    if (oControlHost) {
      console.log("[CustomPromptPage] ✅ oControlHost exists");
      console.log("[CustomPromptPage] 🔍 oControlHost.configuration:", oControlHost.configuration);
    } else {
      console.warn("[CustomPromptPage] ⚠️ oControlHost is null/undefined - using stored m_oControlHost");
      oControlHost = this.m_oControlHost;
    }

    // Check our state
    console.log("[CustomPromptPage] 🔍 Checking internal state...");
    console.log("[CustomPromptPage] 🔍 this exists:", !!this);
    console.log("[CustomPromptPage] 🔍 this.rightPane exists:", !!this.rightPane);
    console.log(
      "[CustomPromptPage] 🔍 this.rightPane.getParameters exists:",
      !!(this.rightPane && typeof this.rightPane.getParameters === "function")
    );

    try {
      if (this.rightPane && typeof this.rightPane.getParameters === "function") {
        console.log("[CustomPromptPage] ✅ RightPane found with getParameters() method");
        console.log("[CustomPromptPage] 📞 Calling this.rightPane.getParameters()...");

        const params = this.rightPane.getParameters();

        console.log("[CustomPromptPage] 📦 Parameters received from RightPane");
        console.log("[CustomPromptPage] 📦 Return type:", typeof params);
        console.log("[CustomPromptPage] 📦 Is array:", Array.isArray(params));
        console.log("[CustomPromptPage] 📦 Is null:", params === null);

        if (params) {
          console.log("[CustomPromptPage] 📦 Parameters count:", Array.isArray(params) ? params.length : "N/A");
          console.log("[CustomPromptPage] 📦 Parameters JSON:", JSON.stringify(params, null, 2));

          // Validate structure
          if (Array.isArray(params) && params.length > 0) {
            params.forEach((param, idx) => {
              console.log(`[CustomPromptPage] 🔍 Parameter ${idx}:`);
              console.log(`[CustomPromptPage] 🔍   - parameter name:`, param.parameter);
              console.log(`[CustomPromptPage] 🔍   - values array:`, param.values);
              console.log(`[CustomPromptPage] 🔍   - values count:`, param.values ? param.values.length : 0);

              if (param.values && param.values.length > 0) {
                param.values.forEach((val, vIdx) => {
                  console.log(`[CustomPromptPage] 🔍     Value ${vIdx}:`, val);
                  console.log(`[CustomPromptPage] 🔍       - use:`, val.use);
                  console.log(`[CustomPromptPage] 🔍       - display:`, val.display);
                });
              }
            });

            console.log("[CustomPromptPage] 📤 RETURNING parameters to Cognos:", params);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return params;
          } else {
            console.warn("[CustomPromptPage] ⚠️ Parameters array is empty");
          }
        } else {
          console.warn("[CustomPromptPage] ⚠️ Parameters are null");
        }
      } else {
        console.error("[CustomPromptPage] ❌ RightPane not available or missing getParameters()");
        console.log("[CustomPromptPage] 🔍 this.rightPane:", this.rightPane);
        console.log(
          "[CustomPromptPage] 🔍 Available methods on this.rightPane:",
          this.rightPane ? Object.keys(this.rightPane) : "N/A"
        );
      }
    } catch (err) {
      console.error("[CustomPromptPage] ❌ getParameters() failed with error:");
      console.error("[CustomPromptPage] ❌ Error message:", err.message);
      console.error("[CustomPromptPage] ❌ Error stack:", err.stack);
    }

    console.warn("[CustomPromptPage] ⚠️ Returning null (no valid parameters)");
    console.log("[CustomPromptPage] 📤 RETURNING null to Cognos");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return null; // ← As per official docs, return null when no parameters
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // IS IN VALID STATE
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.isInValidState = function (oControlHost) {
    console.log("[CustomPromptPage] 🔍 isInValidState() called");
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);

    // You can add validation logic here
    // For now, always return true (control is valid)
    return true;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SET DATA
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.setData = function (oControlHost, oDataStore) {
    console.log("[CustomPromptPage] 📊 setData() called");
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);
    console.log("[CustomPromptPage] 🔍 oDataStore:", oDataStore);
    this.dataStore = oDataStore;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.destroy = function (oControlHost) {
    console.log("[CustomPromptPage] 🧨 destroy() called");
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);

    try {
      if (this.dragDrop && typeof this.dragDrop.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying DragDrop...");
        this.dragDrop.destroy();
        this.dragDrop = null;
      }

      if (this.leftPane && typeof this.leftPane.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying LeftPane...");
        this.leftPane.destroy();
        this.leftPane = null;
      }

      if (this.rightPane && typeof this.rightPane.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying RightPane...");
        this.rightPane.destroy();
        this.rightPane = null;
      }

      if (this.domNode && this.domNode.parentNode) {
        console.log("[CustomPromptPage] 🧨 Removing DOM node...");
        this.domNode.parentNode.removeChild(this.domNode);
      }

      this.m_oControlHost = null;

      console.log("[CustomPromptPage] ✅ destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during destroy():", err);
    }
  };

  return CustomPromptPage;
});
