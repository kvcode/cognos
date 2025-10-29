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
    this.leftPaneReady = false;
    this.rightPaneReady = false;
  }

  // === Initialization ===
  CustomPromptPage.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[CustomPromptPage] 🔧 initialize() called");

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

      // --- Load LeftPane first (mandatory)
      console.log(`[CustomPromptPage] 🚀 Attempting to load LeftPane from: ${LeftPanePath}`);
      require([LeftPanePath], (LeftPane) => {
        console.log(`[CustomPromptPage] ✅ LeftPane module loaded successfully from: ${LeftPanePath}`);
        try {
          this.leftPane = new LeftPane();
          console.log("[CustomPromptPage] 🧱 LeftPane instance created:", this.leftPane);

          this.leftPane.initialize(oControlHost, () => {
            console.log("[CustomPromptPage] ✅ LeftPane initialized successfully");
            this.leftPaneReady = true;

            // ✨ NEW: Load RightPane after LeftPane
            this.tryLoadOtherModules(oControlHost, fnDoneInitializing, {
              RightPanePath,
              DragDropPath,
            });
          });
        } catch (initErr) {
          console.error("[CustomPromptPage] ❌ Error initializing LeftPane:", initErr);
          fnDoneInitializing();
        }
      }, (err) => {
        console.error("[CustomPromptPage] ❌ Failed to load LeftPane module:", err);
        fnDoneInitializing();
      });
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Fatal error during initialize():", err);
      fnDoneInitializing();
    }
  };

  // === Try to Initialize DragDrop ===
  CustomPromptPage.prototype.tryInitializeDragDrop = function (oControlHost, fnDoneInitializing, DragDropPath) {
    if (this.leftPaneReady && this.rightPaneReady) {
      console.log("[CustomPromptPage] 🔄 Both panes ready, loading DragDrop");

      require([DragDropPath], (DragDrop) => {
        console.log(`[CustomPromptPage] ✅ DragDrop module loaded successfully from: ${DragDropPath}`);
        try {
          this.dragDrop = new DragDrop();
          console.log("[CustomPromptPage] 🧱 DragDrop instance created:", this.dragDrop);

          // ✨ Connect panes to DragDrop
          this.dragDrop.leftPane = this.leftPane;
          this.dragDrop.rightPane = this.rightPane;

          this.dragDrop.initialize(oControlHost, () => {
            console.log("[CustomPromptPage] ✅ DragDrop initialized successfully");

            // Draw DragDrop (sets up handlers)
            if (typeof this.dragDrop.draw === "function") {
              this.dragDrop.draw();
              console.log("[CustomPromptPage] ✅ DragDrop.draw() called");
            }

            // Call final callback
            if (fnDoneInitializing) {
              fnDoneInitializing();
            }
          });
        } catch (err) {
          console.error("[CustomPromptPage] ❌ Error initializing DragDrop:", err);
          if (fnDoneInitializing) {
            fnDoneInitializing();
          }
        }
      }, (err) => {
        console.warn("[CustomPromptPage] ⚠️ DragDrop module NOT found or failed to load:", err);
        if (fnDoneInitializing) {
          fnDoneInitializing();
        }
      });
    } else {
      console.log("[CustomPromptPage] ⏳ Waiting for both panes to be ready...");
    }
  };

  // === Load Remaining Modules ===
  CustomPromptPage.prototype.tryLoadOtherModules = function (oControlHost, fnDoneInitializing, paths) {
    console.log("[CustomPromptPage] 🔄 tryLoadOtherModules() called with paths:", paths);

    const { RightPanePath, DragDropPath } = paths;

    console.log(`[CustomPromptPage] 🚀 Attempting to load RightPane from: ${RightPanePath}`);
    require([RightPanePath], (RightPane) => {
      console.log(`[CustomPromptPage] ✅ RightPane module loaded successfully from: ${RightPanePath}`);
      try {
        this.rightPane = new RightPane();
        console.log("[CustomPromptPage] 🧱 RightPane instance created:", this.rightPane);

        this.rightPane.initialize(oControlHost, () => {
          console.log("[CustomPromptPage] ✅ RightPane initialized successfully");
          this.rightPaneReady = true;

          // Now try to load DragDrop
          this.tryInitializeDragDrop(oControlHost, fnDoneInitializing, DragDropPath);
        });
      } catch (err) {
        console.error("[CustomPromptPage] ❌ Error initializing RightPane:", err);
        if (fnDoneInitializing) {
          fnDoneInitializing();
        }
      }
    }, (err) => {
      console.warn("[CustomPromptPage] ⚠️ RightPane module NOT found or failed to load:", err);
      if (fnDoneInitializing) {
        fnDoneInitializing();
      }
    });
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
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
    }
  };

  // ✨ NEW: Get Parameters (Cognos will call this)
  CustomPromptPage.prototype.getParameters = function () {
    console.log("[CustomPromptPage] 📋 getParameters() called by Cognos");

    try {
      // Check if RightPane exists and has getParameters method
      if (this.rightPane && typeof this.rightPane.getParameters === "function") {
        const params = this.rightPane.getParameters();
        console.log("[CustomPromptPage] 📤 Returning parameters from RightPane:", params);
        return params;
      } else {
        console.warn("[CustomPromptPage] ⚠️ RightPane not available or missing getParameters()");
        return [];
      }
    } catch (err) {
      console.error("[CustomPromptPage] ❌ getParameters() failed:", err);
      return [];
    }
  };

  // === Destroy ===
  CustomPromptPage.prototype.destroy = function () {
    console.log("[CustomPromptPage] 🧨 destroy() called");

    try {
      if (this.leftPane) {
        this.leftPane.destroy();
        this.leftPane = null;
      }
      if (this.rightPane) {
        this.rightPane.destroy();
        this.rightPane = null;
      }
      if (this.dragDrop) {
        this.dragDrop.destroy();
        this.dragDrop = null;
      }
      if (this.domNode && this.domNode.parentNode) {
        this.domNode.parentNode.removeChild(this.domNode);
      }

      this.leftPaneReady = false;
      this.rightPaneReady = false;

      console.log("[CustomPromptPage] ✅ destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during destroy():", err);
    }
  };

  return CustomPromptPage;
});
