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
    this.dataStores = {}; // ✨ NEW: Store DataStores
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

  // ✨ NEW: Method to receive DataStores
  RightPane.prototype.setDataStores = function (dataStores) {
    console.log("[RightPane] 📦 setDataStores() called");
    this.dataStores = dataStores || {};
    console.log("[RightPane] 💾 Available DataStores:", Object.keys(this.dataStores));

    // Log details about each DataStore
    Object.keys(this.dataStores).forEach((key) => {
      const ds = this.dataStores[key];
      console.log(`[RightPane] 📊 DataStore "${key}": ${ds.rowCount} rows`);
    });
  };

  // ✨ NEW: Check if card with paramName already exists
  RightPane.prototype.hasCard = function (paramName) {
    const exists = this.cards.some((card) => card.config.paramName === paramName);
    console.log(`[RightPane] 🔍 hasCard(${paramName}):`, exists);
    return exists;
  };

  //AddCard Method to create Cards
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
      sourceButton: cardData.sourceButton || null, // ✨ NEW: Store source button reference

      getParameters: function () {
        console.log("[RightPane] 📋 Card getParameters() called for:", this.config.label);
        console.log("[RightPane] 🔍 Bubbled values:", this.bubbledValues);
        console.log("[RightPane] 🔍 paramName:", this.config.paramName);

        if (!this.config.paramName) {
          console.error("[RightPane] ❌ paramName missing in config!");
          return [];
        }

        // Test what structure works for "cleared" state
        let values;

        if (this.bubbledValues.length === 0) {
          console.log("[RightPane] ⚠️ No bubbled values - testing cleared state");
          // Try option 1: empty array
          values = [];
          // Or try option 2: array with empty string (uncomment to test)
          // values = [{ use: "" }];
          // Or try option 3: array with null (uncomment to test)
          // values = [{ use: null }];
        } else {
          values = this.bubbledValues.map((val) => ({ use: val }));
        }

        const result = [
          {
            parameter: this.config.paramName,
            values: values,
          },
        ];

        console.log("[RightPane] 📤 Returning:", JSON.stringify(result, null, 2));
        return result;
      },
    };

    console.log("[RightPane] ✅ Card object structure created");
    return cardObject;
  };

  // Remove card Method and re-enable source button
  RightPane.prototype.removeCard = function (cardObject) {
    console.log(`[RightPane] 🗑 removeCard() called for:`, cardObject.config.label);

    // ✨ CRITICAL: Clear bubbled values BEFORE notifying Cognos
    // This ensures getParameters() returns empty values array for this param
    console.log(`[RightPane] 🧹 Clearing bubbledValues before removal`);
    cardObject.bubbledValues = [];

    // Notify Cognos FIRST (while card still in array)
    // This triggers getParameters() which will return empty values for this param
    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane] ✅ Cognos notified of parameter clearing`);
      } catch (err) {
        console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
      }
    }

    // NOW remove from cards array
    const index = this.cards.indexOf(cardObject);
    if (index > -1) {
      this.cards.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from cards array at index ${index}`);
    }

    // Remove from DOM
    if (cardObject.domElement && cardObject.domElement.parentNode) {
      cardObject.domElement.parentNode.removeChild(cardObject.domElement);
      console.log(`[RightPane] ✅ Removed card DOM element`);
    }

    // Re-enable source button
    if (cardObject.sourceButton) {
      cardObject.sourceButton.classList.remove("disabled");
      console.log(`[RightPane] 🎨 Re-enabled source button`);
    }
  };

  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane] 🛠 _renderCard() called");
    console.log("[RightPane] 📦 Card config:", JSON.stringify(cardObject.config, null, 2));

    try {
      const config = cardObject.config;

      // Create card
      const card = document.createElement("div");
      card.className = "right-pane-card";

      // Header with X button
      const headerContainer = document.createElement("div");
      headerContainer.style.display = "flex";
      headerContainer.style.justifyContent = "space-between";
      headerContainer.style.alignItems = "center";
      headerContainer.style.marginBottom = "5px";

      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = config.label || config.optionName || "Unnamed Prompt";
      header.style.flex = "1";
      headerContainer.appendChild(header);

      // ✨ NEW: X button to remove card
      const removeCardBtn = document.createElement("button");
      removeCardBtn.className = "card-remove-btn";
      removeCardBtn.textContent = "×";
      removeCardBtn.title = "Remove card";

      removeCardBtn.addEventListener("click", () => {
        console.log(`[RightPane] 🗑 Card remove button clicked for: ${config.label}`);
        this.removeCard(cardObject);
      });

      headerContainer.appendChild(removeCardBtn);
      card.appendChild(headerContainer);

      // Param info
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";
      paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      card.appendChild(paramInfo);

      // ✨ Check if DataStore exists for this card's queryName
      const queryName = config.queryName;
      let datalistId = null;

      if (queryName && this.dataStores && this.dataStores[queryName]) {
        console.log(`[RightPane] ✅ Found DataStore for ${queryName}`);

        const dataStore = this.dataStores[queryName];
        datalistId = `datalist-${queryName}-${Date.now()}`;

        const datalist = document.createElement("datalist");
        datalist.id = datalistId;

        console.log(`[RightPane] 📋 Populating datalist with ${dataStore.rowCount} values`);
        for (let i = 0; i < dataStore.rowCount; i++) {
          const value = dataStore.getCellValue(i, 0);
          const option = document.createElement("option");
          option.value = value;
          datalist.appendChild(option);
        }

        card.appendChild(datalist);
        console.log(`[RightPane] ✅ Created datalist with ID: ${datalistId}`);
      } else {
        console.log(`[RightPane] ⚠️ No DataStore found for queryName: ${queryName}`);
      }

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

      if (datalistId) {
        input.setAttribute("list", datalistId);
        console.log(`[RightPane] 🔗 Input linked to datalist: ${datalistId}`);
      }

      inputWrapper.appendChild(input);

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

  // _removeBubble Method
  RightPane.prototype._removeBubble = function (cardObject, value, bubbleElement) {
    console.log(`[RightPane] 🗑 Removing bubble: "${value}"`);
    console.log(`[RightPane] 🔍 Before removal, bubbledValues:`, cardObject.bubbledValues);

    const index = cardObject.bubbledValues.indexOf(value);
    if (index > -1) {
      cardObject.bubbledValues.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from bubbledValues at index ${index}`);
      console.log(`[RightPane] 💾 After removal, bubbledValues:`, cardObject.bubbledValues);
    } else {
      console.warn(`[RightPane] ⚠️ Value "${value}" not found in bubbledValues!`);
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

  // GetParameters Method
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane] 📋 getParameters() called");
    console.log("[RightPane] 📊 Total cards to check:", this.cards.length);

    try {
      const allParams = [];

      this.cards.forEach((cardObject, idx) => {
        console.log(`[RightPane] 🔍 Checking card ${idx}:`, cardObject.config.label);
        console.log(`[RightPane] 🔍 Card ${idx} bubbledValues:`, cardObject.bubbledValues);

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
      this.dataStores = {};

      console.log("[RightPane] ✅ destroy() complete — cleanup successful");
    } catch (err) {
      console.error("[RightPane] ❌ destroy() failed:", err);
    }
  };

  return RightPane;
});
