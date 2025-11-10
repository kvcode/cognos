define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] 🏗 Constructor called");
    this.domNode = null;
    this.cardsContainer = null;
    this.autocompleteData = {};
    this.m_oControlHost = null;
    this.cards = []; // Structured card objects
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

      getParameters: function () {
        console.log("[RightPane] 📋 Card getParameters() called for:", this.config.label);

        const value = this.inputElement ? this.inputElement.value.trim() : "";
        console.log("[RightPane] 🔍 Input value:", value);
        console.log("[RightPane] 🔍 paramName:", this.config.paramName);

        if (!value) {
          console.log("[RightPane] ⚠️ No value entered, returning empty array");
          return [];
        }

        if (!this.config.paramName) {
          console.error("[RightPane] ❌ paramName missing in config! Cannot create parameter.");
          return [];
        }

        const result = [
          {
            parameter: this.config.paramName,
            values: [{ use: value }],
          },
        ];

        console.log("[RightPane] 📤 Returning parameter:", JSON.stringify(result, null, 2));
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
      console.log("[RightPane] 📏 Card width: min=480px, max=720px, auto-grow");

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

      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Enter value...";
      input.style.width = "100%";
      input.style.padding = "5px";
      input.style.boxSizing = "border-box";
      input.style.border = "1px solid #28a745";
      input.style.minWidth = "0";
      card.appendChild(input);

      cardObject.domElement = card;
      cardObject.inputElement = input;
      console.log("[RightPane] 💾 Stored domElement and inputElement on card object");

      input.addEventListener("input", (e) => {
        console.log(`[RightPane] ⌨️ User typed in "${config.label}":`, e.target.value);

        if (cardObject.domElement) {
          console.log(`[RightPane] 📏 Current card width: ${cardObject.domElement.offsetWidth}px`);
        }

        if (this.m_oControlHost) {
          try {
            console.log(`[RightPane] 📢 Notifying Cognos: valueChanged()`);
            this.m_oControlHost.valueChanged();
            console.log(`[RightPane] ✅ Cognos notified successfully`);
          } catch (err) {
            console.error(`[RightPane] ❌ Error notifying Cognos:`, err);
          }
        } else {
          console.error(`[RightPane] ❌ Cannot notify - m_oControlHost is null!`);
        }
      });

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane] ❌ _renderCard() failed:", err);
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
          console.log(`[RightPane] ⚠️ Card ${idx} has no parameters (empty input or missing paramName)`);
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
