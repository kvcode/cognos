define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] ðŸ— Constructor called");
    this.domNode = null;
    this.cardsContainer = null;
    this.autocompleteData = {};
    this.m_oControlHost = null;
    this.cards = [];
    this.dataStores = {};
    this.locale = "en";
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // HELPER: Get Localized Text
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // INITIALIZE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] ðŸ”§ initialize() called");

    this.m_oControlHost = oControlHost;
    console.log("[RightPane] ðŸ’¾ Stored oControlHost");

    if (oControlHost.locale) {
      this.locale = oControlHost.locale.substring(0, 2);
      console.log("[RightPane] ðŸŒ Detected locale:", this.locale);
    }

    try {
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";

      this.domNode.appendChild(this.cardsContainer);

      const config = oControlHost.configuration || {};
      console.log("[RightPane] âš™ï¸ Configuration received:", config);

      this.autocompleteData = config.autocompleteTags || {};
      console.log("[RightPane] ðŸ§© Autocomplete data loaded:", this.autocompleteData);

      console.log("[RightPane] âœ… Initialization complete");
      fnDoneInitializing();
    } catch (err) {
      console.error("[RightPane] âŒ initialize() failed:", err);
      fnDoneInitializing();
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // DRAW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.draw = function (oControlHost) {
    console.log("[RightPane] ðŸ–¼ draw() called");

    try {
      if (!this.domNode) {
        console.warn("[RightPane] âš ï¸ domNode not initialized, aborting draw");
        return;
      }

      this.cardsContainer.innerHTML = "";
      console.log("[RightPane] ðŸ§¹ Cleared previous cards");

      this.cards.forEach((cardObject) => {
        this._renderCard(cardObject);
      });
      console.log("[RightPane] âœ… Rendered", this.cards.length, "cards");
    } catch (err) {
      console.error("[RightPane] âŒ draw() failed:", err);
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SET DATA STORES
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.setDataStores = function (dataStores) {
    console.log("[RightPane] ðŸ“¦ setDataStores() called");
    this.dataStores = dataStores || {};
    console.log("[RightPane] ðŸ’¾ Available DataStores:", Object.keys(this.dataStores));

    Object.keys(this.dataStores).forEach((key) => {
      const ds = this.dataStores[key];
      console.log(`[RightPane] ðŸ“Š DataStore "${key}": ${ds.rowCount} rows`);
    });
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // HAS CARD - Check if card exists for paramName
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.hasCard = function (paramName) {
    const exists = this.cards.some((card) => {
      if (card.config.paramName === paramName) {
        return true;
      }
      if (card.config.paramNames) {
        return card.config.paramNames.from === paramName || card.config.paramNames.to === paramName;
      }
      return false;
    });
    console.log(`[RightPane] ðŸ” hasCard(${paramName}):`, exists);
    return exists;
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADD CARD
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] âž• addCard() called!");
    console.log("[RightPane] ðŸ“¦ Received cardData:", JSON.stringify(cardData, null, 2));

    try {
      if (!cardData.fullConfig) {
        console.error("[RightPane] âŒ cardData.fullConfig is missing! Cannot create card.");
        console.log("[RightPane] â†© Aborting card creation");
        return;
      }

      console.log("[RightPane] âœ… fullConfig found:", JSON.stringify(cardData.fullConfig, null, 2));

      const cardObject = this._createCardObject(cardData);
      console.log("[RightPane] ðŸ— Card object created:", cardObject);

      this.cards.push(cardObject);
      console.log("[RightPane] ðŸ’¾ Card object stored in cards array");
      console.log("[RightPane] ðŸ“Š Total cards now:", this.cards.length);

      if (this.cardsContainer) {
        this._renderCard(cardObject);
        console.log("[RightPane] âœ… Card rendered to DOM");
      } else {
        console.warn("[RightPane] âš ï¸ cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] âŒ addCard() failed:", err);
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CREATE CARD OBJECT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._createCardObject = function (cardData) {
    console.log("[RightPane] ðŸ— _createCardObject() called");

    const config = cardData.fullConfig;
    console.log("[RightPane] ðŸ” Extracting config:", JSON.stringify(config, null, 2));

    const cardObject = {
      config: config,
      domElement: null,
      inputElement: null,
      bubblesContainer: null,
      bubbledValues: [],
      sourceButton: cardData.sourceButton || null,
      isRequired: cardData.isRequired || false,
      dateFromInput: null,
      dateToInput: null,
      suggestionBox: null, // âœ¨ NEW: For searchSelect

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // GET PARAMETERS - Called by Cognos on finish
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      getParameters: function () {
        console.log("[RightPane] ðŸ“‹ Card getParameters() called for:", this.config.label);
        console.log("[RightPane] ðŸ” promptType:", this.config.promptType);

        const promptType = this.config.promptType || "";

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // TYPE: dateRange - Single parameter with range format for in_range()
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (promptType === "dateRange") {
          console.log("[RightPane] ðŸ“… Processing dateRange type");

          if (!this.config.paramName) {
            console.error("[RightPane] âŒ paramName missing for dateRange!");
            return [];
          }

          const fromValue = this.dateFromInput ? this.dateFromInput.value : "";
          const toValue = this.dateToInput ? this.dateToInput.value : "";

          if (!fromValue || !toValue) {
            console.log("[RightPane] âš ï¸ Date range incomplete - returning empty");
            return [
              {
                parameter: this.config.paramName,
                values: [],
              },
            ];
          }

          const result = [
            {
              parameter: this.config.paramName,
              values: [
                {
                  start: {
                    use: fromValue,
                    display: fromValue,
                  },
                  end: {
                    use: toValue,
                    display: toValue,
                  },
                },
              ],
            },
          ];

          console.log("[RightPane] ðŸ“… DateRange returning RangeParameter:", JSON.stringify(result, null, 2));
          return result;
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // TYPE: dateFromTo - Two separate parameters for BETWEEN ? AND ?
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (promptType === "dateFromTo") {
          console.log("[RightPane] ðŸ“… Processing dateFromTo type");

          if (!this.config.paramNames || !this.config.paramNames.from || !this.config.paramNames.to) {
            console.error("[RightPane] âŒ paramNames.from/to missing for dateFromTo!");
            return [];
          }

          const fromValue = this.dateFromInput ? this.dateFromInput.value : "";
          const toValue = this.dateToInput ? this.dateToInput.value : "";

          const result = [];

          if (fromValue) {
            result.push({
              parameter: this.config.paramNames.from,
              values: [{ use: fromValue, display: fromValue }],
            });
          } else {
            result.push({
              parameter: this.config.paramNames.from,
              values: [],
            });
          }

          if (toValue) {
            result.push({
              parameter: this.config.paramNames.to,
              values: [{ use: toValue, display: toValue }],
            });
          } else {
            result.push({
              parameter: this.config.paramNames.to,
              values: [],
            });
          }

          console.log("[RightPane] ðŸ“… DateFromTo returning two parameters:", JSON.stringify(result, null, 2));
          return result;
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // TYPE: date - Single date value
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (promptType === "date") {
          console.log("[RightPane] ðŸ“… Processing date type");

          if (!this.config.paramName) {
            console.error("[RightPane] âŒ paramName missing for date!");
            return [];
          }

          const result = [
            {
              parameter: this.config.paramName,
              values: this.bubbledValues.map((val) => ({
                use: val.use,
                display: val.display,
              })),
            },
          ];

          console.log("[RightPane] ðŸ“… Date returning:", JSON.stringify(result, null, 2));
          return result;
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // DEFAULT: Regular value prompt (bubble-based) - includes searchSelect
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (!this.config.paramName) {
          console.error("[RightPane] âŒ paramName missing in config!");
          return [];
        }

        const result = [
          {
            parameter: this.config.paramName,
            values: this.bubbledValues.map((val) => ({
              use: val.use,
              display: val.display,
            })),
          },
        ];

        console.log("[RightPane] ðŸ“¤ Returning:", JSON.stringify(result, null, 2));
        return result;
      },
    };

    console.log("[RightPane] âœ… Card object structure created");
    return cardObject;
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REMOVE CARD
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.removeCard = function (cardObject) {
    console.log(`[RightPane] ðŸ—‘ removeCard() called for:`, cardObject.config.label);

    if (cardObject.isRequired) {
      console.warn(`[RightPane] âš ï¸ Cannot remove required card: ${cardObject.config.label}`);
      return;
    }

    console.log(`[RightPane] ðŸ§¹ Clearing bubbledValues before removal`);
    cardObject.bubbledValues = [];

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane] âœ… Cognos notified of parameter clearing`);
      } catch (err) {
        console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
      }
    }

    const index = this.cards.indexOf(cardObject);
    if (index > -1) {
      this.cards.splice(index, 1);
      console.log(`[RightPane] ðŸ’¾ Removed from cards array at index ${index}`);
      console.log(`[RightPane] ðŸ’¾ After removal, total cards:`, this.cards.length);
    } else {
      console.warn(`[RightPane] âš ï¸ Card not found in cards array!`);
    }

    if (cardObject.domElement && cardObject.domElement.parentNode) {
      cardObject.domElement.parentNode.removeChild(cardObject.domElement);
      console.log(`[RightPane] âœ… Removed card DOM element`);
    }

    if (cardObject.sourceButton) {
      cardObject.sourceButton.classList.remove("disabled");
      console.log(`[RightPane] ðŸŽ¨ Re-enabled source button`);
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER CARD
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane] ðŸ›  _renderCard() called");
    console.log("[RightPane] ðŸ“¦ Card config:", JSON.stringify(cardObject.config, null, 2));

    try {
      const config = cardObject.config;
      const promptType = config.promptType || "";

      const card = document.createElement("div");
      card.className = "right-pane-card";

      if (cardObject.isRequired || config.required) {
        card.classList.add("required-card");
      }

      // Header container with X button
      const headerContainer = document.createElement("div");
      headerContainer.className = "card-header-container";

      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      const headerText = this.getLocalizedText(config, "label") || config.optionName || "Unnamed Prompt";
      header.textContent = headerText;
      headerContainer.appendChild(header);

      // X button (hidden for required cards)
      if (!cardObject.isRequired && !config.required) {
        const removeCardBtn = document.createElement("button");
        removeCardBtn.className = "card-remove-btn";
        removeCardBtn.textContent = "Ã—";
        removeCardBtn.title = "Remove card";

        removeCardBtn.addEventListener("click", () => {
          console.log(`[RightPane] ðŸ—‘ Card remove button clicked for: ${config.label}`);
          this.removeCard(cardObject);
        });

        headerContainer.appendChild(removeCardBtn);
      }

      card.appendChild(headerContainer);

      // Param info
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";

      if (promptType === "dateFromTo" && config.paramNames) {
        paramInfo.textContent = `Params: ${config.paramNames.from} / ${config.paramNames.to}`;
      } else {
        paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      }
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
      if (config.required || cardObject.isRequired) {
        const requiredDiv = document.createElement("div");
        requiredDiv.className = "right-pane-card-required";
        requiredDiv.textContent = "â˜… Required";
        card.appendChild(requiredDiv);
        cardObject.requiredIndicator = requiredDiv;
      }

      // Render based on promptType
      if (promptType === "dateRange" || promptType === "dateFromTo") {
        this._renderDateRangeInput(card, cardObject);
      } else if (promptType === "date") {
        this._renderDateInput(card, cardObject);
      } else if (promptType === "searchSelect") {
        // âœ¨ NEW: Search & Select type
        this._renderSearchSelectInput(card, cardObject);
      } else {
        // Default: bubble input (value prompt or text)
        this._renderBubbleInput(card, cardObject);
      }

      this.cardsContainer.appendChild(card);
      cardObject.domElement = card;
      console.log("[RightPane] âœ… Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane] âŒ _renderCard() failed:", err);
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER DATE RANGE INPUT (used by both dateRange and dateFromTo)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._renderDateRangeInput = function (card, cardObject) {
    const container = document.createElement("div");
    container.className = "date-range-container";

    const fromField = document.createElement("div");
    fromField.className = "date-range-field";
    const fromLabel = document.createElement("label");
    fromLabel.textContent = this.locale === "de" ? "VON" : "FROM";
    fromField.appendChild(fromLabel);

    const fromInput = document.createElement("input");
    fromInput.type = "date";
    fromInput.className = "date-input";
    fromField.appendChild(fromInput);

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

    cardObject.dateFromInput = fromInput;
    cardObject.dateToInput = toInput;

    const notifyChange = () => {
      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane] âœ… Date range changed - Cognos notified`);

          if (cardObject.isRequired || cardObject.config.required) {
            this.m_oControlHost.validStateChanged();
            console.log(`[RightPane] âœ… Cognos notified of valid state change (required card)`);
          }
        } catch (err) {
          console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
        }
      }
      this._updateRequiredIndicator(cardObject);
    };

    fromInput.addEventListener("change", notifyChange);
    toInput.addEventListener("change", notifyChange);
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER SINGLE DATE INPUT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._renderDateInput = function (card, cardObject) {
    const input = document.createElement("input");
    input.type = "date";
    input.className = "date-input date-input-single";
    card.appendChild(input);

    cardObject.inputElement = input;

    input.addEventListener("change", () => {
      const dateValue = input.value;
      if (dateValue) {
        cardObject.bubbledValues = [];
        cardObject.bubbledValues.push({
          use: dateValue,
          display: dateValue,
        });

        if (this.m_oControlHost) {
          try {
            this.m_oControlHost.valueChanged();
            console.log(`[RightPane] âœ… Date selected - Cognos notified`);

            if (cardObject.isRequired || cardObject.config.required) {
              this.m_oControlHost.validStateChanged();
              console.log(`[RightPane] âœ… Cognos notified of valid state change (required card)`);
            }
          } catch (err) {
            console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
          }
        }
        this._updateRequiredIndicator(cardObject);
      }
    });
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: RENDER SEARCH & SELECT INPUT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._renderSearchSelectInput = function (card, cardObject) {
    const config = cardObject.config;
    console.log("[RightPane] ðŸ” Rendering searchSelect input for:", config.label);

    // Validate required config
    if (!config.sspBlockName) {
      console.error(`[RightPane] âŒ searchSelect type requires sspBlockName property for: ${config.label}`);
    }

    // Input wrapper
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-wrapper ss-input-wrapper";

    // Bubbles container
    const bubblesContainer = document.createElement("div");
    bubblesContainer.className = "bubbles-container";
    inputWrapper.appendChild(bubblesContainer);

    // Input field
    const input = document.createElement("input");
    input.className = "right-pane-card-input ss-search-input";
    input.type = "text";
    input.placeholder = this.locale === "de" ? "Tippen und ENTER drÃ¼cken zum Suchen..." : "Type and press ENTER to search...";

    inputWrapper.appendChild(input);

    // Click wrapper to focus input
    inputWrapper.addEventListener("click", (e) => {
      if (e.target !== input) {
        input.focus();
      }
    });

    card.appendChild(inputWrapper);

    // Store references
    cardObject.inputElement = input;
    cardObject.bubblesContainer = bubblesContainer;

    // ✨ ENTER key handler - triggers search
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const searchTerm = input.value.trim();
        if (searchTerm) {
          console.log("[RightPane] 🔍 Search triggered for: " + searchTerm);
          this._triggerSearchAndSelect(cardObject, searchTerm);
        }
      }

      // ✨ BUGFIX #3: TAB confirms selection from suggestion box OR creates free input bubble
      if (e.key === "Tab") {
        e.preventDefault();
        const suggestionBox = cardObject.suggestionBox;

        // If suggestion box is visible and has checked items, confirm those
        if (suggestionBox && suggestionBox.style.display !== "none") {
          const selectedCheckboxes = suggestionBox.querySelectorAll('input[type="checkbox"]:checked');
          if (selectedCheckboxes.length > 0) {
            console.log("[RightPane] ✅ TAB confirming " + selectedCheckboxes.length + " selections from suggestion box");
            selectedCheckboxes.forEach((cb) => {
              const useValue = cb.value;
              const displayValue = cb.dataset.display;
              this._createBubble(cardObject, displayValue, useValue);

              // ✨ BUGFIX #5: Mirror to native SS prompt
              this._mirrorToNativeSSPrompt(cardObject, useValue, displayValue);
            });
            suggestionBox.style.display = "none";
            input.value = "";

            if (this.m_oControlHost) {
              try {
                this.m_oControlHost.valueChanged();
                if (cardObject.isRequired || cardObject.config.required) {
                  this.m_oControlHost.validStateChanged();
                }
              } catch (err) {
                console.error("[RightPane] ❌ Error notifying Cognos:", err);
              }
            }
            this._updateRequiredIndicator(cardObject);
            return;
          }
        }

        // No suggestion box or no selections: treat as free input
        const freeValue = input.value.trim();
        if (freeValue) {
          console.log("[RightPane] 📝 TAB free input bubble: " + freeValue);
          const parsed = this._parseSSResultValue(freeValue, config);
          this._createBubble(cardObject, parsed.display, parsed.use);
          input.value = "";

          if (this.m_oControlHost) {
            try {
              this.m_oControlHost.valueChanged();
              if (cardObject.isRequired || cardObject.config.required) {
                this.m_oControlHost.validStateChanged();
              }
            } catch (err) {
              console.error("[RightPane] ❌ Error notifying Cognos:", err);
            }
          }
          this._updateRequiredIndicator(cardObject);
        }
      }
    });

    // âœ¨ PASTE handler for searchSelect
    inputWrapper.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      console.log(`[RightPane] ðŸ“‹ Paste detected in searchSelect:`, pastedText);

      const values = pastedText
        .split(/[\n\r\t,;]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      console.log(`[RightPane] ðŸ“‹ Parsed ${values.length} values:`, values);

      values.forEach((val) => {
        const parsed = this._parseSSResultValue(val, config);
        this._createBubble(cardObject, parsed.display, parsed.use);
      });

      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane] âœ… Paste complete - Cognos notified`);

          if (cardObject.isRequired || cardObject.config.required) {
            this.m_oControlHost.validStateChanged();
          }
        } catch (err) {
          console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
        }
      }
    });
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: GET SS PROMPT ELEMENTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._getSSPromptElements = function (sspBlockName) {
    console.log(`[RightPane] ðŸ” Looking for SS prompt block: ${sspBlockName}`);

    const block = document.querySelector(`[lid="${sspBlockName}"]`);

    if (!block) {
      console.error(`[RightPane] âŒ SS Prompt block not found: ${sspBlockName}`);
      return null;
    }

    const elements = {
      block: block,
      searchInput: block.querySelector('.clsSelectWithSearchSearchText') || block.querySelector('[id$="_searchText"]'),
      searchButton: block.querySelector('.clsSelectWithSearchSearchButton') || block.querySelector('[id$="_searchButton"]'),
      resultsList: block.querySelector('.clsListViewCheckboxView'),
      selectAllCheckbox: block.querySelector('.clsSelectWithSearchSelectAll'),
      addButton: block.querySelector('.clsPromptInsertButton'),
      selectedList: block.querySelector('.clsListViewReportView')
    };

    console.log(`[RightPane] âœ… Found SS prompt elements:`, {
      block: !!elements.block,
      searchInput: !!elements.searchInput,
      searchButton: !!elements.searchButton,
      resultsList: !!elements.resultsList
    });

    return elements;
  };
  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ NEW: TRIGGER SEARCH AND SELECT
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._triggerSearchAndSelect = function (cardObject, searchTerm) {
    const config = cardObject.config;
    console.log("[RightPane] 🔍 _triggerSearchAndSelect() for \"" + searchTerm + "\" using block: " + config.sspBlockName);

    const elements = this._getSSPromptElements(config.sspBlockName);

    if (!elements || !elements.searchInput || !elements.searchButton) {
      console.error("[RightPane] ❌ Cannot find SS prompt elements for: " + config.sspBlockName);
      // Fallback: create bubble directly from input
      const parsed = this._parseSSResultValue(searchTerm, config);
      this._createBubble(cardObject, parsed.display, parsed.use);
      cardObject.inputElement.value = "";
      
      if (this.m_oControlHost) {
        this.m_oControlHost.valueChanged();
      }
      return;
    }

    // ✨ BUGFIX #2 + #4: Show suggestion box immediately with loading spinner
    // Clear previous results and show loading state
    var suggestionBox = cardObject.suggestionBox;
    if (!suggestionBox) {
      suggestionBox = this._createSuggestionBox(cardObject);
    }
    var resultsList = suggestionBox.querySelector(".ss-results-list");
    resultsList.innerHTML = "";
    suggestionBox.querySelector(".ss-result-count").textContent =
      this.locale === "de" ? "Suche läuft..." : "Searching...";
    suggestionBox.querySelector(".ss-selected-count").textContent =
      "0 " + (this.locale === "de" ? "ausgewählt" : "selected");

    // Show loading spinner inside results area
    var loadingDiv = document.createElement("div");
    loadingDiv.className = "ss-loading";
    var spinnerSpan = document.createElement("span");
    spinnerSpan.className = "ss-spinner";
    loadingDiv.appendChild(spinnerSpan);
    loadingDiv.appendChild(document.createTextNode(
      " " + (this.locale === "de" ? "Suche läuft..." : "Searching...")
    ));
    resultsList.appendChild(loadingDiv);

    suggestionBox.style.display = "flex";
    console.log("[RightPane] ⏳ Showing loading state in suggestion box");

    // Set search value
    elements.searchInput.value = searchTerm;
    console.log("[RightPane] ✅ Set search input to: \"" + searchTerm + "\"");

    // ✨ BUGFIX #1: Remove disabled attribute before clicking search button
    if (elements.searchButton.hasAttribute("disabled")) {
      elements.searchButton.removeAttribute("disabled");
      console.log("[RightPane] ✅ Removed disabled attribute from search button");
    }
    // Also try enabling via style in case CSS disables it
    elements.searchButton.style.pointerEvents = "auto";

    // Click search button
    elements.searchButton.click();
    console.log("[RightPane] ✅ Clicked search button");

    // Wait for results using MutationObserver
    var self = this;
    var observer = new MutationObserver(function (mutations) {
      var nativeResultsList = elements.resultsList;
      if (nativeResultsList) {
        var rows = nativeResultsList.querySelectorAll("tr");
        if (rows.length > 0) {
          console.log("[RightPane] 📋 Found " + rows.length + " search results");
          observer.disconnect();
          self._extractAndDisplayResults(cardObject, elements);
        }
      }
    });

    if (elements.resultsList) {
      observer.observe(elements.resultsList, { childList: true, subtree: true });
    }

    // Timeout fallback
    setTimeout(function () {
      observer.disconnect();
      if (elements.resultsList) {
        var rows = elements.resultsList.querySelectorAll("tr");
        if (rows.length > 0) {
          console.log("[RightPane] ⏰ Timeout: Found " + rows.length + " results");
          self._extractAndDisplayResults(cardObject, elements);
        } else {
          console.log("[RightPane] ⚠️ No results found after timeout");
          // ✨ BUGFIX #4: Show "no results" state
          resultsList.innerHTML = "";
          var noResults = document.createElement("div");
          noResults.className = "ss-no-results";
          noResults.textContent = self.locale === "de"
            ? "Suche ergab keine Treffer"
            : "Search Returned No Values";
          resultsList.appendChild(noResults);
          suggestionBox.querySelector(".ss-result-count").textContent =
            "0 " + (self.locale === "de" ? "Ergebnisse gefunden" : "results found");
        }
      }
    }, 2000);
  };


  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: EXTRACT AND DISPLAY RESULTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._extractAndDisplayResults = function (cardObject, elements) {
    const config = cardObject.config;
    const results = [];

    const rows = elements.resultsList.querySelectorAll('tr');
    console.log(`[RightPane] ðŸ“‹ Extracting ${rows.length} results`);

    rows.forEach((row, idx) => {
      const label = row.querySelector('.clsListItemLabel') || row.querySelector('td');
      if (label) {
        const resultText = label.textContent.trim();
        const parsed = this._parseSSResultValue(resultText, config);
        results.push(parsed);

        if (idx < 3) {
          console.log(`[RightPane] ðŸ“‹ Row ${idx}: display="${parsed.display}", use="${parsed.use}"`);
        }
      }
    });

    console.log(`[RightPane] âœ… Extracted ${results.length} results`);
    this._displaySearchResults(cardObject, results);
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: PARSE SS RESULT VALUE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._parseSSResultValue = function (resultText, config) {
    let useValue, displayValue;

    displayValue = resultText.trim();

    if (config.useValueLength && typeof config.useValueLength === "number") {
      // Extract first N characters as USE value
      useValue = resultText.substring(0, config.useValueLength).trim();

      console.log(`[RightPane] ðŸ“ Parsed with length=${config.useValueLength}:`);
      console.log(`  Display: "${displayValue}"`);
      console.log(`  Use: "${useValue}"`);
    } else {
      // Use full string for both
      useValue = displayValue;
      console.log(`[RightPane] ðŸ“„ Using full value: "${useValue}"`);
    }

    return { use: useValue, display: displayValue };
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: CREATE SUGGESTION BOX
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._createSuggestionBox = function (cardObject) {
    console.log(`[RightPane] ðŸ”¨ Creating suggestion box`);

    const suggestionBox = document.createElement("div");
    suggestionBox.className = "ss-suggestion-box";

    // Header
    const header = document.createElement("div");
    header.className = "ss-header";

    const resultCount = document.createElement("span");
    resultCount.className = "ss-result-count";
    resultCount.textContent = "0 results found";
    header.appendChild(resultCount);

    const actions = document.createElement("div");
    actions.className = "ss-actions";

    const selectAllBtn = document.createElement("button");
    selectAllBtn.className = "ss-select-all";
    selectAllBtn.textContent = this.locale === "de" ? "Alle auswÃ¤hlen" : "Select All";
    selectAllBtn.type = "button";

    const deselectAllBtn = document.createElement("button");
    deselectAllBtn.className = "ss-deselect-all";
    deselectAllBtn.textContent = this.locale === "de" ? "Alle abwÃ¤hlen" : "Deselect All";
    deselectAllBtn.type = "button";

    actions.appendChild(selectAllBtn);
    actions.appendChild(deselectAllBtn);
    header.appendChild(actions);
    suggestionBox.appendChild(header);

    // Results list
    const resultsList = document.createElement("div");
    resultsList.className = "ss-results-list";
    suggestionBox.appendChild(resultsList);

    // Footer
    const footer = document.createElement("div");
    footer.className = "ss-footer";

    const selectedCount = document.createElement("span");
    selectedCount.className = "ss-selected-count";
    selectedCount.textContent = "0 selected";
    footer.appendChild(selectedCount);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "ss-confirm";
    confirmBtn.textContent = this.locale === "de" ? "HinzufÃ¼gen" : "Add Selected";
    confirmBtn.type = "button";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "ss-cancel";
    cancelBtn.textContent = this.locale === "de" ? "Abbrechen" : "Cancel";
    cancelBtn.type = "button";

    footer.appendChild(confirmBtn);
    footer.appendChild(cancelBtn);
    suggestionBox.appendChild(footer);

    // Event handlers
    const self = this;

    selectAllBtn.addEventListener("click", () => {
      resultsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
      });
      this._updateSelectedCount(suggestionBox);
    });

    deselectAllBtn.addEventListener("click", () => {
      resultsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
      this._updateSelectedCount(suggestionBox);
    });

    confirmBtn.addEventListener("click", () => {
      const selectedCheckboxes = resultsList.querySelectorAll('input[type="checkbox"]:checked');
      console.log("[RightPane] ✅ Confirming " + selectedCheckboxes.length + " selections");

      selectedCheckboxes.forEach((cb) => {
        const useValue = cb.value;
        const displayValue = cb.dataset.display;
        self._createBubble(cardObject, displayValue, useValue);

        // ✨ BUGFIX #5: Mirror each selection to native SS prompt
        self._mirrorToNativeSSPrompt(cardObject, useValue, displayValue);
      });

      // Clear input and hide suggestion box
      cardObject.inputElement.value = "";
      suggestionBox.style.display = "none";

      if (self.m_oControlHost) {
        try {
          self.m_oControlHost.valueChanged();
          console.log("[RightPane] ✅ Cognos notified of value change");

          if (cardObject.isRequired || cardObject.config.required) {
            self.m_oControlHost.validStateChanged();
          }
        } catch (err) {
          console.error("[RightPane] ❌ Error notifying Cognos:", err);
        }
      }
      self._updateRequiredIndicator(cardObject);
    });

    cancelBtn.addEventListener("click", () => {
      suggestionBox.style.display = "none";
    });

    // Append to card
    cardObject.domElement.appendChild(suggestionBox);
    cardObject.suggestionBox = suggestionBox;

    return suggestionBox;
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: DISPLAY SEARCH RESULTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._displaySearchResults = function (cardObject, results) {
    console.log(`[RightPane] ðŸ“‹ Displaying ${results.length} search results`);

    // Create or get existing suggestion box
    let suggestionBox = cardObject.suggestionBox;
    if (!suggestionBox) {
      suggestionBox = this._createSuggestionBox(cardObject);
    }

    // Clear previous results
    const resultsList = suggestionBox.querySelector(".ss-results-list");
    resultsList.innerHTML = "";

    // Update result count
    suggestionBox.querySelector(".ss-result-count").textContent =
      `${results.length} ${this.locale === "de" ? "Ergebnisse gefunden" : "results found"}`;

    // Populate with new results
    const self = this;
    results.forEach((result, idx) => {
      const item = document.createElement("label");
      item.className = "ss-result-item";
      item.dataset.index = idx;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = result.use;
      checkbox.dataset.display = result.display;

      const text = document.createElement("span");
      text.className = "ss-result-text";
      text.textContent = result.display;

      item.appendChild(checkbox);
      item.appendChild(text);
      resultsList.appendChild(item);

      // Checkbox change handler
      checkbox.addEventListener("change", () => {
        self._updateSelectedCount(suggestionBox);
      });

      // Shift+Click for range selection
      item.addEventListener("click", (e) => {
        if (e.shiftKey && self._lastCheckedIndex !== undefined) {
          const checkboxes = resultsList.querySelectorAll('input[type="checkbox"]');
          const start = Math.min(self._lastCheckedIndex, idx);
          const end = Math.max(self._lastCheckedIndex, idx);

          for (let i = start; i <= end; i++) {
            checkboxes[i].checked = true;
          }
          self._updateSelectedCount(suggestionBox);
        }
        self._lastCheckedIndex = idx;
      });
    });

    // Show suggestion box
    suggestionBox.style.display = "flex";

    // Reset selected count
    this._updateSelectedCount(suggestionBox);
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // âœ¨ NEW: UPDATE SELECTED COUNT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._updateSelectedCount = function (suggestionBox) {
    const selectedCount = suggestionBox.querySelectorAll('input[type="checkbox"]:checked').length;
    const countSpan = suggestionBox.querySelector(".ss-selected-count");
    countSpan.textContent = `${selectedCount} ${this.locale === "de" ? "ausgewÃ¤hlt" : "selected"}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ BUGFIX #5: MIRROR SELECTION TO NATIVE SS PROMPT
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._mirrorToNativeSSPrompt = function (cardObject, useValue, displayValue) {
    var config = cardObject.config;
    if (!config.sspBlockName) return;

    console.log("[RightPane] 🔄 Mirroring to native SS prompt: use=" + useValue + ", display=" + displayValue);

    var elements = this._getSSPromptElements(config.sspBlockName);
    if (!elements) {
      console.warn("[RightPane] ⚠️ Cannot mirror - SS prompt elements not found");
      return;
    }

    // Try to find and check the matching row in the native results list
    if (elements.resultsList) {
      var rows = elements.resultsList.querySelectorAll("tr");
      rows.forEach(function (row) {
        var label = row.querySelector(".clsListItemLabel") || row.querySelector("td");
        if (label) {
          var rowText = label.textContent.trim();
          // Match by display value or use value
          if (rowText === displayValue || rowText.indexOf(useValue) === 0) {
            // Click the row to select it in the native prompt
            var checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
              checkbox.click();
              console.log("[RightPane] ✅ Checked native row: " + rowText);
            } else if (!checkbox) {
              // Some SS prompts use row click instead of checkbox
              row.click();
              console.log("[RightPane] ✅ Clicked native row: " + rowText);
            }
          }
        }
      });
    }

    // Click the native Add button to move selections to the "chosen" side
    if (elements.addButton) {
      // Small delay to let the native UI register the checkbox change
      setTimeout(function () {
        if (elements.addButton.hasAttribute("disabled")) {
          elements.addButton.removeAttribute("disabled");
        }
        elements.addButton.click();
        console.log("[RightPane] ✅ Clicked native Add button");
      }, 100);
    } else {
      console.warn("[RightPane] ⚠️ Native Add button not found");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ BUGFIX #6: REMOVE FROM NATIVE SS PROMPT
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._removeFromNativeSSPrompt = function (cardObject, displayValue, useValue) {
    var config = cardObject.config;
    if (!config.sspBlockName || config.promptType !== "searchSelect") return;

    console.log("[RightPane] 🔄 Removing from native SS prompt: " + displayValue);

    var elements = this._getSSPromptElements(config.sspBlockName);
    if (!elements) {
      console.warn("[RightPane] ⚠️ Cannot remove from native - SS prompt elements not found");
      return;
    }

    // Find the value in the native "selected/chosen" list and click its remove
    if (elements.selectedList) {
      var selectedRows = elements.selectedList.querySelectorAll("tr");
      selectedRows.forEach(function (row) {
        var label = row.querySelector(".clsListItemLabel") || row.querySelector("td");
        if (label) {
          var rowText = label.textContent.trim();
          if (rowText === displayValue || rowText.indexOf(useValue) === 0) {
            // Click to select this row in the chosen list
            row.click();
            console.log("[RightPane] ✅ Selected native chosen row: " + rowText);
          }
        }
      });

      // Click the native Remove button
      var removeButton = elements.block.querySelector(".clsPromptRemoveButton");
      if (removeButton) {
        setTimeout(function () {
          if (removeButton.hasAttribute("disabled")) {
            removeButton.removeAttribute("disabled");
          }
          removeButton.click();
          console.log("[RightPane] ✅ Clicked native Remove button");
        }, 100);
      }
    }
  };



  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER BUBBLE INPUT (Regular/Text)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._renderBubbleInput = function (card, cardObject) {
    const config = cardObject.config;
    const queryName = config.queryName;
    const promptType = config.promptType || "";
    let datalistId = null;

    // Create datalist only if NOT text type and has queryName
    if (promptType !== "text" && queryName && this.dataStores && this.dataStores[queryName]) {
      console.log(`[RightPane] âœ… Found DataStore for ${queryName}`);

      const dataStore = this.dataStores[queryName];
      let useCol = config.useColumn !== undefined ? config.useColumn : 0;
      let displayCol = config.displayColumn !== undefined ? config.displayColumn : 1;

      console.log(`[RightPane] ðŸ“‹ Config requested useColumn: ${useCol}, displayColumn: ${displayCol}`);
      console.log(`[RightPane] ðŸ“‹ DataStore "${queryName}" has ${dataStore.columnCount} column(s)`);

      if (useCol >= dataStore.columnCount) {
        console.warn(`[RightPane] âš ï¸ useColumn ${useCol} out of bounds`);
        useCol = 0;
      }

      if (displayCol >= dataStore.columnCount) {
        console.warn(`[RightPane] âš ï¸ displayColumn ${displayCol} out of bounds`);
        displayCol = useCol;
      }

      console.log(`[RightPane] âœ… Final validated columns - useColumn: ${useCol}, displayColumn: ${displayCol}`);

      cardObject.validatedUseCol = useCol;
      cardObject.validatedDisplayCol = displayCol;

      datalistId = `datalist-${queryName}-${Date.now()}`;
      const datalist = document.createElement("datalist");
      datalist.id = datalistId;

      console.log(`[RightPane] ðŸ“‹ Populating datalist with ${dataStore.rowCount} values`);
      for (let i = 0; i < dataStore.rowCount; i++) {
        const displayValue = dataStore.getCellValue(i, displayCol);
        const useValue = dataStore.getCellValue(i, useCol);

        const option = document.createElement("option");
        option.value = displayValue;
        option.setAttribute("data-use-value", useValue);
        datalist.appendChild(option);

        if (i < 3) {
          console.log(`[RightPane] ðŸ“‹ Row ${i}: display="${displayValue}", use="${useValue}"`);
        }
      }

      card.appendChild(datalist);
      console.log(`[RightPane] âœ… Created datalist with ID: ${datalistId}`);
    } else if (promptType === "text") {
      console.log(`[RightPane] ðŸ“ Text-only input - no datalist`);
    } else {
      console.log(`[RightPane] âš ï¸ No DataStore found for queryName: ${queryName}`);
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
    input.placeholder = promptType === "text" ? "Type value and press Enter..." : "Type or select value...";

    if (datalistId) {
      input.setAttribute("list", datalistId);
      console.log(`[RightPane] ðŸ”— Input linked to datalist: ${datalistId}`);
    }

    inputWrapper.appendChild(input);

    // Click wrapper to focus input
    inputWrapper.addEventListener("click", (e) => {
      if (e.target !== input) {
        input.focus();
        input.click();
      }
    });

    // âœ¨ PASTE HANDLER
    inputWrapper.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      console.log(`[RightPane] ðŸ“‹ Paste detected:`, pastedText);

      const values = pastedText
        .split(/[\n\r\t,;]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      console.log(`[RightPane] ðŸ“‹ Parsed ${values.length} values:`, values);

      values.forEach((val) => {
        let useValue = val;
        let displayValue = val;

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
          console.log(`[RightPane] âœ… Paste complete - Cognos notified`);

          if (cardObject.isRequired || cardObject.config.required) {
            this.m_oControlHost.validStateChanged();
            console.log(`[RightPane] âœ… Cognos notified of valid state change (required card)`);
          }
        } catch (err) {
          console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
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

          if (datalistId && config.queryName && this.dataStores[config.queryName]) {
            const dataStore = this.dataStores[config.queryName];
            const useCol = cardObject.validatedUseCol;
            const displayCol = cardObject.validatedDisplayCol;

            for (let i = 0; i < dataStore.rowCount; i++) {
              const dsDisplay = dataStore.getCellValue(i, displayCol);
              if (dsDisplay === displayValue) {
                useValue = dataStore.getCellValue(i, useCol);
                console.log(`[RightPane] ðŸ” Mapped "${displayValue}" â†’ use="${useValue}"`);
                break;
              }
            }
          }

          console.log(`[RightPane] ðŸŽ¯ Creating bubble: display="${displayValue}", use="${useValue}"`);
          this._createBubble(cardObject, displayValue, useValue);
          input.value = "";

          if (this.m_oControlHost) {
            try {
              this.m_oControlHost.valueChanged();
              console.log(`[RightPane] âœ… Cognos notified of value change`);

              if (cardObject.isRequired || cardObject.config.required) {
                this.m_oControlHost.validStateChanged();
                console.log(`[RightPane] âœ… Cognos notified of valid state change (required card)`);
              }
            } catch (err) {
              console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
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
              console.log(`[RightPane] ðŸ” Mapped "${displayValue}" â†’ use="${useValue}"`);
              break;
            }
          }
        }

        console.log(`[RightPane] ðŸŽ¯ Datalist selection confirmed: display="${displayValue}", use="${useValue}"`);
        this._createBubble(cardObject, displayValue, useValue);
        input.value = "";

        if (this.m_oControlHost) {
          try {
            this.m_oControlHost.valueChanged();
            console.log(`[RightPane] âœ… Cognos notified of value change`);

            if (cardObject.isRequired || cardObject.config.required) {
              this.m_oControlHost.validStateChanged();
              console.log(`[RightPane] âœ… Cognos notified of valid state change (required card)`);
            }
          } catch (err) {
            console.error(`[RightPane] âŒ Error notifying Cognos:`, err);
          }
        }
      }
    });
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CREATE BUBBLE (with maxValues enforcement)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._createBubble = function (cardObject, displayValue, useValue) {
    console.log(`[RightPane] ðŸ«§ Creating bubble: display="${displayValue}", use="${useValue}"`);

    // Check maxValues
    const maxValues = cardObject.config.maxValues;
    if (maxValues && cardObject.bubbledValues.length >= maxValues) {
      console.warn(`[RightPane] âš ï¸ maxValues limit reached (${maxValues}) - clearing existing values`);
      cardObject.bubbledValues = [];
      if (cardObject.bubblesContainer) {
        cardObject.bubblesContainer.innerHTML = "";
      }
    }

    // Check for duplicate
    if (cardObject.bubbledValues.some((v) => v.display === displayValue)) {
      console.warn(`[RightPane] âš ï¸ Value "${displayValue}" already exists as bubble`);
      return;
    }

    // Store value
    cardObject.bubbledValues.push({
      display: displayValue,
      use: useValue || displayValue,
    });
    console.log(`[RightPane] ðŸ’¾ Added to bubbledValues:`, cardObject.bubbledValues);

    // Create bubble DOM
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.title = displayValue;

    const valueSpan = document.createElement("span");
    valueSpan.textContent = displayValue;
    bubble.appendChild(valueSpan);

    const removeBtn = document.createElement("button");
    removeBtn.className = "bubble-remove";
    removeBtn.textContent = "Ã—";

    removeBtn.addEventListener("click", () => {
      console.log(`[RightPane] ðŸ—‘ Remove button clicked for: "${displayValue}"`);
      this._removeBubble(cardObject, displayValue, bubble);
    });

    bubble.appendChild(removeBtn);
    cardObject.bubblesContainer.appendChild(bubble);
    console.log(`[RightPane] âœ… Bubble added to DOM`);

    this._updateRequiredIndicator(cardObject);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REMOVE BUBBLE
  // ═══════════════════════════════════════════════════════════════════════════
  RightPane.prototype._removeBubble = function (cardObject, displayValue, bubbleElement) {
    console.log("[RightPane] 🗑 Removing bubble: \"" + displayValue + "\"");
    console.log("[RightPane] 🔍 Before removal, bubbledValues:", cardObject.bubbledValues);

    var removedEntry = null;
    var index = cardObject.bubbledValues.findIndex(function (v) { return v.display === displayValue; });
    if (index > -1) {
      removedEntry = cardObject.bubbledValues[index];
      cardObject.bubbledValues.splice(index, 1);
      console.log("[RightPane] 💾 Removed from bubbledValues at index " + index);
      console.log("[RightPane] 💾 After removal, bubbledValues:", cardObject.bubbledValues);
    } else {
      console.warn("[RightPane] ⚠️ Value \"" + displayValue + "\" not found in bubbledValues!");
    }

    if (bubbleElement && bubbleElement.parentNode) {
      bubbleElement.parentNode.removeChild(bubbleElement);
      console.log("[RightPane] ✅ Bubble removed from DOM");
    }

    // ✨ BUGFIX #6: Sync removal with native SS prompt
    if (removedEntry && cardObject.config.promptType === "searchSelect") {
      this._removeFromNativeSSPrompt(cardObject, removedEntry.display, removedEntry.use);
    }

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log("[RightPane] ✅ Cognos notified of value removal");

        if (cardObject.isRequired || cardObject.config.required) {
          this.m_oControlHost.validStateChanged();
          console.log("[RightPane] ✅ Cognos notified of valid state change (required card)");
        }
      } catch (err) {
        console.error("[RightPane] ❌ Error notifying Cognos:", err);
      }
    }
    this._updateRequiredIndicator(cardObject);
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // UPDATE REQUIRED INDICATOR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype._updateRequiredIndicator = function (cardObject) {
    if (!cardObject.requiredIndicator) return;

    const config = cardObject.config;
    let hasFilled = false;

    if (config.promptType === "dateRange" || config.promptType === "dateFromTo") {
      hasFilled =
        cardObject.dateFromInput &&
        cardObject.dateFromInput.value &&
        cardObject.dateToInput &&
        cardObject.dateToInput.value;
    } else if (config.promptType === "date") {
      hasFilled = cardObject.inputElement && cardObject.inputElement.value;
    } else {
      hasFilled = cardObject.bubbledValues && cardObject.bubbledValues.length > 0;
    }

    if (hasFilled) {
      cardObject.requiredIndicator.textContent = "âœ“ Required";
      cardObject.requiredIndicator.classList.add("filled");
    } else {
      cardObject.requiredIndicator.textContent = "â˜… Required";
      cardObject.requiredIndicator.classList.remove("filled");
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CHECK IF ALL REQUIRED CARDS ARE FILLED
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.areRequiredCardsFilled = function () {
    console.log("[RightPane] ðŸ” Checking if all required cards are filled");

    const requiredCards = this.cards.filter((card) => card.isRequired || card.config.required);
    console.log(`[RightPane] ðŸ“‹ Found ${requiredCards.length} required cards`);

    if (requiredCards.length === 0) {
      console.log("[RightPane] âœ… No required cards - validation passes");
      return true;
    }

    for (const card of requiredCards) {
      const config = card.config;
      const promptType = config.promptType || "";
      let isFilled = false;

      if (promptType === "dateRange" || promptType === "dateFromTo") {
        isFilled = card.dateFromInput && card.dateFromInput.value && card.dateToInput && card.dateToInput.value;
        console.log(`[RightPane] ðŸ“… Date card "${config.label}": filled=${isFilled}`);
      } else if (promptType === "date") {
        isFilled = card.inputElement && card.inputElement.value;
        console.log(`[RightPane] ðŸ“… Single date card "${config.label}": filled=${isFilled}`);
      } else {
        isFilled = card.bubbledValues && card.bubbledValues.length > 0;
        console.log(
          `[RightPane] ðŸ«§ Bubble card "${config.label}": filled=${isFilled} (${card.bubbledValues.length} values)`,
        );
      }

      if (!isFilled) {
        console.log(`[RightPane] âŒ Required card "${config.label}" is NOT filled`);
        return false;
      }
    }

    console.log("[RightPane] âœ… All required cards are filled");
    return true;
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GET PARAMETERS (Called by Cognos)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane] ðŸ“‹ getParameters() called");
    console.log("[RightPane] ðŸ“Š Total cards to check:", this.cards.length);

    try {
      const allParams = [];

      this.cards.forEach((cardObject, idx) => {
        console.log(`[RightPane] ðŸ” Checking card ${idx}:`, cardObject.config.label);
        console.log(`[RightPane] ðŸ” Card ${idx} bubbledValues:`, cardObject.bubbledValues);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane] âœ… Card ${idx} returned parameters:`, JSON.stringify(cardParams, null, 2));
        } else {
          console.log(`[RightPane] âš ï¸ Card ${idx} has no parameters`);
        }
      });

      console.log("[RightPane] ðŸ“¤ Final collected parameters:", JSON.stringify(allParams, null, 2));
      console.log("[RightPane] ðŸ“Š Total parameters collected:", allParams.length);

      return allParams;
    } catch (err) {
      console.error("[RightPane] âŒ getParameters() failed:", err);
      return [];
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // DESTROY
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  RightPane.prototype.destroy = function () {
    console.log("[RightPane] ðŸ§¨ destroy() called");

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

      console.log("[RightPane] âœ… destroy() complete â€” cleanup successful");
    } catch (err) {
      console.error("[RightPane] âŒ destroy() failed:", err);
    }
  };

  return RightPane;
});
