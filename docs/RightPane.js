define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] 🏗 Constructor called");
    this.domNode = null;
    this.cardsContainer = null;
    this.autocompleteData = {};
    this.cards = []; // Now stores card OBJECTS, not just data
  }

  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] 🔧 initialize() called");

    try {
      // Create main container for RightPane
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      // Add background color for better visualization
      this.domNode.style.backgroundColor = "#d3d3d3";
      this.domNode.style.padding = "10px";
      this.domNode.style.minHeight = "100px";
      this.domNode.style.height = "100%";
      this.domNode.style.position = "relative";
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

      // Re-render existing card objects
      this.cards.forEach((cardObject) => {
        this._renderCard(cardObject);
      });
    } catch (err) {
      console.error("[RightPane] ❌ draw() failed:", err);
    }
  };

  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] ➕ addCard() called with data:", cardData);

    try {
      // Create card object with config and methods
      const cardObject = this._createCardObject(cardData);

      // Store card object (not just data)
      this.cards.push(cardObject);
      console.log("[RightPane] 💾 Card object stored:", cardObject);

      // Render card immediately if container exists
      if (this.cardsContainer) {
        this._renderCard(cardObject);
      } else {
        console.warn("[RightPane] ⚠️ cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] ❌ addCard() failed:", err);
    }
  };

  // ✨ NEW: Create card object with config and methods
  RightPane.prototype._createCardObject = function (cardData) {
    console.log("[RightPane] 🏗 Creating card object for:", cardData);

    const cardObject = {
      config: cardData, // Store full button config
      domElement: null, // Will be set during render
      inputElement: null, // Will be set during render

      // Method to get parameters from this card
      getParameters: function () {
        const value = this.inputElement ? this.inputElement.value.trim() : "";

        // Only return parameter if we have both a value and a paramName
        if (!value || !this.config.paramName) {
          return [];
        }

        console.log(`[RightPane] 📤 Card parameter: ${this.config.paramName} = ${value}`);

        return [
          {
            parameter: this.config.paramName, // e.g., "P_Brand"
            values: [{ use: value }], // e.g., [{"use": "Audi"}]
          },
        ];
      },
    };

    return cardObject;
  };

  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane] 🛠 _renderCard() called for:", cardObject.config);

    try {
      const cardData = cardObject.config;

      // Create card DOM
      const card = document.createElement("div");
      card.className = "right-pane-card";

      // Card header - backwards compatible!
      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = cardData.label || cardData.optionName || "Unnamed Prompt";
      card.appendChild(header);

      // Input field with autocomplete
      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Enter value...";
      card.appendChild(input);

      // ✨ NEW: Store references on card object
      cardObject.domElement = card;
      cardObject.inputElement = input;

      // Autocomplete logic (check both label and optionName)
      const cardKey = cardData.label || cardData.optionName;
      if (this.autocompleteData[cardKey]) {
        console.log(`[RightPane] 🔍 Setting autocomplete for ${cardKey}`);
        const suggestions = this.autocompleteData[cardKey];

        input.addEventListener("input", () => {
          const val = input.value.toLowerCase();
          const match = suggestions.find((s) => s.toLowerCase().startsWith(val));
          if (match) {
            input.value = match;
          }
        });
      }

      // Drag/drop target setup (keep existing functionality)
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
          input.value = data.optionName || data.label || "";
        } catch (err) {
          console.error("[RightPane] ❌ Error parsing drop data:", err);
        }
      });

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ Card rendered:", cardData.label || cardData.optionName);
    } catch (err) {
      console.error("[RightPane] ❌ _renderCard() failed:", err);
    }
  };

  // ✨ NEW: Collect parameters from all cards
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane] 📋 getParameters() called");

    try {
      const allParams = [];

      // Loop through all card objects and collect their parameters
      this.cards.forEach((cardObject, idx) => {
        console.log(`[RightPane] 🔍 Checking card ${idx}:`, cardObject.config.label || cardObject.config.optionName);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane] ✅ Card ${idx} returned parameters:`, cardParams);
        } else {
          console.log(`[RightPane] ⚠️ Card ${idx} has no parameters (empty or no paramName)`);
        }
      });

      console.log("[RightPane] 📤 Final collected parameters:", allParams);
      return allParams;
    } catch (err) {
      console.error("[RightPane] ❌ getParameters() failed:", err);
      return [];
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
