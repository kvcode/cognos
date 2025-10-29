define([], function () {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.boundDragOver = null;
    this.boundDragLeave = null;
    this.boundDrop = null;
  }

  // === Initialization ===
  DragNDrop.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[DragNDrop] 🌱 initialize() called");

    try {
      // Validate panes
      if (!this.leftPane || !this.rightPane) {
        console.error("[DragNDrop] ❌ LeftPane or RightPane missing");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      if (!this.rightPane.cardsContainer) {
        console.error("[DragNDrop] ❌ RightPane cardsContainer missing");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      console.log("[DragNDrop] ✅ Both panes validated");

      // Setup drag and drop immediately - no event waiting needed!
      this.setupDragHandlers();
      this.setupDropZone();

      console.log("[DragNDrop] ✅ Drag and Drop fully initialized");

      if (fnDoneInitializing) {
        fnDoneInitializing();
      }
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during initialization:", err);
      if (fnDoneInitializing) fnDoneInitializing();
    }
  };

  // === Setup Drag Handlers ===
  DragNDrop.prototype.setupDragHandlers = function () {
    console.log("[DragNDrop] 🎯 Setting up drag handlers - CALL #" + Date.now());

    // Check if buttons already have listeners
    const existingButtons = this.leftPane.domNode.querySelectorAll(".left-pane-button[draggable='true']");
    console.log("[DragNDrop] ⚠️ Already draggable buttons:", existingButtons.length);

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
      console.log("[DragNDrop] 🔍 Found", buttons.length, "buttons");

      if (buttons.length === 0) {
        console.warn("[DragNDrop] ⚠️ No buttons found");
        return;
      }

      buttons.forEach((button, idx) => {
        // Make draggable
        button.draggable = true;

        // Dragstart
        button.addEventListener("dragstart", (e) => {
          console.log(`[DragNDrop] 🎯 Drag started: ${button.textContent.trim()}`);

          const dragData = {
            optionName: button.textContent.trim(),
            sourceIndex: idx,
            timestamp: Date.now(),
          };

          e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = "copy";
          button.style.opacity = "0.5";

          console.log("[DragNDrop] 📦 Data:", dragData);
        });

        // Dragend
        button.addEventListener("dragend", () => {
          console.log(`[DragNDrop] 🏁 Drag ended`);
          button.style.opacity = "1";
        });
      });

      console.log("[DragNDrop] ✅ Drag handlers complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupDragHandlers error:", err);
    }
  };

  // === Setup Drop Zone ===
  DragNDrop.prototype.setupDropZone = function () {
    console.log("[DragNDrop] 🎯 Setting up drop zone");

    try {
      const dropTarget = this.rightPane.cardsContainer;
      console.log("[DragNDrop] 📍 Target:", dropTarget);

      // Dragover
      this.boundDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        dropTarget.classList.add("drop-hover");
        console.log("[DragNDrop] 🔄 DRAGOVER");
      };

      // Dragleave
      this.boundDragLeave = (e) => {
        e.preventDefault();
        dropTarget.classList.remove("drop-hover");
        console.log("[DragNDrop] 🔙 DRAGLEAVE");
      };

      // Drop
      this.boundDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropTarget.classList.remove("drop-hover");

        console.log("[DragNDrop] 📥 DROP!");

        try {
          const dataString = e.dataTransfer.getData("text/plain");
          console.log("[DragNDrop] 📦 Received:", dataString);

          if (!dataString) {
            console.warn("[DragNDrop] ⚠️ No data");
            return;
          }

          const data = JSON.parse(dataString);
          console.log("[DragNDrop] ✅ Parsed:", data);

          if (this.rightPane && this.rightPane.addCard) {
            this.rightPane.addCard(data);
            console.log("[DragNDrop] ✅ Card added!");
          } else {
            console.error("[DragNDrop] ❌ addCard() missing");
          }
        } catch (err) {
          console.error("[DragNDrop] ❌ Drop error:", err);
        }
      };

      // Attach listeners
      dropTarget.addEventListener("dragover", this.boundDragOver);
      dropTarget.addEventListener("dragleave", this.boundDragLeave);
      dropTarget.addEventListener("drop", this.boundDrop);

      console.log("[DragNDrop] ✅ Drop zone complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupDropZone error:", err);
    }
  };

  // === Destroy ===
  DragNDrop.prototype.destroy = function () {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      // Remove drop listeners
      if (this.rightPane && this.rightPane.cardsContainer) {
        const dropTarget = this.rightPane.cardsContainer;
        if (this.boundDragOver) dropTarget.removeEventListener("dragover", this.boundDragOver);
        if (this.boundDragLeave) dropTarget.removeEventListener("dragleave", this.boundDragLeave);
        if (this.boundDrop) dropTarget.removeEventListener("drop", this.boundDrop);
      }

      // Clean buttons
      if (this.leftPane && this.leftPane.domNode) {
        const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
        buttons.forEach((btn) => {
          btn.draggable = false;
          btn.style.opacity = "1";
        });
      }

      this.leftPane = null;
      this.rightPane = null;
      this.boundDragOver = null;
      this.boundDragLeave = null;
      this.boundDrop = null;

      console.log("[DragNDrop] ✅ Destroyed");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy error:", err);
    }
  };

  return DragNDrop;
});
