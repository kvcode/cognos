define([], function () {
  "use strict";

  console.log("[CustomPromptPage] === Module Loaded ===");

  // === Constructor ===
  function CustomPromptPage() {
    console.log("[CustomPromptPage] 🏗 Constructor called");
    this.domNode = null;
    this.leftPane = null;
    this.rightPane = null;
    this.dragDrop = null;
  }

  // === Initialization ===
  CustomPromptPage.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[CustomPromptPage] 🔧 initialize() called");

    // 🔒 CRITICAL: Bind methods to preserve context
    this.getParameters = this.getParameters.bind(this);
    console.log("[CustomPromptPage] 🔗 getParameters() bound to 'this'");

    // === 🎯 CRITICAL FIX: Monkey-patch PreLoad.prototype.getParameters ===
    console.log("[CustomPromptPage] 🔧 Patching PreLoad.prototype to add getParameters()");

    // Get reference to PreLoad constructor through the control host
    if (oControlHost && oControlHost.control && oControlHost.control.constructor) {
      const PreLoadConstructor = oControlHost.control.constructor;

      // Add getParameters method to PreLoad prototype
      if (!PreLoadConstructor.prototype.getParameters) {
        PreLoadConstructor.prototype.getParameters = function () {
          console.log("[PreLoad] 🚨 getParameters() called by Cognos!");
          console.log("[PreLoad] 🔍 this.control exists:", !!this.control);

          if (this.control && typeof this.control.getParameters === "function") {
            console.log("[PreLoad] ✅ Delegating to CustomPromptPage.getParameters()");
            return this.control.getParameters();
          } else {
            console.warn("[PreLoad] ⚠️ control.getParameters not available, returning []");
            return [];
          }
        };
        console.log("[CustomPromptPage] ✅ PreLoad.prototype.getParameters added successfully!");
      } else {
        console.log("[CustomPromptPage] ℹ️ PreLoad.prototype.getParameters already exists");
      }
    } else {
      console.error("[CustomPromptPage] ❌ Cannot access PreLoad constructor for patching");
    }

    // 🔍 Check BEFORE modification (old monkey patch - keeping for debugging)
    console.log("[CustomPromptPage] 🔍 Checking oControlHost.control BEFORE modification:");
    console.log("[CustomPromptPage] 🔍   oControlHost.control =", oControlHost.control);
    console.log("[CustomPromptPage] 🔍   typeof oControlHost.control =", typeof oControlHost.control);
    console.log("[CustomPromptPage] 🔍   oControlHost.control is read-only, will add method instead");

    if (oControlHost.control && typeof oControlHost.control.getParameters === "function") {
      console.log("[CustomPromptPage] 🔍   oControlHost.control.getParameters EXISTS (before modification)");
    } else {
      console.log("[CustomPromptPage] 🔍   oControlHost.control.getParameters DOES NOT EXIST (before modification)");
    }

    // 🚨 MONKEY PATCH: Add our method to existing control object (old attempt - may not be needed now)
    try {
      oControlHost.control.getParameters = this.getParameters;
      console.log("[CustomPromptPage] ✅ Monkey-patched getParameters() onto oControlHost.control");
    } catch (patchErr) {
      console.error("[CustomPromptPage] ❌ Failed to add getParameters():", patchErr);
      console.log("[CustomPromptPage] 🔍 Attempting alternative: define property");

      try {
        Object.defineProperty(oControlHost.control, "getParameters", {
          value: this.getParameters,
          writable: false,
          enumerable: true,
          configurable: true,
        });
        console.log("[CustomPromptPage] ✅ Added getParameters() via defineProperty");
      } catch (defineErr) {
        console.error("[CustomPromptPage] ❌ defineProperty also failed:", defineErr);
        console.error("[CustomPromptPage] ❌❌❌ CANNOT REGISTER getParameters() - Cognos control is sealed!");
      }
    }

    // 🔍 Verify AFTER modification
    console.log("[CustomPromptPage] 🔍 Verifying AFTER modification:");
    console.log("[CustomPromptPage] 🔍   oControlHost.control =", oControlHost.control);
    console.log("[CustomPromptPage] 🔍   typeof oControlHost.control =", typeof oControlHost.control);
    console.log(
      "[CustomPromptPage] 🔍   typeof oControlHost.control.getParameters =",
      typeof oControlHost.control.getParameters
    );

    if (typeof oControlHost.control.getParameters === "function") {
      console.log("[CustomPromptPage] ✅✅✅ getParameters() IS ACCESSIBLE via oControlHost.control");
    } else {
      console.error("[CustomPromptPage] ❌❌❌ getParameters() NOT ACCESSIBLE via oControlHost.control!");
    }

    try {
      // Create main container
      this.domNode = document.createElement("div");
      this.domNode.className = "custom-prompt-page-container";
      console.log("[CustomPromptPage] 📦 DOM node created:", this.domNode);

      // Read config
      const config = oControlHost.configuration || {};
      console.log("[CustomPromptPage] ⚙️ Raw configuration received:", config);

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

                  // 🔍 Final verification after everything is loaded
                  console.log("[CustomPromptPage] 🔍 FINAL VERIFICATION after all modules loaded:");
                  console.log("[CustomPromptPage] 🔍   oControlHost.control =", oControlHost.control);
                  console.log(
                    "[CustomPromptPage] 🔍   typeof oControlHost.control.getParameters =",
                    typeof oControlHost.control.getParameters
                  );

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

  // === Draw ===
  CustomPromptPage.prototype.draw = function (oControlHost) {
    console.log("[CustomPromptPage] 🖼 draw() called");

    try {
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

      // Setup DragDrop handlers after panes are drawn
      if (this.dragDrop && typeof this.dragDrop.draw === "function") {
        console.log("[CustomPromptPage] 🔗 Setting up DragDrop handlers");
        this.dragDrop.draw();
      }

      // 🔍 Verification after draw
      console.log("[CustomPromptPage] 🔍 VERIFICATION after draw() complete:");
      console.log("[CustomPromptPage] 🔍   oControlHost.control =", oControlHost.control);
      console.log(
        "[CustomPromptPage] 🔍   typeof oControlHost.control.getParameters =",
        typeof oControlHost.control.getParameters
      );
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
    }
  };

  // ✨✨✨ NEW: Get Parameters (Cognos will call this on FINISH) ✨✨✨
  CustomPromptPage.prototype.getParameters = function () {
    // 🚨🚨🚨 CHECKPOINT: Cognos called this method 🚨🚨🚨
    console.log("[CustomPromptPage] 🚨🚨🚨 COGNOS CALLED getParameters()!!! 🚨🚨🚨");
    console.log("[CustomPromptPage] 🚨 Timestamp:", new Date().toISOString());
    console.log("[CustomPromptPage] 🚨 Stack trace:", new Error().stack);
    console.log("[CustomPromptPage] 🚨 this =", this);
    console.log("[CustomPromptPage] 🚨 this.rightPane =", this.rightPane);

    console.log("[CustomPromptPage] 📋 getParameters() called by Cognos");

    try {
      // Check if RightPane exists and has getParameters method
      if (this.rightPane && typeof this.rightPane.getParameters === "function") {
        console.log("[CustomPromptPage] ✅ RightPane found with getParameters() method");

        const params = this.rightPane.getParameters();

        console.log("[CustomPromptPage] 📦 Parameters received from RightPane:", JSON.stringify(params, null, 2));
        console.log("[CustomPromptPage] 📊 Number of parameters:", params.length);

        // Validate each parameter
        params.forEach((param, idx) => {
          console.log(`[CustomPromptPage] 🔍 Parameter ${idx}:`, param);
          console.log(`[CustomPromptPage] 🔍   - parameter name:`, param.parameter);
          console.log(`[CustomPromptPage] 🔍   - values:`, param.values);
        });

        console.log("[CustomPromptPage] 📤 Returning parameters to Cognos:", params);
        return params;
      } else {
        console.warn("[CustomPromptPage] ⚠️ RightPane not available or missing getParameters()");
        console.log("[CustomPromptPage] 🔍 this.rightPane:", this.rightPane);
        console.log(
          "[CustomPromptPage] 🔍 typeof this.rightPane.getParameters:",
          typeof (this.rightPane ? this.rightPane.getParameters : undefined)
        );
        console.log("[CustomPromptPage] 📤 Returning empty array to Cognos");
        return [];
      }
    } catch (err) {
      console.error("[CustomPromptPage] ❌ getParameters() failed with error:", err);
      console.error("[CustomPromptPage] ❌ Error stack:", err.stack);
      console.log("[CustomPromptPage] 📤 Returning empty array due to error");
      return [];
    }
  };

  // === Destroy ===
  CustomPromptPage.prototype.destroy = function () {
    console.log("[CustomPromptPage] 🧨 destroy() called");

    try {
      if (this.dragDrop) {
        this.dragDrop.destroy();
        this.dragDrop = null;
      }
      if (this.leftPane) {
        this.leftPane.destroy();
        this.leftPane = null;
      }
      if (this.rightPane) {
        this.rightPane.destroy();
        this.rightPane = null;
      }
      if (this.domNode && this.domNode.parentNode) {
        this.domNode.parentNode.removeChild(this.domNode);
      }
      console.log("[CustomPromptPage] ✅ destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during destroy():", err);
    }
  };

  return CustomPromptPage;
});
