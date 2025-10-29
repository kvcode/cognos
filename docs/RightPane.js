define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] 🏗 Constructor called");
    this.domNode = null;
    this.cardsContainer = null; // container for prompt cards
    this.autocompleteData = {};
    this.cards = []; // store added cards
  }

  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] 🔧 initialize() called");

    try {
      // Create main container for RightPane
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      // Add background color for better visualization
      this.domNode.style.backgroundColor = "#d3d3d3"; // light gray background
      this.domNode.style.padding = "10px";
      this.domNode.style.minHeight = "100px";
      this.domNode.style.height = "100%"; // Adjust height if necessary
      this.domNode.style.position = "relative"; // Ensure positioning for drop area
      this.domNode.style.pointerEvents = "auto";

      // Container for cards
      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";
      this.cardsContainer.style.height = "30px";
      this.cardsContainer.style.minWidth = "120px";
      this.cardsContainer.style.backgroundColor = "#fffdd7ff";
      this.cardsContainer.style.pointerEvents = "auto";

      this.domNode.appendChild(this.cardsContainer);

      // Read configuration
      const config = oControlHost.configuration || {};
      console.log("[RightPane] ⚙️ Configuration received:", config);

      // Autocomplete data (optional)
      this.autocompleteData = config.autocompleteTags || {};
      console.log("[RightPane] 🧩 Autocomplete data loaded:", this.autocompleteData);

      console.log("[RightPane] ✅ Initialization complete");
      fnDoneInitializing();
    } catch (err) {
      console.error("[RightPane] ❌ initialize() failed:", err);
      fnDoneInitializing();
    }
  };

  RightPane.prototype.draw = function (oControlHost) {
    console.log("[RightPane] 🖼 draw() called");

    try {
      if (!this.domNode) {
        console.warn("[RightPane] ⚠️ domNode not initialized, aborting draw");
        return;
      }

      // Clear previous cards
      this.cardsContainer.innerHTML = "";
      console.log("[RightPane] 🧹 Cleared previous cards");

      // Re-add existing cards (if any)
      this.cards.forEach((cardData) => {
        this._renderCard(cardData);
      });

      // Append DOM to Cognos container
      oControlHost.container.appendChild(this.domNode);
      console.log("[RightPane] ✅ RightPane DOM appended to Cognos container");
    } catch (err) {
      console.error("[RightPane] ❌ draw() failed:", err);
    }
  };

  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] ➕ addCard() called with data:", cardData);

    try {
      // Store cardData
      this.cards.push(cardData);

      // Render card immediately if container exists
      if (this.cardsContainer) {
        this._renderCard(cardData);
      } else {
        console.warn("[RightPane] ⚠️ cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] ❌ addCard() failed:", err);
    }
  };

  RightPane.prototype._renderCard = function (cardData) {
    console.log("[RightPane] 🛠 _renderCard() called for:", cardData);

    try {
      const card = document.createElement("div");
      card.className = "right-pane-card";

      // Card header
      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = cardData.optionName || "Unnamed Prompt";
      card.appendChild(header);

      // Input field with autocomplete
      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Enter value...";
      card.appendChild(input);

      // Autocomplete logic
      if (this.autocompleteData[cardData.optionName]) {
        console.log(`[RightPane] 🔍 Setting autocomplete for ${cardData.optionName}`);
        const suggestions = this.autocompleteData[cardData.optionName];

        input.addEventListener("input", () => {
          const val = input.value.toLowerCase();
          const match = suggestions.find((s) => s.toLowerCase().startsWith(val));
          if (match) {
            input.value = match;
          }
        });
      }

      // Drag/drop target setup
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        card.classList.add("right-pane-card-dragover");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("right-pane-card-dragover");
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("right-pane-card-dragover");

        try {
          const data = JSON.parse(e.dataTransfer.getData("text/plain"));
          console.log("[RightPane] 📥 Drop received:", data);

          // Populate input with dropped value
          input.value = data.optionName || "";
        } catch (err) {
          console.error("[RightPane] ❌ Error parsing drop data:", err);
        }
      });

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ Card rendered:", cardData.optionName);
    } catch (err) {
      console.error("[RightPane] ❌ _renderCard() failed:", err);
    }
  };

  RightPane.prototype.destroy = function () {
    console.log("[RightPane] 🧨 destroy() called");

    try {
      // Clear cards
      if (this.cardsContainer) {
        this.cardsContainer.innerHTML = "";
        this.cardsContainer = null;
      }

      // Clear main DOM node
      if (this.domNode && this.domNode.parentNode) {
        this.domNode.parentNode.removeChild(this.domNode);
      }
      this.domNode = null;

      // Clear stored cards
      this.cards = [];
      this.autocompleteData = {};

      console.log("[RightPane] ✅ destroy() complete — cleanup successful");
    } catch (err) {
      console.error("[RightPane] ❌ destroy() failed:", err);
    }
  };

  return RightPane;
});
