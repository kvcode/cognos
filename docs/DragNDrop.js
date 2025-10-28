define([], function() {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.boundDragOver = null;
    this.boundDrop = null;
  }

  // === Initialization ===
  DragNDrop.prototype.initialize = function(oControlHost, fnDoneInitializing) {
    console.log("[DragNDrop] 🌱 initialize() called");

    try {
      // Check if LeftPane and RightPane are available
      if (!this.leftPane || !this.rightPane) {
        console.error("[DragNDrop] ❌ LeftPane or RightPane missing");
        return;
      }

      console.log("[DragNDrop] 🔗 LeftPane and RightPane are available");

      // Ensure RightPane cards container exists
      const dropTarget = this.rightPane.cardsContainer;
      if (!dropTarget) {
        console.error("[DragNDrop] ❌ RightPane cardsContainer missing");
        return;
      }

      console.log("[DragNDrop] ✅ RightPane cardsContainer found");

      // Bind event handlers for dragover and drop
      this.boundDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        console.log("[DragNDrop] 🖱 DragOver event fired");
      };

      this.boundDrop = (e) => {
        e.preventDefault();
        try {
          const dataStr = e.dataTransfer.getData("text/plain");
          console.log("[DragNDrop] 🛬 Drop event fired. Data received:", dataStr);

          const data = JSON.parse(dataStr);
          if (!data.optionName || !data.parameterName) {
            console.warn("[DragNDrop] ⚠️ Invalid drop data:", data);
            return;
          }

          console.log("[DragNDrop] ✅ Drop data parsed successfully:", data);

          // Check if card already exists in the RightPane
          const existing = Array.from(dropTarget.children).find(card => {
            return card.dataset.optionName === data.optionName;
          });

          if (existing) {
            console.log("[DragNDrop] ⚠️ Card already exists for:", data.optionName);
            return;
          }

          console.log("[DragNDrop] ✅ Card not found. Proceeding to add.");

          // Add card via RightPane
          if (this.rightPane && typeof this.rightPane.addCard === "function") {
            this.rightPane.addCard(data);
            console.log("[DragNDrop] ✅ Card added for:", data.optionName);
          } else {
            console.error("[DragNDrop] ❌ rightPane.addCard not available");
          }

        } catch (err) {
          console.error("[DragNDrop] ❌ Drop handler error:", err);
        }
      };

      // Attach the event listeners for dragover and drop
      dropTarget.addEventListener("dragover", this.boundDragOver);
      dropTarget.addEventListener("drop", this.boundDrop);

      console.log("[DragNDrop] ✅ Event listeners attached to RightPane");

      // If initialization callback exists, call it
      if (typeof fnDoneInitializing === 'function') {
        fnDoneInitializing();
        console.log("[DragNDrop] ✅ fnDoneInitializing callback called");
      }

    } catch (err) {
      console.error("[DragNDrop] ❌ Error during initialization:", err);
    }
  };

  // === Destroy ===
  DragNDrop.prototype.destroy = function() {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      if (this.rightPane && this.rightPane.cardsContainer) {
        // Remove event listeners
        this.rightPane.cardsContainer.removeEventListener("dragover", this.boundDragOver);
        this.rightPane.cardsContainer.removeEventListener("drop", this.boundDrop);
        console.log("[DragNDrop] ✅ Event listeners removed from RightPane");
      }

      // Reset all instance variables
      this.leftPane = null;
      this.rightPane = null;
      this.boundDragOver = null;
      this.boundDrop = null;

      console.log("[DragNDrop] ✅ destroy() complete — all instance variables reset");

    } catch (err) {
      console.error("[DragNDrop] ❌ destroy() failed:", err);
    }
  };

  return DragNDrop;
});
