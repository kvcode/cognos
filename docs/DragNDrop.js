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
    this.isSetup = false;
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

      // Setup drop zone now (cardsContainer already exists)
      this.setupDropZone();

      console.log("[DragNDrop] ✅ Initialization complete (drag handlers will be set in draw())");

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
      // Now setup drag handlers - buttons exist after panes are drawn!
      this.setupDragHandlers();
      console.log("[DragNDrop] ✅ draw() complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during draw():", err);
    }
  };

  // === Setup Drag Handlers ===
  DragNDrop.prototype.setupDragHandlers = function () {
    console.log("[DragNDrop] 🎯 Setting up drag handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      // Check if already setup to prevent duplicates
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
        // Make draggable
        button.draggable = true;
        button.style.cursor = "grab";

        // Dragstart
        button.addEventListener("dragstart", (e) => {
          console.log(`[DragNDrop] 🎯 Drag started: ${button.textContent.trim()}`);
          console.log("[DragNDrop] 🔍 Button rect:", button.getBoundingClientRect());
          console.log("[DragNDrop] 🔍 Button parent:", button.parentElement);
          console.log("[DragNDrop] 🔍 All parent z-indexes:");

          let parent = button.parentElement;
          while (parent) {
            const styles = getComputedStyle(parent);
            console.log(
              `  - ${parent.className}: z-index=${styles.zIndex}, pointer-events=${styles.pointerEvents}, position=${styles.position}`
            );
            parent = parent.parentElement;
            if (!parent || parent === document.body) break;
          }

          const dragData = {
            optionName: button.textContent.trim(),
            sourceIndex: idx,
            timestamp: Date.now(),
          };

          // Set data
          e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = "copy";

          // Try native drag image first (simpler, more compatible)
          try {
            e.dataTransfer.setDragImage(button, button.offsetWidth / 2, button.offsetHeight / 2);
            console.log("[DragNDrop] ✅ Drag image set to button itself");
          } catch (err) {
            console.warn("[DragNDrop] ⚠️ setDragImage failed:", err);
          }

          button.style.opacity = "0.5";
          button.style.cursor = "grabbing";

          console.log("[DragNDrop] 📦 Data:", dragData);
          console.log("[DragNDrop] ✅ effectAllowed:", e.dataTransfer.effectAllowed);
          console.log("[DragNDrop] ✅ types:", e.dataTransfer.types);

          // Check if any default was prevented
          console.log("[DragNDrop] 🔍 defaultPrevented:", e.defaultPrevented);
          console.log("[DragNDrop] 🔍 Event phase:", e.eventPhase);
        });

        // Dragend
        button.addEventListener("dragend", () => {
          console.log(`[DragNDrop] 🏁 Drag ended`);
          button.style.opacity = "1";
          button.style.cursor = "grab";
        });
      });

      this.isSetup = true;
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
        console.log("[DragNDrop] 🔄 DRAGOVER - event fired!");
        console.log("[DragNDrop] 🔍 Mouse position:", e.clientX, e.clientY);
        console.log("[DragNDrop] 🔍 Target:", e.target);
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
      console.log("[DragNDrop] 📍 Drop zone rect:", dropTarget.getBoundingClientRect());
      console.log("[DragNDrop] 📍 Drop zone styles:", {
        position: getComputedStyle(dropTarget).position,
        zIndex: getComputedStyle(dropTarget).zIndex,
        pointerEvents: getComputedStyle(dropTarget).pointerEvents,
        display: getComputedStyle(dropTarget).display,
      });

      // Add GLOBAL drag listeners to document to see if ANY drag events fire
      document.addEventListener(
        "drag",
        () => {
          console.log("[DragNDrop] 🌍 GLOBAL: drag event on document");
        },
        { once: true }
      ); // only log once to avoid spam

      document.addEventListener(
        "dragover",
        (e) => {
          console.log("[DragNDrop] 🌍 GLOBAL: dragover on", e.target);
        },
        { once: true }
      );

      document.addEventListener(
        "dragenter",
        (e) => {
          console.log("[DragNDrop] 🌍 GLOBAL: dragenter on", e.target);
        },
        { once: true }
      );
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
      this.isSetup = false;

      console.log("[DragNDrop] ✅ Destroyed");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy error:", err);
    }
  };

  return DragNDrop;
});
