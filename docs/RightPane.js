define([], function () {
  "use strict";

  console.log("[RightPane] === Module Loaded ===");

  function RightPane() {
    console.log("[RightPane] 🏗 Constructor called");
    this.domNode = null;
    this.cardsContainer = null; // container for prompt cards
    this.autocompleteData = {};

    // ========== OLD V1 - UNCHANGED ==========
    this.cards = []; // store added cards (OLD)

    // ✨✨✨ NEW V2 - PARALLEL STORAGE ✨✨✨
    this.cardsV2 = []; // NEW: structured card objects
    console.log("[RightPane] 💾 [V2] Initialized cardsV2 array for structured cards");
  }

  RightPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[RightPane] 🔧 initialize() called");

    // ✨ STORE oControlHost so we can call valueChanged() later
    this.m_oControlHost = oControlHost;
    console.log("[RightPane] 💾 Stored oControlHost");

    try {
      // Create main container for RightPane
      this.domNode = document.createElement("div");
      this.domNode.className = "right-pane";

      // Add background color for better visualization
      this.domNode.style.backgroundColor = "#d3d3d3"; // light gray background
      this.domNode.style.padding = "10px";
      this.domNode.style.minHeight = "360px";
      this.domNode.style.height = "100%"; // Adjust height if necessary
      this.domNode.style.position = "relative"; // Ensure positioning for drop area
      this.domNode.style.pointerEvents = "auto";

      // Container for cards
      this.cardsContainer = document.createElement("div");
      this.cardsContainer.className = "right-pane-cards";
      this.cardsContainer.style.minHeight = "200px"; // Enough space to see drop zone
      this.cardsContainer.style.height = "auto"; // Grows with cards
      this.cardsContainer.style.minWidth = "120px";
      this.cardsContainer.style.backgroundColor = "#fffdd7ff";
      this.cardsContainer.style.pointerEvents = "auto";
      this.cardsContainer.style.padding = "10px"; // Add some breathing room

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

      // ========== OLD V1 - UNCHANGED ==========
      // Re-add existing V1 cards (if any)
      this.cards.forEach((cardData) => {
        this._renderCard(cardData);
      });
      console.log("[RightPane] ✅ [V1] Rendered", this.cards.length, "old cards");

      // ✨✨✨ NEW V2 - PARALLEL RENDERING ✨✨✨
      // Re-add existing V2 cards (if any)
      this.cardsV2.forEach((cardObject) => {
        this._renderCardV2(cardObject);
      });
      console.log("[RightPane] ✅ [V2] Rendered", this.cardsV2.length, "V2 cards");
    } catch (err) {
      console.error("[RightPane] ❌ draw() failed:", err);
    }
  };

  // ========== OLD V1 METHOD - UNCHANGED ==========
  RightPane.prototype.addCard = function (cardData) {
    console.log("[RightPane] ➕ [V1] addCard() called with data:", cardData);

    try {
      // Store cardData
      this.cards.push(cardData);

      // Render card immediately if container exists
      if (this.cardsContainer) {
        this._renderCard(cardData);
      } else {
        console.warn("[RightPane] ⚠️ [V1] cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] ❌ [V1] addCard() failed:", err);
    }
  };

  // ========== OLD V1 METHOD - UNCHANGED ==========
  RightPane.prototype._renderCard = function (cardData) {
    console.log("[RightPane] 🛠 [V1] _renderCard() called for:", cardData);

    try {
      const card = document.createElement("div");
      card.className = "right-pane-card";
      // OLD: Yellow background to distinguish from V2
      card.style.backgroundColor = "#fffdd7ff";
      card.style.border = "1px solid #ccc";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "4px";

      // Card header
      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = cardData.optionName || "Unnamed Prompt";
      header.style.fontWeight = "bold";
      header.style.marginBottom = "5px";
      card.appendChild(header);

      // V1 badge
      const badge = document.createElement("span");
      badge.textContent = "V1";
      badge.style.fontSize = "10px";
      badge.style.backgroundColor = "#ffc107";
      badge.style.color = "#000";
      badge.style.padding = "2px 6px";
      badge.style.borderRadius = "3px";
      badge.style.marginLeft = "10px";
      header.appendChild(badge);

      // Input field with autocomplete
      const input = document.createElement("input");
      input.className = "right-pane-card-input";
      input.type = "text";
      input.placeholder = "Enter value...";
      input.style.width = "100%";
      input.style.padding = "5px";
      input.style.boxSizing = "border-box";
      card.appendChild(input);

      // Autocomplete logic
      if (this.autocompleteData[cardData.optionName]) {
        console.log(`[RightPane] 🔍 [V1] Setting autocomplete for ${cardData.optionName}`);
        const suggestions = this.autocompleteData[cardData.optionName];

        input.addEventListener("input", () => {
          const val = input.value.toLowerCase();
          const match = suggestions.find((s) => s.toLowerCase().startsWith(val));
          if (match) {
            input.value = match;
          }
        });
      }

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ [V1] Card rendered:", cardData.optionName);
    } catch (err) {
      console.error("[RightPane] ❌ [V1] _renderCard() failed:", err);
    }
  };

  // ✨✨✨ NEW V2 METHOD - START ✨✨✨
  RightPane.prototype.addCardV2 = function (cardData) {
    console.log("[RightPane] ➕ [V2] addCardV2() called!");
    console.log("[RightPane] 📦 [V2] Received cardData:", JSON.stringify(cardData, null, 2));

    try {
      // Check if we have fullConfig
      if (!cardData.fullConfig) {
        console.error("[RightPane] ❌ [V2] cardData.fullConfig is missing! Cannot create V2 card.");
        console.log("[RightPane] ⏩ [V2] Aborting V2 card creation");
        return;
      }

      console.log("[RightPane] ✅ [V2] fullConfig found:", JSON.stringify(cardData.fullConfig, null, 2));

      // Create structured card object
      const cardObject = this._createCardObject(cardData);
      console.log("[RightPane] 🏗 [V2] Card object created:", cardObject);

      // Store card object (not just data)
      this.cardsV2.push(cardObject);
      console.log("[RightPane] 💾 [V2] Card object stored in cardsV2");
      console.log("[RightPane] 📊 [V2] Total V2 cards now:", this.cardsV2.length);

      // Render card immediately if container exists
      if (this.cardsContainer) {
        this._renderCardV2(cardObject);
        console.log("[RightPane] ✅ [V2] Card rendered to DOM");
      } else {
        console.warn("[RightPane] ⚠️ [V2] cardsContainer not initialized, card will render on draw()");
      }
    } catch (err) {
      console.error("[RightPane] ❌ [V2] addCardV2() failed:", err);
    }
  };

  // ✨✨✨ NEW V2 HELPER METHOD ✨✨✨
  RightPane.prototype._createCardObject = function (cardData) {
    console.log("[RightPane] 🏗 [V2] _createCardObject() called");
    console.log("[RightPane] 📦 [V2] Input cardData:", JSON.stringify(cardData, null, 2));

    const config = cardData.fullConfig;
    console.log("[RightPane] 🔍 [V2] Extracting config:", JSON.stringify(config, null, 2));

    const cardObject = {
      config: config, // Store full button config
      domElement: null, // Will be set during render
      inputElement: null, // Will be set during render

      // Method to get parameters from this card
      getParameters: function () {
        console.log("[RightPane] 📋 [V2] Card getParameters() called for:", this.config.label);

        const value = this.inputElement ? this.inputElement.value.trim() : "";
        console.log("[RightPane] 🔍 [V2] Input value:", value);
        console.log("[RightPane] 🔍 [V2] paramName:", this.config.paramName);

        // Only return parameter if we have both a value and a paramName
        if (!value) {
          console.log("[RightPane] ⚠️ [V2] No value entered, returning empty array");
          return [];
        }

        if (!this.config.paramName) {
          console.error("[RightPane] ❌ [V2] paramName missing in config! Cannot create parameter.");
          return [];
        }

        const result = [
          {
            parameter: this.config.paramName, // e.g., "P_Brand"
            values: [{ use: value }], // e.g., [{"use": "Audi"}]
          },
        ];

        console.log("[RightPane] 📤 [V2] Returning parameter:", JSON.stringify(result, null, 2));
        return result;
      },
    };

    console.log("[RightPane] ✅ [V2] Card object structure created");
    console.log("[RightPane] 🔍 [V2] config.label:", config.label);
    console.log("[RightPane] 🔍 [V2] config.paramName:", config.paramName);
    console.log("[RightPane] 🔍 [V2] config.promptName:", config.promptName);
    console.log("[RightPane] 🔍 [V2] config.queryName:", config.queryName);

    return cardObject;
  };

  // ✨✨✨ NEW V2 RENDER METHOD ✨✨✨
  RightPane.prototype._renderCardV2 = function (cardObject) {
    console.log("[RightPane] 🛠 [V2] _renderCardV2() called");
    console.log("[RightPane] 📦 [V2] Card config:", JSON.stringify(cardObject.config, null, 2));

    try {
      const config = cardObject.config;

      // Create card DOM
      const card = document.createElement("div");
      card.className = "right-pane-card-v2";
      // V2: Green background to distinguish from V1
      card.style.backgroundColor = "#d4edda";
      card.style.border = "2px solid #28a745";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "4px";

      // ✨ WIDTH CONSTRAINTS
      card.style.minWidth = "480px";
      card.style.maxWidth = "720px";
      card.style.width = "auto"; // Grows with content
      card.style.boxSizing = "border-box";
      console.log("[RightPane] 📏 [V2] Card width: min=480px, max=720px, auto-grow");

      // Card header
      const header = document.createElement("div");
      header.className = "right-pane-card-header";
      header.textContent = config.label || config.optionName || "Unnamed Prompt";
      header.style.fontWeight = "bold";
      header.style.marginBottom = "5px";
      header.style.wordWrap = "break-word"; // Allow long labels to wrap
      header.style.overflow = "hidden";
      header.style.textOverflow = "ellipsis";
      card.appendChild(header);

      // V2 badge
      const badge = document.createElement("span");
      badge.textContent = "V2";
      badge.style.fontSize = "10px";
      badge.style.backgroundColor = "#28a745";
      badge.style.color = "#fff";
      badge.style.padding = "2px 6px";
      badge.style.borderRadius = "3px";
      badge.style.marginLeft = "10px";
      header.appendChild(badge);

      // Show paramName for debugging
      const paramInfo = document.createElement("div");
      paramInfo.textContent = `Param: ${config.paramName || "MISSING!"}`;
      paramInfo.style.fontSize = "11px";
      paramInfo.style.color = "#666";
      paramInfo.style.marginBottom = "5px";
      card.appendChild(paramInfo);

      // Input field
      const input = document.createElement("input");
      input.className = "right-pane-card-input-v2";
      input.type = "text";
      input.placeholder = "Enter value...";
      input.style.width = "100%";
      input.style.padding = "5px";
      input.style.boxSizing = "border-box";
      input.style.border = "1px solid #28a745";
      input.style.minWidth = "0"; // Allow shrinking if needed
      card.appendChild(input);

      // ✨ Store references on card object
      cardObject.domElement = card;
      cardObject.inputElement = input;
      console.log("[RightPane] 💾 [V2] Stored domElement and inputElement on card object");

      // Input change logging (for debugging)
      input.addEventListener("input", (e) => {
        console.log(`[RightPane] ⌨️ [V2] User typed in "${config.label}":`, e.target.value);
        console.log(`[RightPane] 📏 [V2] Current card width: ${card.domElement.offsetWidth}px`);

        // 🚨 CRITICAL: Notify Cognos that a value changed!
        if (this.m_oControlHost) {
          console.log(`[RightPane] 📢 Notifying Cognos of value change`);
          this.m_oControlHost.valueChanged(); // ← THIS IS KEY!
        } else {
          console.warn(`[RightPane] ⚠️ Cannot notify - no oControlHost stored`);
        }
      });

      this.cardsContainer.appendChild(card);
      console.log("[RightPane] ✅ [V2] Card rendered to DOM:", config.label);
    } catch (err) {
      console.error("[RightPane] ❌ [V2] _renderCardV2() failed:", err);
    }
  };

  // ✨✨✨ NEW V2 PARAMETER COLLECTION METHOD ✨✨✨
  RightPane.prototype.getParameters = function () {
    console.log("[RightPane] 📋 [V2] getParameters() called");
    console.log("[RightPane] 📊 [V2] Total V2 cards to check:", this.cardsV2.length);

    try {
      const allParams = [];

      // Loop through all V2 card objects and collect their parameters
      this.cardsV2.forEach((cardObject, idx) => {
        console.log(`[RightPane] 🔍 [V2] Checking card ${idx}:`, cardObject.config.label);

        const cardParams = cardObject.getParameters();

        if (cardParams && cardParams.length > 0) {
          allParams.push(...cardParams);
          console.log(`[RightPane] ✅ [V2] Card ${idx} returned parameters:`, JSON.stringify(cardParams, null, 2));
        } else {
          console.log(`[RightPane] ⚠️ [V2] Card ${idx} has no parameters (empty input or missing paramName)`);
        }
      });

      console.log("[RightPane] 📤 [V2] Final collected parameters:", JSON.stringify(allParams, null, 2));
      console.log("[RightPane] 📊 [V2] Total parameters collected:", allParams.length);

      return allParams;
    } catch (err) {
      console.error("[RightPane] ❌ [V2] getParameters() failed:", err);
      return [];
    }
  };
  // ✨✨✨ NEW V2 METHODS - END ✨✨✨

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

      // Clear stored cards (both V1 and V2)
      this.cards = [];
      this.cardsV2 = [];
      this.autocompleteData = {};

      console.log("[RightPane] ✅ destroy() complete — cleanup successful");
    } catch (err) {
      console.error("[RightPane] ❌ destroy() failed:", err);
    }
  };

  return RightPane;
});
