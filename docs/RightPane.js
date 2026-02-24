define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane]  Constructor called");
    this.domNode = null;
    this.cardsContainer = null;
    this.autocompleteData = {};
    this.m_oControlHost = null;
    this.cards = [];
    this.dataStores = {};
    this.locale = "en";
  }

  // ===========================================================================
  // HELPER: Get Localized Text
  // ===========================================================================
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

  // ===========================================================================
  // INITIALIZE
  // ===========================================================================
  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane]  initialize() called");

    this.m_oControlHost = oControlHost;
    console.log("[RightPane]  Stored oControlHost");

    if (oControlHost.locale) {
      this.locale = oControlHost.locale.substring(0, 2);
      console.log("[RightPane]  Detected locale:", this.locale);
    }

    if (typeof fnDoneInitializing === "function") {
      console.log("[RightPane]  Calling fnDoneInitializing callback");
      fnDoneInitializing();
    }
  };

  // ===========================================================================
  // DRAW
  // ===========================================================================
  RightPane.prototype.draw = function (oControlHost) {
    console.log("[RightPane]  draw() called");

    const container = document.createElement("div");
    container.id = "right-pane";

    const cardsContainer = document.createElement("div");
    cardsContainer.id = "right-pane-cards-container";
    container.appendChild(cardsContainer);

    this.cardsContainer = cardsContainer;
    this.domNode = container;

    console.log("[RightPane]  DOM structure created");
    return container;
  };

  // ===========================================================================
  // SET DATASTORES
  // ===========================================================================
  RightPane.prototype.setDataStores = function (dataStores) {
    console.log("[RightPane]  setDataStores() called with", dataStores ? Object.keys(dataStores).length : 0, "stores");

    this.dataStores = dataStores || {};

    Object.keys(this.dataStores).forEach((key) => {
      const store = this.dataStores[key];
      console.log(`[RightPane]  DataStore "${key}":`, store.rowCount, "rows");
    });
  };

  // ===========================================================================
  // GET CARD BY PARAMETER
  // ===========================================================================
  RightPane.prototype.getCardByParameter = function (paramName) {
    return this.cards.find((card) => {
      if (card.config.paramName === paramName) {
        return true;
      }
      if (card.config.paramNames) {
        return card.config.paramNames.from === paramName || card.config.paramNames.to === paramName;
      }
      return false;
    });
  };
  // ===========================================================================
  // HAS CARD - Check if card exists for paramName
  // ===========================================================================
  RightPane.prototype.hasCard = function (paramName) {
    const card = this.getCardByParameter(paramName);
    const exists = card !== undefined;
    console.log(`[RightPane]  hasCard(${paramName}):`, exists);
    return exists;
  };

  // ===========================================================================
  // ADD CARD
  // ===========================================================================
  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane]  addCard() called!");
    console.log("[RightPane]  Received cardData:", JSON.stringify(cardData, null, 2));

    try {
      if (!cardData.fullConfig) {
        console.error("[RightPane]  cardData.fullConfig is missing! Cannot create card.");
        console.log("[RightPane]  Aborting card creation");
        return;
      }

      console.log("[RightPane]  fullConfig found:", JSON.stringify(cardData.fullConfig, null, 2));

      const cardObject = this._createCardObject(cardData);
      console.log("[RightPane]  Card object created:", cardObject);

      this.cards.push(cardObject);
      console.log("[RightPane]  Card object stored in cards array");
      console.log("[RightPane]  Total cards now:", this.cards.length);

      if (this.cardsContainer) {
        this._renderCard(cardObject);
        console.log("[RightPane]  Card rendered to DOM");
      } else {
        console.warn("[RightPane]  cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane]  addCard() failed:", err);
    }
  };

  // ===========================================================================
  // CREATE CARD OBJECT
  // ===========================================================================
  RightPane.prototype._createCardObject = function (cardData) {
    console.log("[RightPane]  _createCardObject() called");

    const config = cardData.fullConfig;
    console.log("[RightPane]  Extracting config:", JSON.stringify(config, null, 2));

    const cardObject = {
      config: config,
      bubbledValues: [],
      inputElement: null,
      bubblesContainer: null,
      cardElement: null,
      dateFromInput: null,
      dateToInput: null,
      isRequired: config.required || false,
      requiredIndicator: null,

      getParameters: function () {
        console.log("[RightPane]  Card getParameters() called for:", this.config.label);
        console.log("[RightPane]  promptType:", this.config.promptType);

        const promptType = this.config.promptType || "";

        // ===========================================================================
        // TYPE: dateRange - Single parameter with range format for in_range()
        // ===========================================================================
        if (promptType === "dateRange") {
          console.log("[RightPane]  Processing dateRange type");

          if (!this.config.paramName) {
            console.error("[RightPane]  paramName missing for dateRange!");
            return [];
          }

          const fromValue = this.dateFromInput ? this.dateFromInput.value : "";
          const toValue = this.dateToInput ? this.dateToInput.value : "";

          if (!fromValue || !toValue) {
            console.log("[RightPane]  Date range incomplete - returning empty");
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

          console.log("[RightPane]  DateRange returning RangeParameter:", JSON.stringify(result, null, 2));
          return result;
        }

        // ===========================================================================
        // TYPE: dateFromTo - Two separate parameters for BETWEEN ? AND ?
        // ===========================================================================
        if (promptType === "dateFromTo") {
          console.log("[RightPane]  Processing dateFromTo type");

          if (!this.config.paramNames || !this.config.paramNames.from || !this.config.paramNames.to) {
            console.error("[RightPane]  paramNames.from/to missing for dateFromTo!");
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

          console.log("[RightPane]  DateFromTo returning two parameters:", JSON.stringify(result, null, 2));
          return result;
        }

        // ===========================================================================
        // TYPE: date - Single date value
        // ===========================================================================
        if (promptType === "date") {
          console.log("[RightPane]  Processing date type");

          if (!this.config.paramName) {
            console.error("[RightPane]  paramName missing for date!");
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

          console.log("[RightPane]  Date returning:", JSON.stringify(result, null, 2));
          return result;
        }

        // ===========================================================================
        // DEFAULT: Regular value prompt (bubble-based) - includes searchSelect
        // ===========================================================================
        if (!this.config.paramName) {
          console.error("[RightPane]  paramName missing in config!");
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

        console.log("[RightPane]  Returning:", JSON.stringify(result, null, 2));
        return result;
      },
    };

    console.log("[RightPane]  Card object structure created");
    return cardObject;
  };

  // ===========================================================================
  // REMOVE CARD
  // ===========================================================================
  RightPane.prototype.removeCard = function (cardObject) {
    console.log(`[RightPane]  removeCard() called for:`, cardObject.config.label);

    if (cardObject.isRequired) {
      console.warn(`[RightPane]  Cannot remove required card: ${cardObject.config.label}`);
      return;
    }

    console.log(`[RightPane]  Clearing bubbledValues before removal`);
    cardObject.bubbledValues = [];

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane]  Cognos notified of parameter clearing`);
      } catch (err) {
        console.error(`[RightPane]  Error notifying Cognos:`, err);
      }
    }

    const index = this.cards.indexOf(cardObject);
    if (index > -1) {
      this.cards.splice(index, 1);
      console.log(`[RightPane]  Card removed from cards array. Remaining: ${this.cards.length}`);
    }

    if (cardObject.cardElement && cardObject.cardElement.parentNode) {
      cardObject.cardElement.parentNode.removeChild(cardObject.cardElement);
      console.log(`[RightPane]  Card removed from DOM`);
    }
  };

  // ===========================================================================
  // RENDER CARD
  // ===========================================================================
  RightPane.prototype._renderCard = function (cardObject) {
    const config = cardObject.config;
    console.log(`[RightPane]  Rendering card for: ${config.label}`);

    const card = document.createElement("div");
    card.className = "right-pane-card";

    const headerContainer = document.createElement("div");
    headerContainer.className = "right-pane-card-header-container";

    const header = document.createElement("div");
    header.className = "right-pane-card-header";

    const title = document.createElement("div");
    title.className = "right-pane-card-title";

    const titleLabel = this.getLocalizedText(config, "label");
    title.textContent = titleLabel;

    const tooltip = this.getLocalizedText(config, "tooltip");
    if (tooltip) {
      title.title = tooltip;
    }

    header.appendChild(title);

    if (!cardObject.isRequired) {
      const removeCardBtn = document.createElement("button");
      removeCardBtn.className = "card-remove-btn";
      removeCardBtn.textContent = "×";
      removeCardBtn.title = "Remove card";

      removeCardBtn.addEventListener("click", () => {
        console.log(`[RightPane]  Remove card button clicked for: ${config.label}`);
        this.removeCard(cardObject);
      });

      headerContainer.appendChild(removeCardBtn);
    }

    headerContainer.appendChild(header);
    card.appendChild(headerContainer);

    const promptType = config.promptType || "";

    if (promptType === "dateFromTo" && config.paramNames) {
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";
      paramInfo.textContent = `Params: ${config.paramNames.from} / ${config.paramNames.to}`;
      card.appendChild(paramInfo);
    } else {
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";
      paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      card.appendChild(paramInfo);
    }

    const helpText = this.getLocalizedText(config, "helpText");
    if (helpText) {
      const helpDiv = document.createElement("div");
      helpDiv.className = "right-pane-card-help";
      helpDiv.textContent = helpText;
      card.appendChild(helpDiv);
    }

    if (config.required || cardObject.isRequired) {
      const requiredDiv = document.createElement("div");
      requiredDiv.className = "right-pane-card-required";
      requiredDiv.textContent = "☆ Required";
      card.appendChild(requiredDiv);
      cardObject.requiredIndicator = requiredDiv;
    }

    // Render based on promptType
    if (promptType === "dateRange" || promptType === "dateFromTo") {
      this._renderDateRangeInput(card, cardObject);
    } else if (promptType === "date") {
      this._renderDateInput(card, cardObject);
    } else if (promptType === "searchSelect") {
      this._renderSearchSelectInput(card, cardObject);
    } else {
      this._renderBubbleInput(card, cardObject);
    }

    return card;
  };

  // ===========================================================================
  // RENDER DATE RANGE INPUT (dateRange / dateFromTo)
  // ===========================================================================
  RightPane.prototype._renderDateRangeInput = function (card, cardObject) {
    const config = cardObject.config;
    console.log("[RightPane]  Rendering date range inputs");

    const dateRangeContainer = document.createElement("div");
    dateRangeContainer.className = "date-range-container";

    const fromWrapper = document.createElement("div");
    fromWrapper.className = "date-input-wrapper";

    const fromLabel = document.createElement("label");
    fromLabel.textContent = this.locale === "de" ? "Von:" : "From:";
    fromLabel.className = "date-label";

    const fromInput = document.createElement("input");
    fromInput.type = "date";
    fromInput.className = "date-input";

    fromWrapper.appendChild(fromLabel);
    fromWrapper.appendChild(fromInput);

    const toWrapper = document.createElement("div");
    toWrapper.className = "date-input-wrapper";

    const toLabel = document.createElement("label");
    toLabel.textContent = this.locale === "de" ? "Bis:" : "To:";
    toLabel.className = "date-label";

    const toInput = document.createElement("input");
    toInput.type = "date";
    toInput.className = "date-input";

    toWrapper.appendChild(toLabel);
    toWrapper.appendChild(toInput);

    dateRangeContainer.appendChild(fromWrapper);
    dateRangeContainer.appendChild(toWrapper);

    card.appendChild(dateRangeContainer);

    cardObject.dateFromInput = fromInput;
    cardObject.dateToInput = toInput;

    const self = this;

    const onDateChange = () => {
      if (self.m_oControlHost) {
        try {
          self.m_oControlHost.valueChanged();
          console.log(`[RightPane]  Cognos notified of date change`);

          if (cardObject.isRequired || cardObject.config.required) {
            self.m_oControlHost.validStateChanged();
            console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
          }
        } catch (err) {
          console.error(`[RightPane]  Error notifying Cognos:`, err);
        }
      }

      self._updateRequiredIndicator(cardObject);
    };

    fromInput.addEventListener("change", onDateChange);
    toInput.addEventListener("change", onDateChange);
  };

  // ===========================================================================
  // RENDER DATE INPUT (single date)
  // ===========================================================================
  RightPane.prototype._renderDateInput = function (card, cardObject) {
    console.log("[RightPane]  Rendering single date input");

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-wrapper";

    const bubblesContainer = document.createElement("div");
    bubblesContainer.className = "bubbles-container";
    inputWrapper.appendChild(bubblesContainer);

    const input = document.createElement("input");
    input.type = "date";
    input.className = "right-pane-card-input date-input-inline";

    inputWrapper.appendChild(input);

    card.appendChild(inputWrapper);

    cardObject.inputElement = input;
    cardObject.bubblesContainer = bubblesContainer;

    const self = this;

    input.addEventListener("change", () => {
      const dateValue = input.value;
      if (dateValue) {
        console.log(`[RightPane]  Date selected: ${dateValue}`);
        self._createBubble(cardObject, dateValue, dateValue);
        input.value = "";

        if (self.m_oControlHost) {
          try {
            self.m_oControlHost.valueChanged();
            console.log(`[RightPane]  Cognos notified of value change`);

            if (cardObject.isRequired || cardObject.config.required) {
              self.m_oControlHost.validStateChanged();
              console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
            }
          } catch (err) {
            console.error(`[RightPane]  Error notifying Cognos:`, err);
          }
        }
      }
    });
  };

  // ===========================================================================
  // RENDER SEARCH & SELECT INPUT
  // ===========================================================================
  RightPane.prototype._renderSearchSelectInput = function (card, cardObject) {
    const config = cardObject.config;
    const self = this;
    console.log("[RightPane]  Rendering searchSelect input for:", config.label);

    // Validate required config
    if (!config.sspBlockName) {
      console.error(`[RightPane]  searchSelect type requires sspBlockName property for: ${config.label}`);
    }

    // =========================================================================
    // VALIDATE PARSE CONFIG AND SHOW WARNING IF CONFLICT DETECTED
    // =========================================================================
    const validation = this._validateSSParseConfig(config);
    if (validation.warning) {
      console.warn(`[RightPane]  Config warning for ${config.label}:`, validation.message);

      const warningDiv = document.createElement("div");
      warningDiv.className = "config-warning";
      warningDiv.innerHTML = `
        <strong>⚠ Configuration Warning:</strong><br>
        ${validation.message}
      `;
      card.appendChild(warningDiv);
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
    input.placeholder =
      this.locale === "de" ? "Tippen und ENTER drcken zum Suchen..." : "Type and press ENTER to search...";

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

    // Click handler - re-show suggestion box if it exists with results
    input.addEventListener("click", () => {
      const suggestionBox = cardObject.suggestionBox;
      if (suggestionBox) {
        const resultsList = suggestionBox.querySelector(".ss-results-list");
        const hasResults = resultsList && resultsList.children.length > 0;
        if (hasResults) {
          console.log(`[RightPane]  Input clicked - re-showing suggestion box with existing results`);
          suggestionBox.style.display = "flex";
        }
      }
    });

    //  ENTER key handler - triggers search
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const searchTerm = input.value.trim();
        if (searchTerm) {
          console.log(`[RightPane]  Search triggered for: "${searchTerm}"`);
          this._triggerSearchAndSelect(cardObject, searchTerm);
        }
      }
      if (e.key === "Tab") {
        const suggestionBox = cardObject.suggestionBox;
        if (suggestionBox && suggestionBox.style.display !== "none") {
          // Suggestion box is visible
          const checkedBoxes = suggestionBox.querySelectorAll('input[type="checkbox"]:checked');
          if (checkedBoxes.length > 0) {
            // Has checked items - they're already bubbled in real-time, just close
            e.preventDefault();
            console.log(
              `[RightPane] Tab pressed - closing suggestion box (${checkedBoxes.length} items already bubbled)`,
            );
            input.value = "";
            suggestionBox.style.display = "none";
          } else {
            // No checked items - create free input bubble if there's text
            const inputValue = input.value.trim();
            if (inputValue) {
              e.preventDefault();
              console.log(`[RightPane] Tab pressed with text but no selections - creating free bubble`);
              const parsed = self._parseSSResultValue(inputValue, config);
              self._createBubble(cardObject, parsed.display, parsed.use);
              input.value = "";
              suggestionBox.style.display = "none";

              if (self.m_oControlHost) {
                try {
                  self.m_oControlHost.valueChanged();
                  if (cardObject.isRequired || cardObject.config.required) {
                    self.m_oControlHost.validStateChanged();
                  }
                } catch (err) {
                  console.error(`[RightPane] Error notifying Cognos:`, err);
                }
              }
            }
          }
        } else {
          // No suggestion box visible - create free bubble from input text
          const inputValue = input.value.trim();
          if (inputValue) {
            e.preventDefault();
            console.log(`[RightPane] Tab pressed - creating free bubble from input`);
            const parsed = self._parseSSResultValue(inputValue, config);
            self._createBubble(cardObject, parsed.display, parsed.use);
            input.value = "";

            if (self.m_oControlHost) {
              try {
                self.m_oControlHost.valueChanged();
                if (cardObject.isRequired || cardObject.config.required) {
                  self.m_oControlHost.validStateChanged();
                }
              } catch (err) {
                console.error(`[RightPane] Error notifying Cognos:`, err);
              }
            }
          }
        }
      }
    });
  };

  // ===========================================================================
  // TRIGGER SEARCH AND SELECT
  // ===========================================================================
  RightPane.prototype._triggerSearchAndSelect = function (cardObject, searchTerm) {
    const config = cardObject.config;
    console.log(`[RightPane]  Triggering Search & Select for: "${searchTerm}"`);

    if (!config.sspBlockName) {
      console.error(`[RightPane]  No sspBlockName configured for Search & Select`);
      return;
    }

    // Get native prompt elements
    const elements = this._getSSPromptElements(config.sspBlockName);
    if (!elements || !elements.input || !elements.searchButton) {
      console.error(`[RightPane]  Cannot find native SS prompt elements for: ${config.sspBlockName}`);
      return;
    }

    console.log(`[RightPane]  Found native SS prompt elements for: ${config.sspBlockName}`);

    // Set the search term and trigger search
    elements.input.value = searchTerm;
    elements.searchButton.click();
    console.log(`[RightPane]  Clicked native search button`);

    // Free-text fallback: if user types custom value
    const parsed = this._parseSSResultValue(searchTerm, config);
    console.log(`[RightPane]  Parsed search term - use: "${parsed.use}", display: "${parsed.display}"`);

    // Monitor for search completion using progress.gif spinner
    this._monitorSearchCompletion(cardObject, searchTerm);
  };

  // ===========================================================================
  // GET SS PROMPT ELEMENTS
  // ===========================================================================
  RightPane.prototype._getSSPromptElements = function (blockName) {
    console.log(`[RightPane]  Getting SS prompt elements for block: ${blockName}`);

    const block = document.getElementById(blockName);
    if (!block) {
      console.error(`[RightPane]  Block not found: ${blockName}`);
      return null;
    }

    const input = block.querySelector('input[type="text"]');
    const searchButton = block.querySelector('img[alt="Search"]')?.parentElement;
    const resultsList = block.querySelector('select[id*="results"] table tbody, table.clsViewTable tbody');
    const selectedList = block.querySelector('select[id*="selections"] table tbody, select[id*="choices"] table tbody');
    const addButton =
      block.querySelector('img[alt="Add"]')?.parentElement || block.querySelector('button[id*="AddButton"]');
    const removeButton =
      block.querySelector('img[alt="Remove"]')?.parentElement || block.querySelector('button[id*="RemoveButton"]');

    console.log(`[RightPane]  Found elements - input: ${!!input}, searchButton: ${!!searchButton}`);
    console.log(`[RightPane]  Found lists - results: ${!!resultsList}, selected: ${!!selectedList}`);

    return {
      block: block,
      input: input,
      searchButton: searchButton,
      resultsList: resultsList,
      selectedList: selectedList,
      addButton: addButton,
      removeButton: removeButton,
    };
  };

  // ===========================================================================
  // MONITOR SEARCH COMPLETION (Progress.gif spinner tracking)
  // ===========================================================================
  RightPane.prototype._monitorSearchCompletion = function (cardObject, searchTerm) {
    const config = cardObject.config;
    const elements = this._getSSPromptElements(config.sspBlockName);

    if (!elements || !elements.block) {
      console.error(`[RightPane]  Cannot monitor search - block not found`);
      return;
    }

    const self = this;
    let spinnerAppeared = false;
    let checkCount = 0;
    const maxChecks = 600; // 30 seconds (50ms * 600)

    console.log(`[RightPane]  Starting progress.gif spinner monitoring`);

    const checkSpinner = setInterval(() => {
      checkCount++;

      // Look for progress.gif spinner
      const spinner = elements.block.querySelector('img[src*="progress.gif"]');

      if (spinner && !spinnerAppeared) {
        spinnerAppeared = true;
        console.log(`[RightPane]  Spinner appeared - loading...`);
      } else if (spinnerAppeared && !spinner) {
        clearInterval(checkSpinner);
        console.log(`[RightPane]  Spinner gone - extracting`);

        // Re-fetch elements in case Cognos recreated DOM
        const freshElements = self._getSSPromptElements(config.sspBlockName);
        if (freshElements && freshElements.resultsList) {
          const rows = freshElements.resultsList.querySelectorAll("tr");
          if (rows.length > 0) {
            console.log(`[RightPane]  Found ${rows.length} results`);
            self._extractAndDisplayResults(cardObject, freshElements);
          } else {
            console.log(`[RightPane]  No results`);
            const suggestionBox = cardObject.suggestionBox;
            if (suggestionBox) {
              const resultsList = suggestionBox.querySelector(".ss-results-list");
              resultsList.innerHTML = "";
              const noResultsDiv = document.createElement("div");
              noResultsDiv.className = "ss-no-results";
              noResultsDiv.textContent =
                self.locale === "de"
                  ? `Keine Ergebnisse fuer "${searchTerm}" gefunden`
                  : `No results found for "${searchTerm}"`;
              resultsList.appendChild(noResultsDiv);
              suggestionBox.querySelector(".ss-result-count").textContent =
                self.locale === "de" ? "0 Ergebnisse gefunden" : "0 results found";
            }
          }
        } else {
          console.error(`[RightPane]  Could not re-fetch elements`);
        }
      } else if (checkCount >= maxChecks) {
        clearInterval(checkSpinner);
        console.log(`[RightPane]  Timeout`);

        // Re-fetch elements
        const freshElements = self._getSSPromptElements(config.sspBlockName);
        if (freshElements && freshElements.resultsList) {
          const rows = freshElements.resultsList.querySelectorAll("tr");
          if (rows.length > 0) {
            console.log(`[RightPane]  Timeout: ${rows.length} results`);
            self._extractAndDisplayResults(cardObject, freshElements);
          } else {
            const suggestionBox = cardObject.suggestionBox;
            if (suggestionBox) {
              const resultsList = suggestionBox.querySelector(".ss-results-list");
              resultsList.innerHTML = "";
              const noResultsDiv = document.createElement("div");
              noResultsDiv.className = "ss-no-results";
              noResultsDiv.textContent =
                self.locale === "de"
                  ? `Keine Ergebnisse fuer "${searchTerm}" gefunden`
                  : `No results found for "${searchTerm}"`;
              resultsList.appendChild(noResultsDiv);
              suggestionBox.querySelector(".ss-result-count").textContent =
                self.locale === "de" ? "0 Ergebnisse gefunden" : "0 results found";
            }
          }
        } else {
          console.error(`[RightPane]  Timeout: Could not fetch elements`);
        }
      }
    }, 50);
  };

  // ===========================================================================
  // EXTRACT AND DISPLAY RESULTS
  // ===========================================================================
  RightPane.prototype._extractAndDisplayResults = function (cardObject, elements) {
    const config = cardObject.config;
    console.log(`[RightPane]  Extracting results from native prompt`);

    const rows = elements.resultsList.querySelectorAll("tr");
    const results = [];

    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 0) {
        const resultText = cells[0].textContent.trim();
        const parsed = this._parseSSResultValue(resultText, config);

        results.push({
          display: parsed.display,
          use: parsed.use,
        });

        if (idx < 3) {
          console.log(`[RightPane]  Row ${idx}: display="${parsed.display}", use="${parsed.use}"`);
        }
      }
    });

    console.log(`[RightPane]  Extracted ${results.length} results`);
    this._displaySearchResults(cardObject, results);
  };

  // ===========================================================================
  // VALIDATE SS PARSE CONFIG - Detects conflicts between useDelimiter and useValueLength
  // ===========================================================================
  RightPane.prototype._validateSSParseConfig = function (config) {
    const hasLength = config.useValueLength && typeof config.useValueLength === "number" && config.useValueLength > 0;

    const hasDelimiter =
      config.useDelimiter && typeof config.useDelimiter === "string" && config.useDelimiter.length > 0;

    if (hasLength && hasDelimiter) {
      return {
        method: "length",
        warning: true,
        message:
          "Both useValueLength and useDelimiter are defined. Defaulting to useValueLength. Please remove one to avoid ambiguity.",
      };
    } else if (hasDelimiter) {
      return { method: "delimiter", warning: false };
    } else if (hasLength) {
      return { method: "length", warning: false };
    } else {
      return { method: "full", warning: false };
    }
  };

  // ===========================================================================
  // PARSE SS RESULT VALUE - Now supports delimiter-based parsing
  // ===========================================================================
  RightPane.prototype._parseSSResultValue = function (resultText, config) {
    let useValue, displayValue;

    displayValue = resultText.trim();

    // Validate config to determine parsing method
    const validation = this._validateSSParseConfig(config);

    if (validation.method === "delimiter") {
      // OPTION 1: Delimiter-based parsing (NEW)
      const delimiter = config.useDelimiter;

      if (resultText.includes(delimiter)) {
        // Split at FIRST occurrence of delimiter
        const firstDelimiterIndex = resultText.indexOf(delimiter);
        const beforeDelimiter = resultText.substring(0, firstDelimiterIndex).trim();

        if (beforeDelimiter.length > 0) {
          // Valid split - use first part as useValue
          useValue = beforeDelimiter;
          console.log(`[RightPane]  Parsed with delimiter="${delimiter}":`);
          console.log(`  Display: "${displayValue}"`);
          console.log(`  Use: "${useValue}"`);
        } else {
          // Empty before delimiter - fall back to full string
          useValue = displayValue;
          console.warn(`[RightPane]  Delimiter found but nothing before it - using full value: "${useValue}"`);
        }
      } else {
        // Delimiter not found in string - fall back to full string
        useValue = displayValue;
        console.warn(`[RightPane]  Delimiter "${delimiter}" not found in result - using full value: "${useValue}"`);
      }
    } else if (validation.method === "length") {
      // OPTION 2: Length-based parsing (CURRENT)
      useValue = resultText.substring(0, config.useValueLength).trim();

      console.log(`[RightPane]  Parsed with length=${config.useValueLength}:`);
      console.log(`  Display: "${displayValue}"`);
      console.log(`  Use: "${useValue}"`);
    } else {
      // OPTION 3: Full string (DEFAULT)
      useValue = displayValue;
      console.log(`[RightPane]  Using full value: "${useValue}"`);
    }

    return { use: useValue, display: displayValue };
  };

  // ===========================================================================
  //  CREATE SUGGESTION BOX
  // ===========================================================================
  RightPane.prototype._createSuggestionBox = function (cardObject) {
    console.log(`[RightPane]  Creating suggestion box`);
    const self = this;

    const suggestionBox = document.createElement("div");
    suggestionBox.className = "ss-suggestion-box";
    suggestionBox.setAttribute("tabindex", "-1"); // Make focusable for keyboard events

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
    selectAllBtn.textContent = this.locale === "de" ? "Alle auswhlen" : "Select All";
    selectAllBtn.type = "button";

    const deselectAllBtn = document.createElement("button");
    deselectAllBtn.className = "ss-deselect-all";
    deselectAllBtn.textContent = this.locale === "de" ? "Alle abwhlen" : "Deselect All";
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
    confirmBtn.textContent = this.locale === "de" ? "Hinzufgen" : "Add Selected";
    confirmBtn.type = "button";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "ss-cancel";
    cancelBtn.textContent = this.locale === "de" ? "Abbrechen" : "Cancel";
    cancelBtn.type = "button";

    footer.appendChild(confirmBtn);
    footer.appendChild(cancelBtn);
    suggestionBox.appendChild(footer);

    // Event handlers
    selectAllBtn.addEventListener("click", () => {
      resultsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        if (!cb.checked) {
          cb.checked = true;
          // Trigger change event for real-time bubbling
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    deselectAllBtn.addEventListener("click", () => {
      resultsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        if (cb.checked) {
          cb.checked = false;
          // Trigger change event for real-time bubbling
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    confirmBtn.addEventListener("click", () => {
      console.log(`[RightPane] Closing suggestion box`);
      // Clear input and hide suggestion box
      cardObject.inputElement.value = "";
      suggestionBox.style.display = "none";
    });

    cancelBtn.addEventListener("click", () => {
      suggestionBox.style.display = "none";
    });

    // ===========================================================================
    //  BugFix #3: TAB key handler on suggestion box
    // ===========================================================================
    suggestionBox.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const checkedBoxes = resultsList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length > 0) {
          e.preventDefault();
          console.log(`[RightPane]  Tab on suggestion box - confirming ${checkedBoxes.length} selections`);
          confirmBtn.click();
        }
      }
      if (e.key === "Escape") {
        suggestionBox.style.display = "none";
        cardObject.inputElement.focus();
      }
    });

    // Append to card
    cardObject.cardElement.appendChild(suggestionBox);
    cardObject.suggestionBox = suggestionBox;

    console.log(`[RightPane]  Suggestion box created and appended`);
    return suggestionBox;
  };

  // ===========================================================================
  //  DISPLAY SEARCH RESULTS
  // ===========================================================================
  RightPane.prototype._displaySearchResults = function (cardObject, results) {
    console.log(`[RightPane]  Displaying ${results.length} search results`);

    // Create or get existing suggestion box
    let suggestionBox = cardObject.suggestionBox;
    if (!suggestionBox) {
      suggestionBox = this._createSuggestionBox(cardObject);
    }

    // Clear previous results (including loading state)
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

      // Checkbox change handler - REAL-TIME BUBBLING
      checkbox.addEventListener("change", () => {
        const useValue = checkbox.value;
        const displayValue = checkbox.dataset.display;

        if (checkbox.checked) {
          // Checked → Create bubble immediately
          console.log(`[RightPane] ✓ Checkbox checked - creating bubble for: "${displayValue}"`);
          self._createBubble(cardObject, displayValue, useValue);

          // Notify Cognos
          if (self.m_oControlHost) {
            try {
              self.m_oControlHost.valueChanged();
              if (cardObject.isRequired || cardObject.config.required) {
                self.m_oControlHost.validStateChanged();
              }
            } catch (err) {
              console.error(`[RightPane] Error notifying Cognos:`, err);
            }
          }
        } else {
          // Unchecked → Remove bubble immediately
          console.log(`[RightPane] ☐ Checkbox unchecked - removing bubble for: "${displayValue}"`);

          // Find and remove the bubble
          const bubbleToRemove = Array.from(cardObject.bubblesContainer.querySelectorAll(".bubble")).find(
            (bubble) => bubble.title === displayValue,
          );

          if (bubbleToRemove) {
            self._removeBubble(cardObject, displayValue, bubbleToRemove, useValue);
          }
        }

        self._updateSelectedCount(suggestionBox);
      });

      // Shift+Click for range selection
      item.addEventListener("click", (e) => {
        if (e.shiftKey && self._lastCheckedIndex !== undefined) {
          const checkboxes = resultsList.querySelectorAll('input[type="checkbox"]');
          const start = Math.min(self._lastCheckedIndex, idx);
          const end = Math.max(self._lastCheckedIndex, idx);

          for (let i = start; i <= end; i++) {
            if (!checkboxes[i].checked) {
              checkboxes[i].checked = true;
              // Trigger change event for real-time bubbling
              checkboxes[i].dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
        self._lastCheckedIndex = idx;
      });
    });

    // Show suggestion box
    suggestionBox.style.display = "flex";
  };

  // ===========================================================================
  //  UPDATE SELECTED COUNT
  // ===========================================================================
  RightPane.prototype._updateSelectedCount = function (suggestionBox) {
    const selectedCount = suggestionBox.querySelectorAll('input[type="checkbox"]:checked').length;
    const countSpan = suggestionBox.querySelector(".ss-selected-count");
    countSpan.textContent = `${selectedCount} ${this.locale === "de" ? "ausgewhlt" : "selected"}`;
  };

  // ===========================================================================
  // RENDER BUBBLE INPUT (Regular/Text)
  // ===========================================================================
  RightPane.prototype._renderBubbleInput = function (card, cardObject) {
    const config = cardObject.config;
    const queryName = config.queryName;
    const promptType = config.promptType || "";
    let datalistId = null;

    // Create datalist only if NOT text type and has queryName
    if (promptType !== "text" && queryName && this.dataStores && this.dataStores[queryName]) {
      console.log(`[RightPane]  Found DataStore for ${queryName}`);

      const dataStore = this.dataStores[queryName];
      datalistId = `datalist-${queryName}`;

      const datalist = document.createElement("datalist");
      datalist.id = datalistId;

      const useCol = cardObject.validatedUseCol;
      const displayCol = cardObject.validatedDisplayCol;

      console.log(`[RightPane]  Using columns - useCol: ${useCol}, displayCol: ${displayCol}`);

      for (let i = 0; i < dataStore.rowCount; i++) {
        const useValue = dataStore.getCellValue(i, useCol);
        const displayValue = dataStore.getCellValue(i, displayCol);

        const option = document.createElement("option");
        option.value = displayValue;
        option.setAttribute("data-use", useValue);
        datalist.appendChild(option);
      }

      card.appendChild(datalist);
      console.log(`[RightPane]  DataList populated with ${dataStore.rowCount} options`);
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

    if (datalistId) {
      input.setAttribute("list", datalistId);
    }

    const placeholderText =
      promptType === "text"
        ? this.locale === "de"
          ? "Eingeben und TAB drcken..."
          : "Type and press TAB..."
        : this.locale === "de"
          ? "Auswhlen oder eingeben und TAB drcken..."
          : "Select or type and press TAB...";

    input.placeholder = placeholderText;
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

    // Validated columns
    if (config.useColumn !== undefined && config.displayColumn !== undefined) {
      cardObject.validatedUseCol = config.useColumn;
      cardObject.validatedDisplayCol = config.displayColumn;
    } else {
      cardObject.validatedUseCol = 0;
      cardObject.validatedDisplayCol = 0;
    }

    const self = this;

    // Keydown event (TAB)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const inputValue = input.value.trim();

        if (inputValue) {
          e.preventDefault();
          console.log(`[RightPane]  TAB pressed - bubbling value: "${inputValue}"`);

          let useValue = inputValue;
          let displayValue = inputValue;

          if (datalistId && config.queryName && this.dataStores[config.queryName]) {
            const dataStore = this.dataStores[config.queryName];
            const useCol = cardObject.validatedUseCol;
            const displayCol = cardObject.validatedDisplayCol;

            for (let i = 0; i < dataStore.rowCount; i++) {
              const rowDisplay = dataStore.getCellValue(i, displayCol);
              if (rowDisplay === inputValue) {
                const rowUse = dataStore.getCellValue(i, useCol);
                console.log(`[RightPane]  Found matching row - use: "${rowUse}", display: "${rowDisplay}"`);
                useValue = rowUse;
                displayValue = rowDisplay;
                break;
              }
            }
          }

          this._createBubble(cardObject, displayValue, useValue);
          input.value = "";

          if (this.m_oControlHost) {
            try {
              this.m_oControlHost.valueChanged();
              console.log(`[RightPane]  Cognos notified of value change`);

              if (cardObject.isRequired || cardObject.config.required) {
                this.m_oControlHost.validStateChanged();
                console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
              }
            } catch (err) {
              console.error(`[RightPane]  Error notifying Cognos:`, err);
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
            const rowDisplay = dataStore.getCellValue(i, displayCol);
            if (rowDisplay === displayValue) {
              const rowUse = dataStore.getCellValue(i, useCol);
              console.log(`[RightPane]  Found matching row - use: "${rowUse}", display: "${rowDisplay}"`);
              useValue = rowUse;
              break;
            }
          }
        }

        console.log(`[RightPane]  Change event - bubbling value: "${displayValue}"`);
        this._createBubble(cardObject, displayValue, useValue);
        input.value = "";

        if (this.m_oControlHost) {
          try {
            this.m_oControlHost.valueChanged();
            console.log(`[RightPane]  Cognos notified of value change`);

            if (cardObject.isRequired || cardObject.config.required) {
              this.m_oControlHost.validStateChanged();
              console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
            }
          } catch (err) {
            console.error(`[RightPane]  Error notifying Cognos:`, err);
          }
        }
      }
    });
  };

  // ===========================================================================
  // CREATE BUBBLE (with maxValues enforcement)
  // ===========================================================================
  RightPane.prototype._createBubble = function (cardObject, displayValue, useValue) {
    console.log(`[RightPane]  Creating bubble: display="${displayValue}", use="${useValue}"`);

    // Check maxValues
    const maxValues = cardObject.config.maxValues;
    if (maxValues && cardObject.bubbledValues.length >= maxValues) {
      console.warn(`[RightPane]  maxValues limit reached (${maxValues}) - clearing existing values`);
      cardObject.bubbledValues = [];
      if (cardObject.bubblesContainer) {
        cardObject.bubblesContainer.innerHTML = "";
      }
    }

    // Check for duplicate
    if (cardObject.bubbledValues.some((v) => v.display === displayValue)) {
      console.warn(`[RightPane]  Value "${displayValue}" already exists as bubble`);
      return;
    }

    // Store value
    cardObject.bubbledValues.push({
      display: displayValue,
      use: useValue || displayValue,
    });
    console.log(`[RightPane]  Added to bubbledValues - use:"${useValue || displayValue}", display:"${displayValue}"`);
    console.log(`[RightPane]  Full bubbledValues array:`, JSON.stringify(cardObject.bubbledValues, null, 2));

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

    const self = this;
    removeBtn.addEventListener("click", () => {
      console.log(`[RightPane]  Remove button clicked for: "${displayValue}"`);
      self._removeBubble(cardObject, displayValue, bubble, useValue);
    });

    bubble.appendChild(removeBtn);
    cardObject.bubblesContainer.appendChild(bubble);
    console.log(`[RightPane]  Bubble added to DOM`);

    this._updateRequiredIndicator(cardObject);
  };

  // ===========================================================================
  // REMOVE BUBBLE
  // ===========================================================================
  RightPane.prototype._removeBubble = function (cardObject, displayValue, bubbleElement, useValue) {
    console.log(`[RightPane]  Removing bubble: "${displayValue}"`);
    console.log(`[RightPane]  Before removal, bubbledValues:`, cardObject.bubbledValues);

    const index = cardObject.bubbledValues.findIndex((v) => v.display === displayValue);
    if (index > -1) {
      cardObject.bubbledValues.splice(index, 1);
      console.log(`[RightPane]  Removed from bubbledValues at index ${index}`);
      console.log(`[RightPane]  After removal, bubbledValues:`, cardObject.bubbledValues);
    } else {
      console.warn(`[RightPane]  Value "${displayValue}" not found in bubbledValues!`);
    }

    if (bubbleElement && bubbleElement.parentNode) {
      bubbleElement.parentNode.removeChild(bubbleElement);
      console.log(`[RightPane]  Bubble removed from DOM`);
    }

    if (this.m_oControlHost) {
      try {
        this.m_oControlHost.valueChanged();
        console.log(`[RightPane]  Cognos notified of value removal`);

        if (cardObject.isRequired || cardObject.config.required) {
          this.m_oControlHost.validStateChanged();
          console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
        }
      } catch (err) {
        console.error(`[RightPane]  Error notifying Cognos:`, err);
      }
    }
    this._updateRequiredIndicator(cardObject);
  };

  // ===========================================================================
  // UPDATE REQUIRED INDICATOR
  // ===========================================================================
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
      cardObject.requiredIndicator.textContent = "✓ Required";
      cardObject.requiredIndicator.classList.add("filled");
    } else {
      cardObject.requiredIndicator.textContent = "☆ Required";
      cardObject.requiredIndicator.classList.remove("filled");
    }
  };

  // ===========================================================================
  // CHECK IF ALL REQUIRED CARDS ARE FILLED
  // ===========================================================================
  RightPane.prototype.areRequiredCardsFilled = function () {
    console.log("[RightPane]  Checking if all required cards are filled");

    const requiredCards = this.cards.filter((card) => card.isRequired || card.config.required);
    console.log(`[RightPane]  Found ${requiredCards.length} required cards`);

    if (requiredCards.length === 0) {
      console.log("[RightPane]  No required cards - validation passed");
      return true;
    }

    for (let i = 0; i < requiredCards.length; i++) {
      const card = requiredCards[i];
      const config = card.config;

      console.log(`[RightPane]  Checking required card ${i + 1}: ${config.label}`);

      if (config.promptType === "dateRange" || config.promptType === "dateFromTo") {
        const fromValue = card.dateFromInput ? card.dateFromInput.value : "";
        const toValue = card.dateToInput ? card.dateToInput.value : "";

        if (!fromValue || !toValue) {
          console.warn(`[RightPane]  Required card "${config.label}" is incomplete (date range)`);
          return false;
        }
      } else if (config.promptType === "date") {
        const dateValue = card.inputElement ? card.inputElement.value : "";
        if (!dateValue) {
          console.warn(`[RightPane]  Required card "${config.label}" is incomplete (date)`);
          return false;
        }
      } else {
        if (!card.bubbledValues || card.bubbledValues.length === 0) {
          console.warn(`[RightPane]  Required card "${config.label}" has no values`);
          return false;
        }
      }

      console.log(`[RightPane]  Required card "${config.label}" is filled`);
    }

    console.log("[RightPane]  All required cards are filled - validation passed");
    return true;
  };

  // ===========================================================================
  // GET PARAMETERS
  // ===========================================================================
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane]  getParameters() called");

    const allParams = [];

    try {
      this.cards.forEach((cardObject) => {
        const cardParams = cardObject.getParameters();
        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
        }
      });

      console.log("[RightPane]  Total parameters:", allParams.length);
      return allParams;
    } catch (err) {
      console.error("[RightPane]  getParameters() failed:", err);
      return [];
    }
  };

  return RightPane;
});
// ===========================================================================
// DESTROY
// ===========================================================================
RightPane.prototype.destroy = function () {
  console.log("[RightPane]  destroy() called");

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

    console.log("[RightPane]  destroy() complete - cleanup successful");
  } catch (err) {
    console.error("[RightPane]  destroy() failed:", err);
  }
};
