define([], function () {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.isSetup = false;

    // Mouse drag state
    this.isDragging = false;
    this.dragData = null;
    this.floatingElement = null;
    this.dropZone = null;

    // Bound functions for cleanup
    this.boundMouseMove = null;
    this.boundMouseUp = null;
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
      console.log("[DragNDrop] ✅ Initialization complete (handlers will be set in draw())");

      if (fnDoneInitializing) {
        fnDoneInitializing();
      }
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during initialization:", err);
      if (fnDoneInitializing) fnDoneInitializing();
    }
  };

  // === Draw ===
  DragNDrop.prototype.draw = function () {
    console.log("[DragNDrop] 🖼 draw() called");

    try {
      // Store drop zone reference
      this.dropZone = this.rightPane.cardsContainer;
      console.log("[DragNDrop] 📍 Drop zone stored:", this.dropZone);

      // Setup mouse-based drag handlers
      this.setupDragHandlers();
      console.log("[DragNDrop] ✅ draw() complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during draw():", err);
    }
  };

  // === Setup Drag Handlers (Mouse-Based) ===
  DragNDrop.prototype.setupDragHandlers = function () {
    console.log("[DragNDrop] 🎯 Setting up mouse-based drag handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      // Check if already setup
      if (this.isSetup) {
        console.warn("[DragNDrop] ⚠️ Already setup, skipping");
        return;
      }

      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
      console.log("[DragNDrop] 🔍 Found", buttons.length, "buttons");

      if (buttons.length === 0) {
        console.warn("[DragNDrop] ⚠️ No buttons found");
        return;
      }

      buttons.forEach((button, idx) => {
        button.style.cursor = "grab";

        // Mouse down - start drag
        button.addEventListener("mousedown", (e) => {
          e.preventDefault(); // Prevent text selection
          console.log(`[DragNDrop] 🖱 Mouse down on: ${button.textContent.trim()}`);

          // ✨ NEW: Try to get stored config, fallback to text-only
          if (button._buttonConfig) {
            // Full config available from LeftPane
            this.dragData = button._buttonConfig;
            console.log(`[DragNDrop] 💾 Using full button config:`, this.dragData);
          } else {
            // Fallback: old behavior (backwards compatible)
            this.dragData = {
              optionName: button.textContent.trim(),
              sourceIndex: idx,
              timestamp: Date.now(),
            };
            console.log(`[DragNDrop] ⚠️ No config found, using text only`);
          }

          // Create floating element
          this.createFloatingElement(button.textContent.trim(), e.clientX, e.clientY);

          // Visual feedback on source button
          button.style.opacity = "0.5";

          // Start tracking mouse movement
          this.startDrag();

          console.log("[DragNDrop] 📦 Drag data:", this.dragData);
        });
      });

      this.isSetup = true;
      console.log("[DragNDrop] ✅ Mouse drag handlers complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupDragHandlers error:", err);
    }
  };

  // === Create Floating Element ===
  DragNDrop.prototype.createFloatingElement = function (text, x, y) {
    console.log("[DragNDrop] 🎨 Creating floating element");

    // Create floating div
    this.floatingElement = document.createElement("div");
    this.floatingElement.className = "drag-floating";
    this.floatingElement.textContent = text;
    this.floatingElement.style.left = x + 10 + "px"; // Offset from cursor
    this.floatingElement.style.top = y + 10 + "px";

    document.body.appendChild(this.floatingElement);
    console.log("[DragNDrop] ✅ Floating element created");
  };

  // === Start Drag (Track Mouse) ===
  DragNDrop.prototype.startDrag = function () {
    console.log("[DragNDrop] 🚀 Starting drag tracking");
    this.isDragging = true;

    // Mouse move handler
    this.boundMouseMove = (e) => {
      if (!this.isDragging) return;

      // Update floating element position
      if (this.floatingElement) {
        this.floatingElement.style.left = e.clientX + 10 + "px";
        this.floatingElement.style.top = e.clientY + 10 + "px";
      }

      // Check if over drop zone
      this.checkDropZone(e.clientX, e.clientY);
    };

    // Mouse up handler
    this.boundMouseUp = (e) => {
      console.log("[DragNDrop] 🖱 Mouse up detected");
      this.endDrag(e.clientX, e.clientY);
    };

    // Attach to document (so we track everywhere)
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);

    console.log("[DragNDrop] ✅ Drag tracking started");
  };

  // === Check if Over Drop Zone ===
  DragNDrop.prototype.checkDropZone = function (x, y) {
    if (!this.dropZone) return;

    const rect = this.dropZone.getBoundingClientRect();
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (isOver) {
      this.dropZone.classList.add("drop-hover");
    } else {
      this.dropZone.classList.remove("drop-hover");
    }
  };

  // === End Drag ===
  DragNDrop.prototype.endDrag = function (x, y) {
    console.log("[DragNDrop] 🏁 Ending drag at:", x, y);

    // Check if over drop zone
    if (!this.dropZone) {
      console.warn("[DragNDrop] ⚠️ No drop zone available");
      this.cleanup();
      return;
    }

    const rect = this.dropZone.getBoundingClientRect();
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    console.log("[DragNDrop] 🔍 Drop zone rect:", rect);
    console.log("[DragNDrop] 🔍 Mouse position:", x, y);
    console.log("[DragNDrop] 🔍 Is over drop zone:", isOver);

    if (isOver) {
      console.log("[DragNDrop] ✅ Dropped over target!");

      // Add card to RightPane
      if (this.rightPane && this.rightPane.addCard) {
        this.rightPane.addCard(this.dragData);
        console.log("[DragNDrop] ✅ Card added to RightPane:", this.dragData.optionName);
      } else {
        console.error("[DragNDrop] ❌ RightPane.addCard() not available");
      }
    } else {
      console.log("[DragNDrop] ❌ Dropped outside target zone");
    }

    this.cleanup();
  };

  // === Cleanup ===
  DragNDrop.prototype.cleanup = function () {
    console.log("[DragNDrop] 🧹 Cleaning up drag operation");

    // Remove floating element
    if (this.floatingElement && this.floatingElement.parentNode) {
      document.body.removeChild(this.floatingElement);
      this.floatingElement = null;
    }

    // Remove drop zone highlight
    if (this.dropZone) {
      this.dropZone.classList.remove("drop-hover");
    }

    // Reset button opacity
    const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
    buttons.forEach((btn) => {
      btn.style.opacity = "1";
    });

    // Remove event listeners
    if (this.boundMouseMove) {
      document.removeEventListener("mousemove", this.boundMouseMove);
      this.boundMouseMove = null;
    }
    if (this.boundMouseUp) {
      document.removeEventListener("mouseup", this.boundMouseUp);
      this.boundMouseUp = null;
    }

    // Reset state
    this.isDragging = false;
    this.dragData = null;

    console.log("[DragNDrop] ✅ Cleanup complete");
  };

  // === Destroy ===
  DragNDrop.prototype.destroy = function () {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      // Clean up any active drag
      if (this.isDragging) {
        this.cleanup();
      }

      // Reset everything
      this.leftPane = null;
      this.rightPane = null;
      this.dropZone = null;
      this.isSetup = false;
      this.isDragging = false;
      this.dragData = null;
      this.floatingElement = null;
      this.boundMouseMove = null;
      this.boundMouseUp = null;

      console.log("[DragNDrop] ✅ Destroyed");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy error:", err);
    }
  };

  return DragNDrop;
});
