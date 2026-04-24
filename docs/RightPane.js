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

    try {
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";

      this.domNode.appendChild(this.cardsContainer);

      const config = oControlHost.configuration || {};
      console.log("[RightPane]  Configuration received:", config);

      this.autocompleteData = config.autocompleteTags || {};
      console.log("[RightPane]  Autocomplete data loaded:", this.autocompleteData);

      console.log("[RightPane]  Initialization complete");
      fnDoneInitializing();
    } catch (err) {
      console.error("[RightPane]  initialize() failed:", err);
      fnDoneInitializing();
    }
  };

  // ===========================================================================
  // DRAW
  // ===========================================================================
  RightPane.prototype.draw = function (oControlHost) {
    console.log("[RightPane]  draw() called");

    try {
      if (!this.domNode) {
        console.warn("[RightPane]  domNode not initialized, aborting draw");
        return;
      }

      this.cardsContainer.innerHTML = "";
      console.log("[RightPane]  Cleared previous cards");

      this.cards.forEach((cardObject) => {
        this._renderCard(cardObject);
      });
      console.log("[RightPane]  Rendered", this.cards.length, "cards");
    } catch (err) {
      console.error("[RightPane]  draw() failed:", err);
    }
  };

  // ===========================================================================
  // SET DATA STORES
  // ===========================================================================
  RightPane.prototype.setDataStores = function (dataStores) {
    console.log("[RightPane]  setDataStores() called");
    this.dataStores = dataStores || {};
    console.log("[RightPane]  Available DataStores:", Object.keys(this.dataStores));

    Object.keys(this.dataStores).forEach((key) => {
      const ds = this.dataStores[key];
      console.log(`[RightPane]  DataStore "${key}": ${ds.rowCount} rows`);
    });
  };

  // ===========================================================================
  // HAS CARD - Check if card exists for paramName
  // ===========================================================================
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
      domElement: null,
      inputElement: null,
      bubblesContainer: null,
      bubbledValues: [],
      sourceButton: cardData.sourceButton || null,
      isRequired: cardData.isRequired || false,
      dateFromInput: null,
      dateToInput: null,
      activePreset: null, //  For relative time presets (dateFromTo)
      suggestionBox: null, //  For searchSelect

      // ===========================================================================
      // GET PARAMETERS - Called by Cognos on finish
      // ===========================================================================
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

          const result = [];
          const presetParam = this.config.paramNames.preset;

          if (this.activePreset && presetParam) {
            // PRESET MODE: pass preset param only, explicitly clear date params
            console.log("[RightPane]  DateFromTo preset mode:", this.activePreset);
            result.push({
              parameter: presetParam,
              values: [{ use: this.activePreset, display: this.activePresetDisplay || this.activePreset }],
            });
            result.push({ parameter: this.config.paramNames.from, values: [] });
            result.push({ parameter: this.config.paramNames.to, values: [] });
          } else {
            // MANUAL MODE: pass date params, set preset to 'manual' if param exists
            console.log("[RightPane]  DateFromTo manual mode");
            if (presetParam) {
              result.push({
                parameter: presetParam,
                values: [{ use: "manual", display: "manual" }],
              });
            }

            const fromValue = this.dateFromInput ? this.dateFromInput.value : "";
            const toValue = this.dateToInput ? this.dateToInput.value : "";

            result.push({
              parameter: this.config.paramNames.from,
              values: fromValue ? [{ use: fromValue, display: fromValue }] : [],
            });
            result.push({
              parameter: this.config.paramNames.to,
              values: toValue ? [{ use: toValue, display: toValue }] : [],
            });
          }

          console.log("[RightPane]  DateFromTo returning parameters:", JSON.stringify(result, null, 2));
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
      console.log(`[RightPane]  Removed from cards array at index ${index}`);
      console.log(`[RightPane]  After removal, total cards:`, this.cards.length);
    } else {
      console.warn(`[RightPane]  Card not found in cards array!`);
    }

    if (cardObject.domElement && cardObject.domElement.parentNode) {
      cardObject.domElement.parentNode.removeChild(cardObject.domElement);
      console.log(`[RightPane]  Removed card DOM element`);
    }

    if (cardObject.sourceButton) {
      cardObject.sourceButton.classList.remove("disabled");
      console.log(`[RightPane]  Re-enabled source button`);
    }
  };

  // ===========================================================================
  // RENDER CARD
  // ===========================================================================
  RightPane.prototype._renderCard = function (cardObject) {
    console.log("[RightPane]  _renderCard() called");
    console.log("[RightPane]  Card config:", JSON.stringify(cardObject.config, null, 2));

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
        removeCardBtn.textContent = "×";
        removeCardBtn.title = "Remove card";

        removeCardBtn.addEventListener("click", () => {
          console.log(`[RightPane]  Card remove button clicked for: ${config.label}`);
          this.removeCard(cardObject);
        });

        headerContainer.appendChild(removeCardBtn);
      }

      card.appendChild(headerContainer);

      // Param info
      const paramInfo = document.createElement("div");
      paramInfo.className = "right-pane-card-param-info";

      if (promptType === "dateFromTo" && config.paramNames) {
        const paramParts = [config.paramNames.from, config.paramNames.to];
        if (config.paramNames.preset) {
          paramParts.push(config.paramNames.preset);
        }
        paramInfo.textContent = "Params: " + paramParts.join(" / ");
      } else {
        paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      }
      card.appendChild(paramInfo);

      // Config warning bar (dateFromTo relative times consistency check - non-blocking)
      if (promptType === "dateFromTo") {
        const warnings = [];
        const hasRT = config.hasRelativeTimes === true;
        const hasPresetParam = !!(config.paramNames && config.paramNames.preset);

        if (hasRT && !hasPresetParam) {
          warnings.push(
            this.locale === "de"
              ? "hasRelativeTimes aktiv, aber paramNames.preset fehlt"
              : "hasRelativeTimes enabled but paramNames.preset missing",
          );
        }
        if (!hasRT && hasPresetParam) {
          warnings.push(
            this.locale === "de"
              ? "paramNames.preset definiert, aber hasRelativeTimes nicht aktiviert"
              : "paramNames.preset defined but hasRelativeTimes not enabled",
          );
        }
        if (hasRT && (!Array.isArray(config.relativeTimes) || config.relativeTimes.length === 0)) {
          warnings.push(
            this.locale === "de"
              ? "hasRelativeTimes aktiv, aber keine relativeTimes-Buttons konfiguriert"
              : "hasRelativeTimes enabled but no relativeTimes buttons configured",
          );
        }

        if (warnings.length > 0) {
          const warningBar = document.createElement("div");
          warningBar.className = "rt-config-warning";
          warningBar.textContent = "\u26A0 " + warnings.join(" \u2502 ");
          card.appendChild(warningBar);
        }
      }

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
        //  Search & Select type
        this._renderSearchSelectInput(card, cardObject);
      } else {
        // Default: bubble input (value prompt or text)
        this._renderBubbleInput(card, cardObject);
      }

      this.cardsContainer.appendChild(card);
      cardObject.domElement = card;
      console.log("[RightPane]  Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane]  _renderCard() failed:", err);
    }
  };

  // ===========================================================================
  // RENDER DATE RANGE INPUT (used by both dateRange and dateFromTo)
  // ===========================================================================
  RightPane.prototype._renderDateRangeInput = function (card, cardObject) {
    const config = cardObject.config;

    // ===========================================================================
    // RELATIVE TIMES STRIP (dateFromTo with hasRelativeTimes: true only)
    // ===========================================================================
    if (
      config.promptType === "dateFromTo" &&
      config.hasRelativeTimes === true &&
      Array.isArray(config.relativeTimes) &&
      config.relativeTimes.length > 0
    ) {
      const rtStrip = document.createElement("div");
      rtStrip.className = "rt-strip";

      config.relativeTimes.forEach((preset) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rt-btn";

        const label =
          (preset.labels && preset.labels[this.locale]) ||
          (preset.labels && preset.labels["en"]) ||
          preset.label ||
          preset.value;
        btn.textContent = label;
        btn.dataset.rtValue = preset.value;

        btn.addEventListener("click", () => {
          // Update active button state
          rtStrip.querySelectorAll(".rt-btn").forEach((b) => b.classList.remove("rt-btn-active"));
          btn.classList.add("rt-btn-active");

          // Show calculated dates visually
          const dates = this._calculateRelativeDates(preset.value);
          if (dates) {
            cardObject.dateFromInput.value = dates.from;
            cardObject.dateToInput.value = dates.to;
          }

          // Store preset on cardObject
          cardObject.activePreset = preset.value;
          cardObject.activePresetDisplay = label;
          console.log("[RightPane]  Relative time preset selected:", preset.value);

          if (this.m_oControlHost) {
            try {
              this.m_oControlHost.valueChanged();
              if (cardObject.isRequired || config.required) {
                this.m_oControlHost.validStateChanged();
              }
            } catch (err) {
              console.error("[RightPane]  Error notifying Cognos:", err);
            }
          }
          this._updateRequiredIndicator(cardObject);
        });

        rtStrip.appendChild(btn);
      });

      card.appendChild(rtStrip);
    }

    // ===========================================================================
    // DATE INPUTS
    // ===========================================================================
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
      // Manual edit clears active preset
      cardObject.activePreset = null;
      cardObject.activePresetDisplay = null;
      const strip = card.querySelector(".rt-strip");
      if (strip) {
        strip.querySelectorAll(".rt-btn").forEach((b) => b.classList.remove("rt-btn-active"));
      }

      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane]  Date range changed - Cognos notified`);

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

    fromInput.addEventListener("change", notifyChange);
    toInput.addEventListener("change", notifyChange);
  };

  // ===========================================================================
  // CALCULATE RELATIVE DATES
  // ===========================================================================
  RightPane.prototype._calculateRelativeDates = function (presetValue) {
    const today = new Date();
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    let from, to;

    switch (presetValue) {
      case "YESTERDAY": {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        from = to = fmt(y);
        break;
      }
      case "LAST_7": {
        const s = new Date(today);
        s.setDate(s.getDate() - 6);
        from = fmt(s);
        to = fmt(today);
        break;
      }
      case "LAST_30": {
        const s = new Date(today);
        s.setDate(s.getDate() - 29);
        from = fmt(s);
        to = fmt(today);
        break;
      }
      case "LAST_WEEK": {
        // Last full Mon-Sun week
        const dow = today.getDay(); // 0=Sun, 1=Mon...
        const daysToLastMon = dow === 0 ? 6 : dow - 1;
        const lastMon = new Date(today);
        lastMon.setDate(today.getDate() - daysToLastMon - 7);
        const lastSun = new Date(lastMon);
        lastSun.setDate(lastMon.getDate() + 6);
        from = fmt(lastMon);
        to = fmt(lastSun);
        break;
      }
      case "MTD": {
        from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
        to = fmt(today);
        break;
      }
      case "LAST_MONTH": {
        const lmStart =
          today.getMonth() === 0
            ? new Date(today.getFullYear() - 1, 11, 1)
            : new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lmEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        from = fmt(lmStart);
        to = fmt(lmEnd);
        break;
      }
      case "QTD": {
        const q = Math.floor(today.getMonth() / 3);
        from = fmt(new Date(today.getFullYear(), q * 3, 1));
        to = fmt(today);
        break;
      }
      case "LAST_QUARTER": {
        const q = Math.floor(today.getMonth() / 3);
        let lqStart, lqEnd;
        if (q === 0) {
          lqStart = new Date(today.getFullYear() - 1, 9, 1);
          lqEnd = new Date(today.getFullYear() - 1, 11, 31);
        } else {
          lqStart = new Date(today.getFullYear(), (q - 1) * 3, 1);
          lqEnd = new Date(today.getFullYear(), q * 3, 0);
        }
        from = fmt(lqStart);
        to = fmt(lqEnd);
        break;
      }
      case "YTD": {
        from = fmt(new Date(today.getFullYear(), 0, 1));
        to = fmt(today);
        break;
      }
      case "LAST_YEAR": {
        from = fmt(new Date(today.getFullYear() - 1, 0, 1));
        to = fmt(new Date(today.getFullYear() - 1, 11, 31));
        break;
      }
      case "LAST_12M": {
        const s = new Date(today);
        s.setFullYear(s.getFullYear() - 1);
        from = fmt(s);
        to = fmt(today);
        break;
      }
      default:
        console.warn("[RightPane]  Unknown relative time preset:", presetValue);
        return null;
    }

    console.log("[RightPane]  Calculated dates for " + presetValue + ": from=" + from + " to=" + to);
    return { from: from, to: to };
  };

  // ===========================================================================
  // RENDER SINGLE DATE INPUT
  // ===========================================================================
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
            console.log(`[RightPane]  Date selected - Cognos notified`);

            if (cardObject.isRequired || cardObject.config.required) {
              this.m_oControlHost.validStateChanged();
              console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
            }
          } catch (err) {
            console.error(`[RightPane]  Error notifying Cognos:`, err);
          }
        }
        this._updateRequiredIndicator(cardObject);
      }
    });
  };

  // ===========================================================================
  //  RENDER SEARCH & SELECT INPUT
  // ===========================================================================
  RightPane.prototype._renderSearchSelectInput = function (card, cardObject) {
    const config = cardObject.config;
    const self = this;
    console.log("[RightPane]  Rendering searchSelect input for:", config.label);

    // Validate required config
    if (!config.sspBlockName) {
      console.error(`[RightPane]  searchSelect type requires sspBlockName property for: ${config.label}`);
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
          // Update checked states based on current bubbles (Point 4)
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
      // ===========================================================================
      //  BugFix #3: TAB key in input field - confirm checked items or create free bubble
      // ===========================================================================
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

    //  PASTE handler for searchSelect
    inputWrapper.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      console.log(`[RightPane]  Paste detected in searchSelect:`, pastedText);

      const values = pastedText
        .split(/[\n\r\t,;]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      console.log(`[RightPane]  Parsed ${values.length} values:`, values);

      values.forEach((val) => {
        const parsed = this._parseSSResultValue(val, config);
        this._createBubble(cardObject, parsed.display, parsed.use);
      });

      if (this.m_oControlHost) {
        try {
          this.m_oControlHost.valueChanged();
          console.log(`[RightPane]  Paste complete - Cognos notified`);

          if (cardObject.isRequired || cardObject.config.required) {
            this.m_oControlHost.validStateChanged();
          }
        } catch (err) {
          console.error(`[RightPane]  Error notifying Cognos:`, err);
        }
      }
    });
    // Force-enable all native SS prompt buttons permanently
    var ssElements = this._getSSPromptElements(config.sspBlockName);
    if (ssElements) {
      [ssElements.searchButton, ssElements.addButton, ssElements.removeButton].forEach(function (btn) {
        if (btn) {
          btn.removeAttribute("disabled");
          btn.disabled = false;
          btn.setAttribute("hal_disabled", "false");
        }
      });
      console.log("[RightPane] âœ… Force-enabled all native SS buttons");
    }
  };

  // ===========================================================================
  //  GET SS PROMPT ELEMENTS
  // ===========================================================================
  RightPane.prototype._getSSPromptElements = function (sspBlockName) {
    console.log(`[RightPane]  Looking for SS prompt block: ${sspBlockName}`);

    const block = document.querySelector(`[lid="${sspBlockName}"]`);

    if (!block) {
      console.error(`[RightPane]  SS Prompt block not found: ${sspBlockName}`);
      return null;
    }

    const elements = {
      block: block,
      searchInput: block.querySelector(".clsSelectWithSearchSearchText") || block.querySelector('[id$="_searchText"]'),
      searchButton:
        block.querySelector(".clsSelectWithSearchSearchButton") || block.querySelector('[id$="_searchButton"]'),
      resultsList: block.querySelector(".clsListViewCheckboxView"),
      selectAllCheckbox: block.querySelector(".clsSelectWithSearchSelectAll"),
      addButton: block.querySelector(".clsPromptInsertButton"),
      removeButton: block.querySelector(".clsPromptRemoveButton"),
      selectedList: block.querySelector(".clsListViewReportView"),
    };

    console.log(`[RightPane]  Found SS prompt elements:`, {
      block: !!elements.block,
      searchInput: !!elements.searchInput,
      searchButton: !!elements.searchButton,
      resultsList: !!elements.resultsList,
      addButton: !!elements.addButton,
      removeButton: !!elements.removeButton,
      selectedList: !!elements.selectedList,
    });

    return elements;
  };

  // ===========================================================================
  //  TRIGGER SEARCH AND SELECT
  // ===========================================================================
  RightPane.prototype._triggerSearchAndSelect = function (cardObject, searchTerm) {
    const config = cardObject.config;
    const self = this;
    console.log(`[RightPane]  _triggerSearchAndSelect() for "${searchTerm}" using block: ${config.sspBlockName}`);

    const elements = this._getSSPromptElements(config.sspBlockName);

    if (!elements || !elements.searchInput || !elements.searchButton) {
      console.error(`[RightPane]  Cannot find SS prompt elements for: ${config.sspBlockName}`);
      // Fallback: create bubble directly from input
      const parsed = this._parseSSResultValue(searchTerm, config);
      this._createBubble(cardObject, parsed.display, parsed.use);
      cardObject.inputElement.value = "";

      if (this.m_oControlHost) {
        this.m_oControlHost.valueChanged();
      }
      return;
    }

    // ===========================================================================
    //  BugFix #2 & #4: Show loading spinner IMMEDIATELY before search
    // ===========================================================================
    let suggestionBox = cardObject.suggestionBox;
    if (!suggestionBox) {
      suggestionBox = this._createSuggestionBox(cardObject);
    }

    // Clear previous results and show loading state
    const resultsList = suggestionBox.querySelector(".ss-results-list");
    resultsList.innerHTML = "";

    // Show loading spinner
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "ss-loading";
    loadingDiv.innerHTML = `
      <div class="ss-spinner"></div>
      <span>${this.locale === "de" ? "Suche nach" : "Searching for"} "${searchTerm}"...</span>
    `;
    resultsList.appendChild(loadingDiv);

    // Update header to show searching
    suggestionBox.querySelector(".ss-result-count").textContent =
      this.locale === "de" ? "Suche luft..." : "Searching...";

    // Show the suggestion box immediately with loading state
    suggestionBox.style.display = "flex";
    console.log(`[RightPane]  Showing loading spinner`);

    // Set search value
    elements.searchInput.value = searchTerm;
    console.log(`[RightPane]  Set search input to: "${searchTerm}"`);

    // ===========================================================================
    //  BugFix #1: Remove disabled attribute before clicking search button
    // ===========================================================================
    elements.searchButton.removeAttribute("disabled");
    elements.searchButton.disabled = false;
    elements.searchButton.style.pointerEvents = "auto";
    console.log(`[RightPane]  Removed disabled from search button`);

    // Click search button
    elements.searchButton.click();
    console.log(`[RightPane]  Clicked search button`);

    // Monitor Cognos progress.gif spinner
    let spinnerAppeared = false;
    let checkCount = 0;
    const maxChecks = 600; // 30 seconds max

    const checkSpinner = setInterval(() => {
      checkCount++;
      const spinner = elements.block.querySelector('img[src*="progress.gif"]');

      if (!spinnerAppeared && spinner) {
        spinnerAppeared = true;
        console.log(`[RightPane] Spinner appeared - loading...`);
      } else if (spinnerAppeared && !spinner) {
        clearInterval(checkSpinner);
        console.log(`[RightPane] Spinner gone - extracting`);

        // Re-fetch elements in case Cognos recreated DOM
        const freshElements = self._getSSPromptElements(config.sspBlockName);
        if (freshElements && freshElements.resultsList) {
          const rows = freshElements.resultsList.querySelectorAll("tr");
          if (rows.length > 0) {
            console.log(`[RightPane] Found ${rows.length} results`);
            self._extractAndDisplayResults(cardObject, freshElements);
          } else {
            console.log(`[RightPane] No results`);
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
        } else {
          console.error(`[RightPane] Could not re-fetch elements`);
        }
      } else if (checkCount >= maxChecks) {
        clearInterval(checkSpinner);
        console.log(`[RightPane] Timeout`);

        // Re-fetch elements
        const freshElements = self._getSSPromptElements(config.sspBlockName);
        if (freshElements && freshElements.resultsList) {
          const rows = freshElements.resultsList.querySelectorAll("tr");
          if (rows.length > 0) {
            console.log(`[RightPane] Timeout: ${rows.length} results`);
            self._extractAndDisplayResults(cardObject, freshElements);
          } else {
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
        } else {
          console.error(`[RightPane] Timeout: Could not fetch elements`);
        }
      }
    }, 50);
  };

  // ===========================================================================
  //  EXTRACT AND DISPLAY RESULTS
  // ===========================================================================
  RightPane.prototype._extractAndDisplayResults = function (cardObject, elements) {
    const config = cardObject.config;
    const results = [];

    const rows = elements.resultsList.querySelectorAll("tr");
    console.log(`[RightPane]  Extracting ${rows.length} results`);

    rows.forEach((row, idx) => {
      const label = row.querySelector(".clsListItemLabel") || row.querySelector("td");
      if (label) {
        const resultText = label.textContent.trim();
        const parsed = this._parseSSResultValue(resultText, config);
        results.push(parsed);

        if (idx < 3) {
          console.log(`[RightPane]  Row ${idx}: display="${parsed.display}", use="${parsed.use}"`);
        }
      }
    });

    console.log(`[RightPane]  Extracted ${results.length} results`);
    this._displaySearchResults(cardObject, results);
  };

  // ===========================================================================
  //  PARSE SS RESULT VALUE
  // ===========================================================================
  RightPane.prototype._parseSSResultValue = function (resultText, config) {
    let useValue;
    var displayValue = resultText; // RAW - untouched from source
    var cleanText = resultText.trim(); // Trimmed copy for use-value extraction

    if (config.useDelimiter && typeof config.useDelimiter === "string") {
      var delimIdx = cleanText.indexOf(config.useDelimiter);
      if (delimIdx > -1) {
        useValue = cleanText.substring(0, delimIdx).trim();
      } else {
        useValue = cleanText;
      }
      console.log(
        '[RightPane] Parsed with delimiter="' +
          config.useDelimiter +
          '": use="' +
          useValue +
          '", display="' +
          displayValue +
          '"',
      );
    } else if (config.useValueLength && typeof config.useValueLength === "number") {
      useValue = cleanText.substring(0, config.useValueLength).trim();
      console.log(
        "[RightPane] Parsed with length=" +
          config.useValueLength +
          ': use="' +
          useValue +
          '", display="' +
          displayValue +
          '"',
      );
    } else {
      useValue = cleanText;
      console.log('[RightPane] Using full value: use="' + useValue + '", display="' + displayValue + '"');
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
    cardObject.domElement.appendChild(suggestionBox);
    cardObject.suggestionBox = suggestionBox;

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
  //  BugFix #5: MIRROR TO NATIVE SS PROMPT
  // ===========================================================================

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
      let useCol = config.useColumn !== undefined ? config.useColumn : 0;
      let displayCol = config.displayColumn !== undefined ? config.displayColumn : 1;

      console.log(`[RightPane]  Config requested useColumn: ${useCol}, displayColumn: ${displayCol}`);
      console.log(`[RightPane]  DataStore "${queryName}" has ${dataStore.columnCount} column(s)`);

      if (useCol >= dataStore.columnCount) {
        console.warn(`[RightPane]  useColumn ${useCol} out of bounds`);
        useCol = 0;
      }

      if (displayCol >= dataStore.columnCount) {
        console.warn(`[RightPane]  displayColumn ${displayCol} out of bounds`);
        displayCol = useCol;
      }

      console.log(`[RightPane]  Final validated columns - useColumn: ${useCol}, displayColumn: ${displayCol}`);

      cardObject.validatedUseCol = useCol;
      cardObject.validatedDisplayCol = displayCol;

      datalistId = `datalist-${queryName}-${Date.now()}`;
      const datalist = document.createElement("datalist");
      datalist.id = datalistId;

      console.log(`[RightPane]  Populating datalist with ${dataStore.rowCount} values`);
      for (let i = 0; i < dataStore.rowCount; i++) {
        const displayValue = dataStore.getCellValue(i, displayCol);
        const useValue = dataStore.getCellValue(i, useCol);

        const option = document.createElement("option");
        option.value = displayValue;
        option.setAttribute("data-use-value", useValue);
        datalist.appendChild(option);

        if (i < 3) {
          console.log(`[RightPane]  Row ${i}: display="${displayValue}", use="${useValue}"`);
        }
      }

      card.appendChild(datalist);
      console.log(`[RightPane]  Created datalist with ID: ${datalistId}`);
    } else if (promptType === "text") {
      console.log(`[RightPane]  Text-only input - no datalist`);
    } else {
      console.log(`[RightPane]  No DataStore found for queryName: ${queryName}`);
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
      console.log(`[RightPane]  Input linked to datalist: ${datalistId}`);
    }

    inputWrapper.appendChild(input);

    // Click wrapper to focus input
    inputWrapper.addEventListener("click", (e) => {
      if (e.target !== input) {
        input.focus();
        input.click();
      }
    });

    //  PASTE HANDLER
    inputWrapper.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      console.log(`[RightPane]  Paste detected:`, pastedText);

      const values = pastedText
        .split(/[\n\r\t,;]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      console.log(`[RightPane]  Parsed ${values.length} values:`, values);

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
          console.log(`[RightPane]  Paste complete - Cognos notified`);

          if (cardObject.isRequired || cardObject.config.required) {
            this.m_oControlHost.validStateChanged();
            console.log(`[RightPane]  Cognos notified of valid state change (required card)`);
          }
        } catch (err) {
          console.error(`[RightPane]  Error notifying Cognos:`, err);
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
                console.log(`[RightPane]  Mapped "${displayValue}"  use="${useValue}"`);
                break;
              }
            }
          }

          console.log(`[RightPane]  Creating bubble: display="${displayValue}", use="${useValue}"`);
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
            const dsDisplay = dataStore.getCellValue(i, displayCol);
            if (dsDisplay === displayValue) {
              useValue = dataStore.getCellValue(i, useCol);
              console.log(`[RightPane]  Mapped "${displayValue}"  use="${useValue}"`);
              break;
            }
          }
        }

        console.log(`[RightPane]  Datalist selection confirmed: display="${displayValue}", use="${useValue}"`);
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

    if (cardObject.config.promptType === "searchSelect") {
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
        cardObject.activePreset ||
        (cardObject.dateFromInput &&
          cardObject.dateFromInput.value &&
          cardObject.dateToInput &&
          cardObject.dateToInput.value);
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
      console.log("[RightPane]  No required cards - validation passes");
      return true;
    }

    for (const card of requiredCards) {
      const config = card.config;
      const promptType = config.promptType || "";
      let isFilled = false;

      if (promptType === "dateRange" || promptType === "dateFromTo") {
        isFilled =
          card.activePreset ||
          (card.dateFromInput && card.dateFromInput.value && card.dateToInput && card.dateToInput.value);
        console.log(`[RightPane]  Date card "${config.label}": filled=${isFilled}`);
      } else if (promptType === "date") {
        isFilled = card.inputElement && card.inputElement.value;
        console.log(`[RightPane]  Single date card "${config.label}": filled=${isFilled}`);
      } else {
        isFilled = card.bubbledValues && card.bubbledValues.length > 0;
        console.log(
          `[RightPane]  Bubble card "${config.label}": filled=${isFilled} (${card.bubbledValues.length} values)`,
        );
      }

      if (!isFilled) {
        console.log(`[RightPane]  Required card "${config.label}" is NOT filled`);
        return false;
      }
    }

    console.log("[RightPane]  All required cards are filled");
    return true;
  };

  // ===========================================================================
  // GET PARAMETERS (Called by Cognos)
  // ===========================================================================
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane]  getParameters() called");
    console.log("[RightPane]  Total cards to check:", this.cards.length);

    try {
      const allParams = [];

      this.cards.forEach((cardObject, idx) => {
        console.log(`[RightPane]  Checking card ${idx}:`, cardObject.config.label);
        console.log(`[RightPane]  Card ${idx} bubbledValues:`, cardObject.bubbledValues);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane]  Card ${idx} returned parameters:`, JSON.stringify(cardParams, null, 2));
        } else {
          console.log(`[RightPane]  Card ${idx} has no parameters`);
        }
      });

      console.log("[RightPane]  Final collected parameters:", JSON.stringify(allParams, null, 2));
      console.log("[RightPane]  Total parameters collected:", allParams.length);

      return allParams;
    } catch (err) {
      console.error("[RightPane]  getParameters() failed:", err);
      return [];
    }
  };

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

      console.log("[RightPane]  destroy() complete  cleanup successful");
    } catch (err) {
      console.error("[RightPane]  destroy() failed:", err);
    }
  };

  return RightPane;
});
