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
      this.domNode.style.backgroundColor = "#d3d3d3";
      this.domNode.style.padding = "10px";
      this.domNode.style.minHeight = "360px";
      this.domNode.style.height = "100%";
      this.domNode.style.position = "relative";
      this.domNode.style.pointerEvents = "auto";

      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";
      this.cardsContainer.style.minHeight = "200px";
      this.cardsContainer.style.height = "auto";
      this.cardsContainer.style.minWidth = "120px";
      this.cardsContainer.style.backgroundColor = "#fffdd7ff";
      this.cardsContainer.style.pointerEvents = "auto";
      this.cardsContainer.style.padding = "10px";

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
      bubbledValues: [], // ✨ NEW: Store confirmed values as bubbles

      getParameters: function () {
        console.log("[RightPane] 📋 Card getParameters() called for:", this.config.label);
        console.log("[RightPane] 🔍 Bubbled values:", this.bubbledValues);
        console.log("[RightPane] 🔍 paramName:", this.config.paramName);

        // ✨ Only return bubbled values, NOT raw input
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
    console.log("[RightPane] 🔍 config.label:", config.label);
    console.log("[RightPane] 🔍 config.paramName:", config.paramName);
    console.log("[RightPane] 🔍 config.promptName:", config.promptName);
    console.log("[RightPane] 🔍 config.queryName:", config.queryName);

    return cardObject;
  };

  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane] 🛠 _renderCard() called");
    console.log("[RightPane] 📦 Card config:", JSON.stringify(cardObject.config, null, 2));

    try {
      const config = cardObject.config;

      const card = document.createElement("div");
      card.className = "right-pane-card";
      card.style.backgroundColor = "#d4edda";
      card.style.border = "2px solid #28a745";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "4px";
      card.style.minWidth = "480px";
      card.style.maxWidth = "720px";
      card.style.width = "auto";
      card.style.boxSizing = "border-box";

      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = config.label || config.optionName || "Unnamed Prompt";
      header.style.fontWeight = "bold";
      header.style.marginBottom = "5px";
      header.style.wordWrap = "break-word";
      header.style.overflow = "hidden";
      header.style.textOverflow = "ellipsis";
      card.appendChild(header);

      const paramInfo = document.createElement("div");
      paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      paramInfo.style.fontSize = "11px";
      paramInfo.style.color = "#666";
      paramInfo.style.marginBottom = "5px";
      card.appendChild(paramInfo);

      // ✨ NEW: Create input-like container for bubbles + input
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "input-wrapper";
      inputWrapper.style.display = "flex";
      inputWrapper.style.flexWrap = "wrap";
      inputWrapper.style.alignItems = "center";
      inputWrapper.style.gap = "5px";
      inputWrapper.style.padding = "5px";
      inputWrapper.style.border = "1px solid #28a745";
      inputWrapper.style.borderRadius = "3px";
      inputWrapper.style.backgroundColor = "#fff";
      inputWrapper.style.minHeight = "32px";
      inputWrapper.style.cursor = "text";
      inputWrapper.style.boxSizing = "border-box";

      // ✨ Bubbles container (inside wrapper)
      const bubblesContainer = document.createElement("div");
      bubblesContainer.className = "bubbles-container";
      bubblesContainer.style.display = "flex";
      bubblesContainer.style.flexWrap = "wrap";
      bubblesContainer.style.gap = "5px";
      inputWrapper.appendChild(bubblesContainer);

      // ✨ Actual input (inline, grows as needed)
      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Type value and press Enter...";
      input.style.border = "none";
      input.style.outline = "none";
      input.style.flex = "1";
      input.style.minWidth = "120px";
      input.style.padding = "2px";
      input.style.fontSize = "14px";
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

      // ✨ NEW: Handle Enter/Tab to create bubble
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();

          const value = input.value.trim();
          if (value) {
            console.log(`[RightPane] 🎯 Creating bubble for value: "${value}"`);
            this._createBubble(cardObject, value);
            input.value = ""; // Clear input

            // Notify Cognos of change
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

  // ✨ NEW: Create bubble
  RightPane.prototype._createBubble = function (cardObject, value) {
    console.log(`[RightPane] 🫧 Creating bubble: "${value}"`);

    // Check if value already exists
    if (cardObject.bubbledValues.includes(value)) {
      console.warn(`[RightPane] ⚠️ Value "${value}" already exists as bubble`);
      return;
    }

    // Add to bubbledValues array
    cardObject.bubbledValues.push(value);
    console.log(`[RightPane] 💾 Added to bubbledValues:`, cardObject.bubbledValues);

    // Create bubble DOM element
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.style.display = "inline-flex";
    bubble.style.alignItems = "center";
    bubble.style.gap = "5px";
    bubble.style.padding = "3px 8px";
    bubble.style.backgroundColor = "#88c1ed";
    bubble.style.color = "#000";
    bubble.style.borderRadius = "12px";
    bubble.style.fontSize = "13px";
    bubble.style.fontWeight = "500";
    bubble.style.whiteSpace = "nowrap";

    // Value text
    const valueSpan = document.createElement("span");
    valueSpan.textContent = value;
    bubble.appendChild(valueSpan);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.style.border = "none";
    removeBtn.style.background = "transparent";
    removeBtn.style.color = "#000";
    removeBtn.style.fontSize = "18px";
    removeBtn.style.fontWeight = "bold";
    removeBtn.style.lineHeight = "1";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.padding = "0";
    removeBtn.style.margin = "0";
    removeBtn.style.width = "16px";
    removeBtn.style.height = "16px";

    removeBtn.addEventListener("click", () => {
      console.log(`[RightPane] 🗑 Remove button clicked for: "${value}"`);
      this._removeBubble(cardObject, value, bubble);
    });

    bubble.appendChild(removeBtn);

    // Add to bubbles container
    cardObject.bubblesContainer.appendChild(bubble);
    console.log(`[RightPane] ✅ Bubble added to DOM`);
  };

  // ✨ NEW: Remove bubble
  RightPane.prototype._removeBubble = function (cardObject, value, bubbleElement) {
    console.log(`[RightPane] 🗑 Removing bubble: "${value}"`);

    // Remove from bubbledValues array
    const index = cardObject.bubbledValues.indexOf(value);
    if (index > -1) {
      cardObject.bubbledValues.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from bubbledValues:`, cardObject.bubbledValues);
    }

    // Remove bubble from DOM
    if (bubbleElement && bubbleElement.parentNode) {
      bubbleElement.parentNode.removeChild(bubbleElement);
      console.log(`[RightPane] ✅ Bubble removed from DOM`);
    }

    // Notify Cognos of change
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
        console.log(`[RightPane] 🔍 Bubbled values:`, cardObject.bubbledValues);

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
