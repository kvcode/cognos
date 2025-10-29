define([
  "text!./LeftPane.css"
], function(css) {
  "use strict";

  console.log("[CustomPromptPage] === Module Loaded ===");

  // === Inject CSS ===
  try {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    console.log("[CustomPromptPage] âœ… CSS injected successfully");
  } catch (e) {
    console.error("[CustomPromptPage] âŒ Failed to inject CSS:", e);
  }

  // === Constructor ===
  function CustomPromptPage() {
    console.log("[CustomPromptPage] ðŸ— Constructor called");
    this.domNode = null;
    this.leftPane = null;
    this.rightPane = null;
    this.dragDrop = null;
    this.leftPaneReady = false;  // Flag for LeftPane initialization
    this.rightPaneReady = false; // Flag for RightPane initialization
  }

  // === Initialization ===
  CustomPromptPage.prototype.initialize = function(oControlHost, fnDoneInitializing) {
    console.log("[CustomPromptPage] ðŸ”§ initialize() called");

    try {
      // Create main container
      this.domNode = document.createElement("div");
      this.domNode.className = "custom-prompt-page-container";
      console.log("[CustomPromptPage] ðŸ“¦ DOM node created:", this.domNode);

      // Read config
      const config = oControlHost.configuration || {};
      console.log("[CustomPromptPage] âš™ï¸ Raw configuration received:", config);

      const basePaths = config.BaseScriptPaths || {};
      const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPage/";
      console.log("[CustomPromptPage] ðŸ§© BaseScriptPaths detected:", basePaths);
      console.log("[CustomPromptPage] ðŸ§© Fallback BaseScriptPath:", fallbackBase);

      // Determine final paths
      const LeftPanePath = basePaths.LeftPane || (fallbackBase + "LeftPane.js");
      const RightPanePath = basePaths.RightPane || (fallbackBase + "RightPane.js");
      const DragDropPath = basePaths.DragDrop || (fallbackBase + "DragNDrop.js");

      console.log("[CustomPromptPage] âœ… Computed module paths:", {
        LeftPanePath,
        RightPanePath,
        DragDropPath
      });

      // --- Load LeftPane first (mandatory)
      console.log(`[CustomPromptPage] ðŸš€ Attempting to load LeftPane from: ${LeftPanePath}`);
      require([LeftPanePath], (LeftPane) => {
        console.log(`[CustomPromptPage] âœ… LeftPane module loaded successfully from: ${LeftPanePath}`);
        try {
          this.leftPane = new LeftPane();
          console.log("[CustomPromptPage] ðŸ§± LeftPane instance created:", this.leftPane);

          this.leftPane.initialize(oControlHost, () => {
            console.log("[CustomPromptPage] âœ… LeftPane initialized successfully");
            this.leftPaneReady = true;
            this.tryInitializeDragDrop(oControlHost, fnDoneInitializing, DragDropPath);
          });
        } catch (initErr) {
          console.error("[CustomPromptPage] âŒ Error initializing LeftPane:", initErr);
          fnDoneInitializing();
        }
      }, (err) => {
        console.error("[CustomPromptPage] âŒ Failed to load LeftPane module:", err);
        fnDoneInitializing();
      });

    } catch (err) {
      console.error("[CustomPromptPage] âŒ Fatal error during initialize():", err);
      fnDoneInitializing();
    }
  };

  // === Try to Initialize DragDrop ===
  CustomPromptPage.prototype.tryInitializeDragDrop = function(oControlHost, fnDoneInitializing, DragDropPath) {
    // Load RightPane only when LeftPane is ready
    if (this.leftPaneReady) {
      console.log("[CustomPromptPage] ðŸ”„ Attempting to load RightPane after LeftPane is initialized");

      require([DragDropPath], (DragDrop) => {
        console.log(`[CustomPromptPage] âœ… DragDrop module loaded successfully from: ${DragDropPath}`);
        try {
          this.dragDrop = new DragDrop();
          console.log("[CustomPromptPage] ðŸ§± DragDrop instance created:", this.dragDrop);

          this.dragDrop.initialize(oControlHost, () => {
            console.log("[CustomPromptPage] âœ… DragDrop initialized successfully");

            // Connect Left & Right
            if (this.leftPane && this.rightPane) {
              console.log("[CustomPromptPage] ðŸ”— Connecting LeftPane & RightPane via DragDrop");
              this.dragDrop.connectPanes(this.leftPane, this.rightPane, oControlHost);
            }
          });
        } catch (err) {
          console.error("[CustomPromptPage] âŒ Error initializing DragDrop:", err);
        }
      }, (err) => {
        console.warn("[CustomPromptPage] âš ï¸ DragDrop module NOT found or failed to load:", err);
      });
    }
  };

  // === Load Remaining Modules ===
  CustomPromptPage.prototype.tryLoadOtherModules = function(oControlHost, fnDoneInitializing, paths) {
    console.log("[CustomPromptPage] ðŸ”„ tryLoadOtherModules() called with paths:", paths);

    const { RightPanePath } = paths;

    // --- Load RightPane only if it's not already loaded
    console.log(`[CustomPromptPage] ðŸš€ Attempting to load RightPane from: ${RightPanePath}`);
    require([RightPanePath], (RightPane) => {
      console.log(`[CustomPromptPage] âœ… RightPane module loaded successfully from: ${RightPanePath}`);
      try {
        this.rightPane = new RightPane();
        console.log("[CustomPromptPage] ðŸ§± RightPane instance created:", this.rightPane);

        this.rightPane.initialize(oControlHost, () => {
          console.log("[CustomPromptPage] âœ… RightPane initialized successfully");
          this.rightPaneReady = true;
          this.tryInitializeDragDrop(oControlHost, fnDoneInitializing, paths.DragDropPath);
        });
      } catch (err) {
        console.error("[CustomPromptPage] âŒ Error initializing RightPane:", err);
      }
    }, (err) => {
      console.warn("[CustomPromptPage] âš ï¸ RightPane module NOT found or failed to load:", err);
    });
  };

  // === Draw ===
  CustomPromptPage.prototype.draw = function(oControlHost) {
    console.log("[CustomPromptPage] ðŸ–¼ draw() called");

    try {
      if (!this.domNode) {
        console.warn("[CustomPromptPage] âš ï¸ domNode not initialized, aborting draw");
        return;
      }

      // Clear content
      this.domNode.innerHTML = "";
      console.log("[CustomPromptPage] ðŸ§¹ Cleared previous DOM content");

      // Create layout flexbox
      const layout = document.createElement("div");
      layout.className = "custom-prompt-layout";

      // Append LeftPane
      if (this.leftPane && this.leftPane.domNode) {
        console.log("[CustomPromptPage] ðŸ§© Drawing LeftPane...");
        this.leftPane.draw(oControlHost);
        layout.appendChild(this.leftPane.domNode);
      }

      // Append RightPane
      if (this.rightPane && this.rightPane.domNode) {
        console.log("[CustomPromptPage] ðŸ§© Drawing RightPane...");
        this.rightPane.draw(oControlHost);
        layout.appendChild(this.rightPane.domNode);
      }

      this.domNode.appendChild(layout);
      oControlHost.container.appendChild(this.domNode);
      console.log("[CustomPromptPage] âœ… Layout rendered successfully");
    } catch (err) {
      console.error("[CustomPromptPage] âŒ Error during draw():", err);
    }
  };

  // === Destroy ===
  CustomPromptPage.prototype.destroy = function() {
    console.log("[CustomPromptPage] ðŸ§¨ destroy() called");

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
      console.log("[CustomPromptPage] âœ… destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] âŒ Error during destroy():", err);
    }
  };

  return CustomPromptPage;
});
