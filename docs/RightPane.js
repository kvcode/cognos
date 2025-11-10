define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] 🏗 Constructor called");
    this.domNode = null;
    this.cardsContainer = null;
    this.autocompleteData = {};
    this.m_oControlHost = null;
    this.cards = [];
    console.log("[RightPane] 💾 Initialized cards array for structured cards");
  }

  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] 🔧 initialize() called");

    this.m_oControlHost = oControlHost;
    console.log("[RightPane] 💾 Stored oControlHost");

    try {
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";

      this.domNode.appendChild(this.cardsContainer);

      const config = oControlHost.configuration || {};
      console.log("[RightPane] ⚙️ Configuration received:", config);

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

      this.cardsContainer.innerHTML = "";
      console.log("[RightPane] 🧹 Cleared previous cards");

      this.cards.forEach((cardObject) => {
        this._renderCard(cardObject);
      });
      console.log("[RightPane] ✅ Rendered", this.cards.length, "cards");
    } catch (err) {
      console.error("[RightPane] ❌ draw() failed:", err);
    }
  };

  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] ➕ addCard() called!");
    console.log("[RightPane] 📦 Received cardData:", JSON.stringify(cardData, null, 2));

    try {
      if (!cardData.fullConfig) {
        console.error("[RightPane] ❌ cardData.fullConfig is missing! Cannot create card.");
        console.log("[RightPane] ⏩ Aborting card creation");
        return;
      }

      console.log("[RightPane] ✅ fullConfig found:", JSON.stringify(cardData.fullConfig, null, 2));

      const cardObject = this._createCardObject(cardData);
      console.log("[RightPane] 🏗 Card object created:", cardObject);

      this.cards.push(cardObject);
      console.log("[RightPane] 💾 Card object stored in cards array");
      console.log("[RightPane] 📊 Total cards now:", this.cards.length);

      if (this.cardsContainer) {
        this._renderCard(cardObject);
        console.log("[RightPane] ✅ Card rendered to DOM");
      } else {
        console.warn("[RightPane] ⚠️ cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] ❌ addCard() failed:", err);
    }
  };

  RightPane.prototype._createCardObject = function (cardData) {
    console.log("[RightPane] 🏗 _createCardObject() called");
    console.log("[RightPane] 📦 Input cardData:", JSON.stringify(cardData, null, 2));

    const config = cardData.fullConfig;
    console.log("[RightPane] 🔍 Extracting config:", JSON.stringify(config, null, 2));

    const cardObject = {
      config: config,
      domElement: null,
      inputElement: null,
      bubblesContainer: null,
      bubbledValues: [],

      getParameters: function () {
        console.log("[RightPane] 📋 Card getParameters() called for:", this.config.label);
        console.log("[RightPane] 🔍 Bubbled values:", this.bubbledValues);
        console.log("[RightPane] 🔍 paramName:", this.config.paramName);

        if (this.bubbledValues.length === 0) {
          console.log("[RightPane] ⚠️ No bubbled values, returning empty array");
          return [];
        }

        if (!this.config.paramName) {
          console.error("[RightPane] ❌ paramName missing in config! Cannot create parameter.");
          return [];
        }

        const result = [
          {
            parameter: this.config.paramName,
            values: this.bubbledValues.map((val) => ({ use: val })),
          },
        ];

        console.log("[RightPane] 📤 Returning parameters:", JSON.stringify(result, null, 2));
        return result;
      },
    };

    console.log("[RightPane] ✅ Card object structure created");
    return cardObject;
  };

  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane] 🛠 _renderCard() called");
    console.log("[RightPane] 📦 Card config:", JSON.stringify(cardObject.config, null, 2));

    try {
      const config = cardObject.config;

      // Create card
      const card = document.createElement("div");
      card.className = "right-pane-card";

      // Header
      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = config.label || config.optionName || "Unnamed Prompt";
      card.appendChild(header);

      // Param info
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";
      paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      card.appendChild(paramInfo);

      // Input wrapper (contains bubbles + input)
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "input-wrapper";

      // Bubbles container
      const bubblesContainer = document.createElement("div");
      bubblesContainer.className = "bubbles-container";
      inputWrapper.appendChild(bubblesContainer);

      // Input field
      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Type value and press Enter...";
      inputWrapper.appendChild(input);

      // Click wrapper to focus input
      inputWrapper.addEventListener("click", () => {
        input.focus();
      });

      card.appendChild(inputWrapper);

      // Store references
      cardObject.domElement = card;
      cardObject.inputElement = input;
      cardObject.bubblesContainer = bubblesContainer;

      // Handle Enter/Tab to create bubble
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();

          const value = input.value.trim();
          if (value) {
            console.log(`[RightPane] 🎯 Creating bubble for value: "${value}"`);
            this._createBubble(cardObject, value);
            input.value = "";

            if (this.m_oControlHost) {
              try {
                this.m_oControlHost.valueChanged();
                console.log(`[RightPane] ✅ Cognos notified of value change`);
              } catch (err) {
                console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
              }
            }
          }
        }
      });

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane] ❌ _renderCard() failed:", err);
    }
  };

  RightPane.prototype._createBubble = function (cardObject, value) {
    console.log(`[RightPane] 🫧 Creating bubble: "${value}"`);

    if (cardObject.bubbledValues.includes(value)) {
      console.warn(`[RightPane] ⚠️ Value "${value}" already exists as bubble`);
      return;
    }

    cardObject.bubbledValues.push(value);
    console.log(`[RightPane] 💾 Added to bubbledValues:`, cardObject.bubbledValues);

    // Create bubble
    const bubble = document.createElement("span");
    bubble.className = "bubble";

    // Value text
    const valueSpan = document.createElement("span");
    valueSpan.textContent = value;
    bubble.appendChild(valueSpan);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "bubble-remove";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      console.log(`[RightPane] 🗑 Remove button clicked for: "${value}"`);
      this._removeBubble(cardObject, value, bubble);
    });

    bubble.appendChild(removeBtn);
    cardObject.bubblesContainer.appendChild(bubble);
    console.log(`[RightPane] ✅ Bubble added to DOM`);
  };

  RightPane.prototype._removeBubble = function (cardObject, value, bubbleElement) {
    console.log(`[RightPane] 🗑 Removing bubble: "${value}"`);

    const index = cardObject.bubbledValues.indexOf(value);
    if (index > -1) {
      cardObject.bubbledValues.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from bubbledValues:`, cardObject.bubbledValues);
    }

    if (bubbleElement && bubbleElement.parentNode) {
      bubbleElement.parentNode.removeChild(bubbleElement);
      console.log(`[RightPane] ✅ Bubble removed from DOM`);
    }

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane] ✅ Cognos notified of value removal`);
      } catch (err) {
        console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
      }
    }
  };

  RightPane.prototype.getParameters = function () {
    console.log("[RightPane] 📋 getParameters() called");
    console.log("[RightPane] 📊 Total cards to check:", this.cards.length);

    try {
      const allParams = [];

      this.cards.forEach((cardObject, idx) => {
        console.log(`[RightPane] 🔍 Checking card ${idx}:`, cardObject.config.label);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane] ✅ Card ${idx} returned parameters:`, JSON.stringify(cardParams, null, 2));
        } else {
          console.log(`[RightPane] ⚠️ Card ${idx} has no parameters (no bubbled values)`);
        }
      });

      console.log("[RightPane] 📤 Final collected parameters:", JSON.stringify(allParams, null, 2));
      console.log("[RightPane] 📊 Total parameters collected:", allParams.length);

      return allParams;
    } catch (err) {
      console.error("[RightPane] ❌ getParameters() failed:", err);
      return [];
    }
  };

  RightPane.prototype.destroy = function () {
    console.log("[RightPane] 🧨 destroy() called");

    try {
      if (this.cardsContainer) {
        this.cardsContainer.innerHTML = "";
        this.cardsContainer = null;
      }

      if (this.domNode && this.domNode.parentNode) {
        this.domNode.parentNode.removeChild(this.domNode);
      }
      this.domNode = null;

      this.cards = [];
      this.autocompleteData = {};
      this.m_oControlHost = null;

      console.log("[RightPane] ✅ destroy() complete — cleanup successful");
    } catch (err) {
      console.error("[RightPane] ❌ destroy() failed:", err);
    }
  };

  return RightPane;
});
