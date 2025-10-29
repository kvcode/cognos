define(["text!./LeftPane.css"], function (css) {
  "use strict";

  console.log("[CustomPromptPage] === Module Loaded ===");

  // === Inject CSS ===
  try {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    console.log("[CustomPromptPage] ✅ CSS injected successfully");
  } catch (e) {
    console.error("[CustomPromptPage] ❌ Failed to inject CSS:", e);
  }

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
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);
    console.log("[CustomPromptPage] 🔍 fnDoneInitializing:", fnDoneInitializing);

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

      console.log("[CustomPromptPage] ✅ Computed module paths:");
      console.log("[CustomPromptPage]    LeftPanePath:", LeftPanePath);
      console.log("[CustomPromptPage]    RightPanePath:", RightPanePath);
      console.log("[CustomPromptPage]    DragDropPath:", DragDropPath);

      // STEP 1: Load LeftPane
      console.log("[CustomPromptPage] 🚀 STEP 1: Loading LeftPane from:", LeftPanePath);

      var self = this;
      require([LeftPanePath], function (LeftPane) {
        console.log("[CustomPromptPage] ✅ LeftPane module loaded successfully");
        console.log("[CustomPromptPage] 🔍 LeftPane constructor:", LeftPane);

        try {
          self.leftPane = new LeftPane();
          console.log("[CustomPromptPage] 🧱 LeftPane instance created:", self.leftPane);

          self.leftPane.initialize(oControlHost, function () {
            console.log("[CustomPromptPage] ✅ LeftPane initialized successfully");
            console.log("[CustomPromptPage] 🔍 self.leftPane after init:", self.leftPane);

            // STEP 2: Load RightPane
            console.log("[CustomPromptPage] 🚀 STEP 2: Loading RightPane from:", RightPanePath);

            require([RightPanePath], function (RightPane) {
              console.log("[CustomPromptPage] ✅ RightPane module loaded successfully");
              console.log("[CustomPromptPage] 🔍 RightPane constructor:", RightPane);

              try {
                self.rightPane = new RightPane();
                console.log("[CustomPromptPage] 🧱 RightPane instance created:", self.rightPane);

                self.rightPane.initialize(oControlHost, function () {
                  console.log("[CustomPromptPage] ✅ RightPane initialized successfully");
                  console.log("[CustomPromptPage] 🔍 self.rightPane after init:", self.rightPane);

                  // STEP 3: Load DragDrop
                  console.log("[CustomPromptPage] 🚀 STEP 3: Loading DragDrop from:", DragDropPath);

                  require([DragDropPath], function (DragDrop) {
                    console.log("[CustomPromptPage] ✅ DragDrop module loaded successfully");
                    console.log("[CustomPromptPage] 🔍 DragDrop constructor:", DragDrop);

                    try {
                      self.dragDrop = new DragDrop();
                      console.log("[CustomPromptPage] 🧱 DragDrop instance created:", self.dragDrop);

                      // CRITICAL: Assign panes BEFORE initializing
                      console.log("[CustomPromptPage] 🔗 Assigning panes to DragDrop...");
                      console.log(
                        "[CustomPromptPage] 🔍 Before assignment - dragDrop.leftPane:",
                        self.dragDrop.leftPane
                      );
                      console.log(
                        "[CustomPromptPage] 🔍 Before assignment - dragDrop.rightPane:",
                        self.dragDrop.rightPane
                      );

                      self.dragDrop.leftPane = self.leftPane;
                      self.dragDrop.rightPane = self.rightPane;

                      console.log("[CustomPromptPage] ✅ Panes assigned to DragDrop");
                      console.log(
                        "[CustomPromptPage] 🔍 After assignment - dragDrop.leftPane:",
                        self.dragDrop.leftPane
                      );
                      console.log(
                        "[CustomPromptPage] 🔍 After assignment - dragDrop.rightPane:",
                        self.dragDrop.rightPane
                      );

                      self.dragDrop.initialize(oControlHost, function () {
                        console.log("[CustomPromptPage] ✅ DragDrop initialized successfully");
                        console.log("[CustomPromptPage] 🎉 ALL MODULES LOADED AND INITIALIZED");
                        fnDoneInitializing();
                      });
                    } catch (dragDropInitErr) {
                      console.error("[CustomPromptPage] ❌ Error initializing DragDrop:", dragDropInitErr);
                      console.error("[CustomPromptPage] 🔍 Stack trace:", dragDropInitErr.stack);
                      fnDoneInitializing();
                    }
                  }, function (dragDropLoadErr) {
                    console.error("[CustomPromptPage] ❌ Failed to load DragDrop module:", dragDropLoadErr);
                    console.error("[CustomPromptPage] 🔍 Error details:", dragDropLoadErr);
                    fnDoneInitializing();
                  });
                });
              } catch (rightPaneInitErr) {
                console.error("[CustomPromptPage] ❌ Error initializing RightPane:", rightPaneInitErr);
                console.error("[CustomPromptPage] 🔍 Stack trace:", rightPaneInitErr.stack);
                fnDoneInitializing();
              }
            }, function (rightPaneLoadErr) {
              console.error("[CustomPromptPage] ❌ Failed to load RightPane module:", rightPaneLoadErr);
              console.error("[CustomPromptPage] 🔍 Error details:", rightPaneLoadErr);
              fnDoneInitializing();
            });
          });
        } catch (leftPaneInitErr) {
          console.error("[CustomPromptPage] ❌ Error initializing LeftPane:", leftPaneInitErr);
          console.error("[CustomPromptPage] 🔍 Stack trace:", leftPaneInitErr.stack);
          fnDoneInitializing();
        }
      }, function (leftPaneLoadErr) {
        console.error("[CustomPromptPage] ❌ Failed to load LeftPane module:", leftPaneLoadErr);
        console.error("[CustomPromptPage] 🔍 Error details:", leftPaneLoadErr);
        fnDoneInitializing();
      });
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Fatal error during initialize():", err);
      console.error("[CustomPromptPage] 🔍 Stack trace:", err.stack);
      fnDoneInitializing();
    }
  };

  // === Draw ===
  CustomPromptPage.prototype.draw = function (oControlHost) {
    console.log("[CustomPromptPage] 🖼 draw() called");
    console.log("[CustomPromptPage] 🔍 this.domNode:", this.domNode);
    console.log("[CustomPromptPage] 🔍 this.leftPane:", this.leftPane);
    console.log("[CustomPromptPage] 🔍 this.rightPane:", this.rightPane);

    try {
      if (!this.domNode) {
        console.warn("[CustomPromptPage] ⚠️ domNode not initialized, aborting draw");
        return;
      }

      // Clear content
      this.domNode.innerHTML = "";
      console.log("[CustomPromptPage] 🧹 Cleared previous DOM content");

      // Create layout flexbox
      const layout = document.createElement("div");
      layout.className = "custom-prompt-layout";
      layout.style.display = "flex";
      layout.style.width = "100%";
      layout.style.height = "100%";
      console.log("[CustomPromptPage] 📐 Layout container created");

      // Append LeftPane
      if (this.leftPane && this.leftPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing LeftPane...");
        this.leftPane.draw(oControlHost);
        layout.appendChild(this.leftPane.domNode);
        console.log("[CustomPromptPage] ✅ LeftPane appended to layout");
      } else {
        console.warn("[CustomPromptPage] ⚠️ LeftPane or LeftPane.domNode not available");
      }

      // Append RightPane
      if (this.rightPane && this.rightPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing RightPane...");
        this.rightPane.draw(oControlHost);
        layout.appendChild(this.rightPane.domNode);
        console.log("[CustomPromptPage] ✅ RightPane appended to layout");
      } else {
        console.warn("[CustomPromptPage] ⚠️ RightPane or RightPane.domNode not available");
      }

      this.domNode.appendChild(layout);
      oControlHost.container.appendChild(this.domNode);
      console.log("[CustomPromptPage] ✅ Layout rendered successfully");
      console.log("[CustomPromptPage] 🔍 Final DOM structure:", this.domNode);
      document.dispatchEvent(new Event("PromptPageReady"));
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
      console.error("[CustomPromptPage] 🔍 Stack trace:", err.stack);
    }
  };

  // === Destroy ===
  CustomPromptPage.prototype.destroy = function () {
    console.log("[CustomPromptPage] 🧨 destroy() called");

    try {
      if (this.dragDrop) {
        console.log("[CustomPromptPage] 🗑 Destroying DragDrop...");
        this.dragDrop.destroy();
        this.dragDrop = null;
        console.log("[CustomPromptPage] ✅ DragDrop destroyed");
      }
      if (this.leftPane) {
        console.log("[CustomPromptPage] 🗑 Destroying LeftPane...");
        this.leftPane.destroy();
        this.leftPane = null;
        console.log("[CustomPromptPage] ✅ LeftPane destroyed");
      }
      if (this.rightPane) {
        console.log("[CustomPromptPage] 🗑 Destroying RightPane...");
        this.rightPane.destroy();
        this.rightPane = null;
        console.log("[CustomPromptPage] ✅ RightPane destroyed");
      }
      if (this.domNode && this.domNode.parentNode) {
        console.log("[CustomPromptPage] 🗑 Removing DOM node...");
        this.domNode.parentNode.removeChild(this.domNode);
        console.log("[CustomPromptPage] ✅ DOM node removed");
      }
      console.log("[CustomPromptPage] ✅ destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during destroy():", err);
      console.error("[CustomPromptPage] 🔍 Stack trace:", err.stack);
    }
  };

  return CustomPromptPage;
});
