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
      document.dispatchEvent(new Event("PromptPageReady"));
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
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
