define([], function () {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.boundDragStart = null;
    this.boundDragEnd = null;
    this.boundDragOver = null;
    this.boundDragLeave = null;
    this.boundDrop = null;
  }

  // === Initialization ===
  DragNDrop.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[DragNDrop] 🌱 initialize() called");

    try {
      // Log the state of LeftPane and RightPane
      console.log("[DragNDrop] 🧳 LeftPane:", this.leftPane);
      console.log("[DragNDrop] 🧳 RightPane:", this.rightPane);

      // Check if LeftPane and RightPane are available
      if (!this.leftPane && !this.rightPane) {
        console.error("[DragNDrop] ❌ Both LeftPane and RightPane are missing.");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      if (!this.leftPane) {
        console.error("[DragNDrop] ❌ LeftPane is missing.");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      if (!this.rightPane) {
        console.error("[DragNDrop] ❌ RightPane is missing.");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      console.log("[DragNDrop] 🔗 LeftPane and RightPane are available");

      // Ensure RightPane cards container exists
      const dropTarget = this.rightPane.cardsContainer;
      if (!dropTarget) {
        console.error("[DragNDrop] ❌ RightPane cardsContainer missing.");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      console.log("[DragNDrop] ✅ RightPane cardsContainer found:", dropTarget);

      // === Setup Drag and Drop IMMEDIATELY ===
      // Listen for PromptPageReady event OR setup immediately if already ready
      const setupHandler = () => {
        console.log("[DragNDrop] 🚀 Setting up drag and drop handlers");
        this.setupDragHandlers(oControlHost);
        this.setupDropZone(oControlHost, dropTarget);
      };

      // Try to setup immediately (in case event already fired)
      setTimeout(() => {
        console.log("[DragNDrop] ⏰ Delayed setup triggered");
        setupHandler();
      }, 100);

      // Also listen for the event in case it fires later
      document.addEventListener(
        "PromptPageReady",
        () => {
          console.log("[DragNDrop] 📡 PromptPageReady event received");
          setupHandler();
        },
        { once: true }
      );

      console.log("[DragNDrop] ✅ Drag and Drop functionality enabled");

      // If initialization callback exists, call it
      if (typeof fnDoneInitializing === "function") {
        fnDoneInitializing();
        console.log("[DragNDrop] ✅ fnDoneInitializing callback called");
      }
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during initialization:", err);
      console.error("[DragNDrop] 🔍 Stack trace:", err.stack);
      if (fnDoneInitializing) fnDoneInitializing();
    }
  };

  // === Setup Drag Handlers on LeftPane Buttons ===
  DragNDrop.prototype.setupDragHandlers = function (oControlHost) {
    console.log("[DragNDrop] 🎯 Setting up drag handlers on LeftPane buttons");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      // Find all buttons in LeftPane
      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
      console.log("[DragNDrop] 🔍 Found buttons:", buttons.length);

      if (buttons.length === 0) {
        console.warn("[DragNDrop] ⚠️ No buttons found in LeftPane");
        return;
      }

      buttons.forEach((button, idx) => {
        console.log(`[DragNDrop] 🔧 Setting up drag for button [${idx}]:`, button.textContent.trim());

        // Make button draggable
        button.draggable = true;
        button.setAttribute("draggable", "true");

        // Dragstart handler
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
          button.classList.add("dragging");

          console.log("[DragNDrop] 📦 Drag data set:", dragData);
        });

        // Dragend handler
        button.addEventListener("dragend", (e) => {
          console.log(`[DragNDrop] 🏁 Drag ended: ${button.textContent.trim()}`);
          button.style.opacity = "1";
          button.classList.remove("dragging");
        });

        console.log(`[DragNDrop] ✅ Button [${idx}] is now draggable`);
      });

      console.log("[DragNDrop] ✅ All buttons setup complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error setting up drag handlers:", err);
      console.error("[DragNDrop] 🔍 Stack trace:", err.stack);
    }
  };

  // === Setup Drop Zone on RightPane ===
  DragNDrop.prototype.setupDropZone = function (oControlHost, dropTarget) {
    console.log("[DragNDrop] 🎯 Setting up drop zone on RightPane");
    console.log("[DragNDrop] 🔍 Drop target:", dropTarget);

    try {
      // Dragover handler
      this.boundDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";

        dropTarget.classList.add("drop-hover");
        console.log("[DragNDrop] 🔄 Dragging over drop zone");
      };

      // Dragleave handler
      this.boundDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dropTarget.classList.remove("drop-hover");
        console.log("[DragNDrop] 🔙 Left drop zone");
      };

      // Drop handler
      this.boundDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dropTarget.classList.remove("drop-hover");

        console.log("[DragNDrop] 📥 Drop event triggered");

        try {
          const dataString = e.dataTransfer.getData("text/plain");
          console.log("[DragNDrop] 📦 Raw data received:", dataString);

          if (!dataString) {
            console.warn("[DragNDrop] ⚠️ No data in drop event");
            return;
          }

          const data = JSON.parse(dataString);
          console.log("[DragNDrop] ✅ Parsed drop data:", data);

          // Add card to RightPane
          if (this.rightPane && typeof this.rightPane.addCard === "function") {
            console.log("[DragNDrop] ➕ Adding card to RightPane:", data.optionName);
            this.rightPane.addCard(data);
            console.log("[DragNDrop] ✅ Card added successfully");
          } else {
            console.error("[DragNDrop] ❌ RightPane.addCard() not available");
          }
        } catch (parseErr) {
          console.error("[DragNDrop] ❌ Error parsing drop data:", parseErr);
          console.error("[DragNDrop] 🔍 Stack trace:", parseErr.stack);
        }
      };

      console.log(
        "[DragNDrop] 📏 dropTarget size:",
        dropTarget.offsetWidth,
        "x",
        dropTarget.offsetHeight,
        "position:",
        getComputedStyle(dropTarget).position
      );

      // Attach event listeners
      dropTarget.addEventListener("dragover", this.boundDragOver);
      dropTarget.addEventListener("dragleave", this.boundDragLeave);
      dropTarget.addEventListener("drop", this.boundDrop);

      console.log("[DragNDrop] ✅ Drop zone setup complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error setting up drop zone:", err);
      console.error("[DragNDrop] 🔍 Stack trace:", err.stack);
    }
  };

  // === Destroy ===
  DragNDrop.prototype.destroy = function () {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      // Remove event listeners from drop zone
      if (this.rightPane && this.rightPane.cardsContainer) {
        const dropTarget = this.rightPane.cardsContainer;

        if (this.boundDragOver) {
          dropTarget.removeEventListener("dragover", this.boundDragOver);
          console.log("[DragNDrop] 🗑 Removed dragover listener");
        }
        if (this.boundDragLeave) {
          dropTarget.removeEventListener("dragleave", this.boundDragLeave);
          console.log("[DragNDrop] 🗑 Removed dragleave listener");
        }
        if (this.boundDrop) {
          dropTarget.removeEventListener("drop", this.boundDrop);
          console.log("[DragNDrop] 🗑 Removed drop listener");
        }
      }

      // Remove draggable attributes from LeftPane buttons
      if (this.leftPane && this.leftPane.domNode) {
        const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
        buttons.forEach((button) => {
          button.draggable = false;
          button.removeAttribute("draggable");
          button.classList.remove("dragging");
          button.style.opacity = "1";
        });
        console.log("[DragNDrop] 🗑 Cleaned up LeftPane buttons");
      }

      // Reset all instance variables
      this.leftPane = null;
      this.rightPane = null;
      this.boundDragStart = null;
      this.boundDragEnd = null;
      this.boundDragOver = null;
      this.boundDragLeave = null;
      this.boundDrop = null;

      console.log("[DragNDrop] ✅ destroy() complete — all cleanup done");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy() failed:", err);
      console.error("[DragNDrop] 🔍 Stack trace:", err.stack);
    }
  };

  return DragNDrop;
});
