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
    this.dataStores = {};
    this.locale = "en"; // Default locale
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get Localized Text
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype.getLocalizedText = function (config, property) {
    const pluralProperty = property + "s";

    if (config[pluralProperty] && typeof config[pluralProperty] === "object") {
      if (config[pluralProperty][this.locale]) {
        return config[pluralProperty][this.locale];
      }
      if (config[pluralProperty]["en"]) {
        return config[pluralProperty]["en"];
      }
      const keys = Object.keys(config[pluralProperty]);
      if (keys.length > 0) {
        return config[pluralProperty][keys[0]];
      }
    }

    return config[property] || "";
  };

  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] 🔧 initialize() called");

    this.m_oControlHost = oControlHost;
    console.log("[RightPane] 💾 Stored oControlHost");

    // Detect locale
    if (oControlHost.locale) {
      this.locale = oControlHost.locale.substring(0, 2);
      console.log("[RightPane] 🌍 Detected locale:", this.locale);
    }

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

  RightPane.prototype.setDataStores = function (dataStores) {
    console.log("[RightPane] 📦 setDataStores() called");
    this.dataStores = dataStores || {};
    console.log("[RightPane] 💾 Available DataStores:", Object.keys(this.dataStores));

    Object.keys(this.dataStores).forEach((key) => {
      const ds = this.dataStores[key];
      console.log(`[RightPane] 📊 DataStore "${key}": ${ds.rowCount} rows`);
    });
  };

  RightPane.prototype.hasCard = function (paramName) {
    const exists = this.cards.some((card) => card.config.paramName === paramName);
    console.log(`[RightPane] 🔍 hasCard(${paramName}):`, exists);
    return exists;
  };

  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] ➕ addCard() called!");
    console.log("[RightPane] 📦 Received cardData:", JSON.stringify(cardData, null, 2));

    try {
      if (!cardData.fullConfig) {
        console.error("[RightPane] ❌ cardData.fullConfig is missing! Cannot create card.");
        console.log("[RightPane] ↩ Aborting card creation");
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
      sourceButton: cardData.sourceButton || null,
      dateFromInput: null, // For date ranges
      dateToInput: null, // For date ranges

      getParameters: function () {
        console.log("[RightPane] 📋 Card getParameters() called for:", this.config.label);
        console.log("[RightPane] 🔍 Bubbled values:", this.bubbledValues);
        console.log("[RightPane] 🔍 paramName:", this.config.paramName);
        console.log("[RightPane] 🔍 Card type:", this.config.type);

        if (!this.config.paramName) {
          console.error("[RightPane] ❌ paramName missing in config!");
          return [];
        }

        let values;

        // Handle date range
        if (this.config.type === "dateRange") {
          const fromValue = this.dateFromInput ? this.dateFromInput.value : "";
          const toValue = this.dateToInput ? this.dateToInput.value : "";

          if (!fromValue || !toValue) {
            console.log("[RightPane] ⚠️ Date range incomplete - returning empty");
            values = [];
          } else {
            values = [
              { use: fromValue, display: fromValue },
              { use: toValue, display: toValue },
            ];
            console.log("[RightPane] 📅 Date range values:", values);
          }
        }
        // Handle regular bubbles
        else if (this.bubbledValues.length === 0) {
          console.log("[RightPane] ⚠️ No bubbled values - returning empty array");
          values = [];
        } else {
          values = this.bubbledValues.map((val) => ({
            use: val.use,
            display: val.display,
          }));
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

  RightPane.prototype.removeCard = function (cardObject) {
    console.log(`[RightPane] 🗑 removeCard() called for:`, cardObject.config.label);

    console.log(`[RightPane] 🧹 Clearing bubbledValues before removal`);
    cardObject.bubbledValues = [];

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane] ✅ Cognos notified of parameter clearing`);
      } catch (err) {
        console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
      }
    }

    const index = this.cards.indexOf(cardObject);
    if (index > -1) {
      this.cards.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from cards array at index ${index}`);
      console.log(`[RightPane] 💾 After removal, total cards:`, this.cards.length);
    } else {
      console.warn(`[RightPane] ⚠️ Card not found in cards array!`);
    }

    if (cardObject.domElement && cardObject.domElement.parentNode) {
      cardObject.domElement.parentNode.removeChild(cardObject.domElement);
      console.log(`[RightPane] ✅ Removed card DOM element`);
    }

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

      // Header container with X button
      const headerContainer = document.createElement("div");
      headerContainer.className = "card-header-container";

      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      const headerText = this.getLocalizedText(config, "label") || config.optionName || "Unnamed Prompt";
      header.textContent = headerText;
      headerContainer.appendChild(header);

      // X button
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

      // Help text (localized)
      const helpText = this.getLocalizedText(config, "helpText");
      if (helpText) {
        const helpDiv = document.createElement("div");
        helpDiv.className = "right-pane-card-help-text";
        helpDiv.textContent = helpText;
        card.appendChild(helpDiv);
      }

      // Required indicator
      if (config.required) {
        const requiredDiv = document.createElement("div");
        requiredDiv.className = "right-pane-card-required";
        requiredDiv.textContent = "★ Required";
        card.appendChild(requiredDiv);
      }

      // Render based on type
      if (config.type === "dateRange") {
        this._renderDateRangeInput(card, cardObject);
      } else if (config.type === "date") {
        this._renderDateInput(card, cardObject);
      } else {
        this._renderBubbleInput(card, cardObject);
      }

      this.cardsContainer.appendChild(card);
      cardObject.domElement = card;
      console.log("[RightPane] ✅ Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane] ❌ _renderCard() failed:", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER DATE RANGE INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._renderDateRangeInput = function (card, cardObject) {
    const container = document.createElement("div");
    container.className = "date-range-container";

    // FROM field
    const fromField = document.createElement("div");
    fromField.className = "date-range-field";
    const fromLabel = document.createElement("label");
    fromLabel.textContent = this.locale === "de" ? "VON" : "FROM";
    fromField.appendChild(fromLabel);

    const fromInput = document.createElement("input");
    fromInput.type = "date";
    fromInput.className = "date-input";
    fromField.appendChild(fromInput);

    // TO field
    const toField = document.createElement("div");
    toField.className = "date-range-field";
    const toLabel = document.createElement("label");
    toLabel.textContent = this.locale === "de" ? "BIS" : "TO";
    toField.appendChild(toLabel);

    const toInput = document.createElement("input");
    toInput.type = "date";
    toInput.className = "date-input";
    toField.appendChild(toInput);

    container.appendChild(fromField);
    container.appendChild(toField);
    card.appendChild(container);

    // Store references
    cardObject.dateFromInput = fromInput;
    cardObject.dateToInput = toInput;

    // Notify on change
    const notifyChange = () => {
      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane] ✅ Date range changed - Cognos notified`);
        } catch (err) {
          console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
        }
      }
    };

    fromInput.addEventListener("change", notifyChange);
    toInput.addEventListener("change", notifyChange);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER SINGLE DATE INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._renderDateInput = function (card, cardObject) {
    const input = document.createElement("input");
    input.type = "date";
    input.className = "date-input date-input-single";
    card.appendChild(input);

    cardObject.inputElement = input;

    input.addEventListener("change", () => {
      const dateValue = input.value;
      if (dateValue) {
        // Clear existing
        cardObject.bubbledValues = [];
        // Add as bubble
        cardObject.bubbledValues.push({
          use: dateValue,
          display: dateValue,
        });

        if (this.m_oControlHost) {
          try {
            this.m_oControlHost.valueChanged();
            console.log(`[RightPane] ✅ Date selected - Cognos notified`);
          } catch (err) {
            console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
          }
        }
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER BUBBLE INPUT (Regular/Text)
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._renderBubbleInput = function (card, cardObject) {
    const config = cardObject.config;
    const queryName = config.queryName;
    let datalistId = null;

    // Create datalist only if NOT text type and has queryName
    if (config.type !== "text" && queryName && this.dataStores && this.dataStores[queryName]) {
      console.log(`[RightPane] ✅ Found DataStore for ${queryName}`);

      const dataStore = this.dataStores[queryName];
      let useCol = config.useColumn !== undefined ? config.useColumn : 0;
      let displayCol = config.displayColumn !== undefined ? config.displayColumn : 1;

      console.log(`[RightPane] 📋 Config requested useColumn: ${useCol}, displayColumn: ${displayCol}`);
      console.log(`[RightPane] 📋 DataStore "${queryName}" has ${dataStore.columnCount} column(s)`);

      if (useCol >= dataStore.columnCount) {
        console.warn(`[RightPane] ⚠️ useColumn ${useCol} out of bounds`);
        useCol = 0;
      }

      if (displayCol >= dataStore.columnCount) {
        console.warn(`[RightPane] ⚠️ displayColumn ${displayCol} out of bounds`);
        displayCol = useCol;
      }

      console.log(`[RightPane] ✅ Final validated columns - useColumn: ${useCol}, displayColumn: ${displayCol}`);

      cardObject.validatedUseCol = useCol;
      cardObject.validatedDisplayCol = displayCol;

      datalistId = `datalist-${queryName}-${Date.now()}`;
      const datalist = document.createElement("datalist");
      datalist.id = datalistId;

      console.log(`[RightPane] 📋 Populating datalist with ${dataStore.rowCount} values`);
      for (let i = 0; i < dataStore.rowCount; i++) {
        const displayValue = dataStore.getCellValue(i, displayCol);
        const useValue = dataStore.getCellValue(i, useCol);

        const option = document.createElement("option");
        option.value = displayValue;
        option.setAttribute("data-use-value", useValue);
        datalist.appendChild(option);

        if (i < 3) {
          console.log(`[RightPane] 📋 Row ${i}: display="${displayValue}", use="${useValue}"`);
        }
      }

      card.appendChild(datalist);
      console.log(`[RightPane] ✅ Created datalist with ID: ${datalistId}`);
    } else if (config.type === "text") {
      console.log(`[RightPane] 📝 Text-only input - no datalist`);
    } else {
      console.log(`[RightPane] ⚠️ No DataStore found for queryName: ${queryName}`);
    }

    // Input wrapper
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
    input.placeholder = config.type === "text" ? "Type value and press Enter..." : "Type or select value...";

    if (datalistId) {
      input.setAttribute("list", datalistId);
      console.log(`[RightPane] 🔗 Input linked to datalist: ${datalistId}`);
    }

    inputWrapper.appendChild(input);

    // Click wrapper to focus input
    inputWrapper.addEventListener("click", (e) => {
      if (e.target !== input) {
        input.focus();
        input.click();
      }
    });

    // ✨ PASTE HANDLER
    inputWrapper.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      console.log(`[RightPane] 📋 Paste detected:`, pastedText);

      // Split by common delimiters
      const values = pastedText
        .split(/[\n\r\t,;]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      console.log(`[RightPane] 📋 Parsed ${values.length} values:`, values);

      values.forEach((val) => {
        let useValue = val;
        let displayValue = val;

        // Try to map from datalist
        if (datalistId && config.queryName && this.dataStores[config.queryName]) {
          const dataStore = this.dataStores[config.queryName];
          const useCol = cardObject.validatedUseCol;
          const displayCol = cardObject.validatedDisplayCol;

          for (let i = 0; i < dataStore.rowCount; i++) {
            const dsDisplay = dataStore.getCellValue(i, displayCol);
            const dsUse = dataStore.getCellValue(i, useCol);

            if (dsDisplay === val || dsUse === val) {
              useValue = dsUse;
              displayValue = dsDisplay;
              break;
            }
          }
        }

        this._createBubble(cardObject, displayValue, useValue);
      });

      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane] ✅ Paste complete - Cognos notified`);
        } catch (err) {
          console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
        }
      }
    });

    card.appendChild(inputWrapper);

    // Store references
    cardObject.inputElement = input;
    cardObject.bubblesContainer = bubblesContainer;

    // Enter/Tab handler
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();

        const displayValue = input.value.trim();
        if (displayValue) {
          let useValue = displayValue;

          // Map from datalist
          if (datalistId && config.queryName && this.dataStores[config.queryName]) {
            const dataStore = this.dataStores[config.queryName];
            const useCol = cardObject.validatedUseCol;
            const displayCol = cardObject.validatedDisplayCol;

            for (let i = 0; i < dataStore.rowCount; i++) {
              const dsDisplay = dataStore.getCellValue(i, displayCol);
              if (dsDisplay === displayValue) {
                useValue = dataStore.getCellValue(i, useCol);
                console.log(`[RightPane] 🔍 Mapped "${displayValue}" → use="${useValue}"`);
                break;
              }
            }
          }

          console.log(`[RightPane] 🎯 Creating bubble: display="${displayValue}", use="${useValue}"`);
          this._createBubble(cardObject, displayValue, useValue);
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

    // Change event (datalist selection)
    input.addEventListener("change", (e) => {
      const displayValue = input.value.trim();

      if (displayValue && datalistId) {
        let useValue = displayValue;

        if (config.queryName && this.dataStores[config.queryName]) {
          const dataStore = this.dataStores[config.queryName];
          const useCol = cardObject.validatedUseCol;
          const displayCol = cardObject.validatedDisplayCol;

          for (let i = 0; i < dataStore.rowCount; i++) {
            const dsDisplay = dataStore.getCellValue(i, displayCol);
            if (dsDisplay === displayValue) {
              useValue = dataStore.getCellValue(i, useCol);
              console.log(`[RightPane] 🔍 Mapped "${displayValue}" → use="${useValue}"`);
              break;
            }
          }
        }

        console.log(`[RightPane] 🎯 Datalist selection confirmed: display="${displayValue}", use="${useValue}"`);
        this._createBubble(cardObject, displayValue, useValue);
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
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE BUBBLE (with maxValues enforcement)
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._createBubble = function (cardObject, displayValue, useValue) {
    console.log(`[RightPane] 🫧 Creating bubble: display="${displayValue}", use="${useValue}"`);

    // ✨ CHECK maxValues
    const maxValues = cardObject.config.maxValues;
    if (maxValues && cardObject.bubbledValues.length >= maxValues) {
      console.warn(`[RightPane] ⚠️ maxValues limit reached (${maxValues}) - clearing existing values`);
      // Clear all existing bubbles
      cardObject.bubbledValues = [];
      if (cardObject.bubblesContainer) {
        cardObject.bubblesContainer.innerHTML = "";
      }
    }

    // Check for duplicate
    if (cardObject.bubbledValues.some((v) => v.display === displayValue)) {
      console.warn(`[RightPane] ⚠️ Value "${displayValue}" already exists as bubble`);
      return;
    }

    // Store value
    cardObject.bubbledValues.push({
      display: displayValue,
      use: useValue || displayValue,
    });
    console.log(`[RightPane] 💾 Added to bubbledValues:`, cardObject.bubbledValues);

    // Create bubble DOM
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.title = displayValue;

    const valueSpan = document.createElement("span");
    valueSpan.textContent = displayValue;
    bubble.appendChild(valueSpan);

    const removeBtn = document.createElement("button");
    removeBtn.className = "bubble-remove";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      console.log(`[RightPane] 🗑 Remove button clicked for: "${displayValue}"`);
      this._removeBubble(cardObject, displayValue, bubble);
    });

    bubble.appendChild(removeBtn);
    cardObject.bubblesContainer.appendChild(bubble);
    console.log(`[RightPane] ✅ Bubble added to DOM`);
  };

  RightPane.prototype._removeBubble = function (cardObject, displayValue, bubbleElement) {
    console.log(`[RightPane] 🗑 Removing bubble: "${displayValue}"`);
    console.log(`[RightPane] 🔍 Before removal, bubbledValues:`, cardObject.bubbledValues);

    const index = cardObject.bubbledValues.findIndex((v) => v.display === displayValue);
    if (index > -1) {
      cardObject.bubbledValues.splice(index, 1);
      console.log(`[RightPane] 💾 Removed from bubbledValues at index ${index}`);
      console.log(`[RightPane] 💾 After removal, bubbledValues:`, cardObject.bubbledValues);
    } else {
      console.warn(`[RightPane] ⚠️ Value "${displayValue}" not found in bubbledValues!`);
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
        console.log(`[RightPane] 🔍 Card ${idx} bubbledValues:`, cardObject.bubbledValues);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane] ✅ Card ${idx} returned parameters:`, JSON.stringify(cardParams, null, 2));
        } else {
          console.log(`[RightPane] ⚠️ Card ${idx} has no parameters`);
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

      console.log("[RightPane] ✅ destroy() complete – cleanup successful");
    } catch (err) {
      console.error("[RightPane] ❌ destroy() failed:", err);
    }
  };

  return RightPane;
});
