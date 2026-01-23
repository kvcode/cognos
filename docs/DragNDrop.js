define([], function () {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.isSetup = false;

    // Mouse drag state
    this.isDragging = false;
    this.dragData = null;
    this.floatingElement = null;
    this.dropZone = null;

    // Bound functions for cleanup
    this.boundMouseMove = null;
    this.boundMouseUp = null;

    // Track if required cards have been rendered
    this.requiredCardsRendered = false;
  }

  // === Initialization ===
  DragNDrop.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[DragNDrop] 🌱 initialize() called");

    try {
      // Validate panes
      if (!this.leftPane || !this.rightPane) {
        console.error("[DragNDrop] ❌ LeftPane or RightPane missing");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      if (!this.rightPane.cardsContainer) {
        console.error("[DragNDrop] ❌ RightPane cardsContainer missing");
        if (fnDoneInitializing) fnDoneInitializing();
        return;
      }

      console.log("[DragNDrop] ✅ Both panes validated");
      console.log("[DragNDrop] ✅ Initialization complete (handlers will be set in draw())");

      if (fnDoneInitializing) {
        fnDoneInitializing();
      }
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during initialization:", err);
      if (fnDoneInitializing) fnDoneInitializing();
    }
  };

  // === Draw ===
  DragNDrop.prototype.draw = function () {
    console.log("[DragNDrop] 🖼 draw() called");

    try {
      // Store drop zone reference
      this.dropZone = this.rightPane.cardsContainer;
      console.log("[DragNDrop] 📍 Drop zone stored");

      // Setup mouse-based drag handlers for regular buttons
      this.setupDragHandlers();

      // Setup preset button handlers
      this.setupPresetHandlers();

      // Auto-render required cards (only once)
      if (!this.requiredCardsRendered) {
        this.renderRequiredCards();
        this.requiredCardsRendered = true;
      }

      console.log("[DragNDrop] ✅ draw() complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during draw():", err);
    }
  };

  // === Setup Preset Handlers ===
  DragNDrop.prototype.setupPresetHandlers = function () {
    console.log("[DragNDrop] ⚡ Setting up preset handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available for presets");
        return;
      }

      const presetButtons = this.leftPane.domNode.querySelectorAll(".left-pane-preset-button");
      console.log("[DragNDrop] 📍 Found", presetButtons.length, "preset buttons");

      if (presetButtons.length === 0) {
        console.log("[DragNDrop] ℹ️ No preset buttons to setup");
        return;
      }

      presetButtons.forEach((button, idx) => {
        // Single click handler for presets
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`[DragNDrop] ⚡ Preset clicked: ${button.textContent.trim()}`);

          if (!button._presetConfig) {
            console.warn("[DragNDrop] ⚠️ No _presetConfig found on preset button");
            return;
          }

          this.applyPreset(button._presetConfig);
        });

        // Also support double-click for consistency
        button.addEventListener("dblclick", (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Single click already handles it
        });
      });

      console.log("[DragNDrop] ✅ Preset handlers setup complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupPresetHandlers error:", err);
    }
  };

  // === Apply Preset ===
  DragNDrop.prototype.applyPreset = function (presetConfig) {
    console.log("[DragNDrop] ⚡ applyPreset() called");
    console.log("[DragNDrop] 📦 Preset config:", JSON.stringify(presetConfig, null, 2));

    if (!presetConfig.parameters || !Array.isArray(presetConfig.parameters)) {
      console.warn("[DragNDrop] ⚠️ Preset has no parameters array");
      return;
    }

    let cardsCreated = 0;

    presetConfig.parameters.forEach((paramDef) => {
      const paramName = paramDef.paramName;
      console.log(`[DragNDrop] 🔍 Processing preset parameter: ${paramName}`);

      // Check if card already exists
      if (this.rightPane.hasCard(paramName)) {
        console.log(`[DragNDrop] ℹ️ Card for ${paramName} already exists - skipping`);
        return;
      }

      // Find the button config
      const buttonConfig = this.leftPane.findButtonByParamName(paramName);
      if (!buttonConfig) {
        console.warn(`[DragNDrop] ⚠️ No button config found for ${paramName}`);
        return;
      }

      // Create the card
      const dragData = {
        optionName: buttonConfig.label,
        timestamp: Date.now(),
        fullConfig: buttonConfig,
        sourceButton: this.leftPane.findDOMButtonByParamName(paramName),
        isFromPreset: true,
      };

      console.log(`[DragNDrop] 📞 Creating card for ${paramName}`);
      this.rightPane.addCard(dragData);
      cardsCreated++;

      // Disable the source button
      if (dragData.sourceButton) {
        dragData.sourceButton.classList.add("disabled");
        console.log(`[DragNDrop] 🎨 Disabled source button for ${paramName}`);
      }

      // If preset has pre-defined values, apply them
      if (paramDef.values && Array.isArray(paramDef.values)) {
        console.log(`[DragNDrop] 📝 Preset has pre-defined values for ${paramName}`);
        // TODO: Apply pre-defined values to the card's bubbles
        // This would require accessing the newly created card and adding bubbles
      }
    });

    console.log(`[DragNDrop] ✅ Preset applied - ${cardsCreated} cards created`);
  };

  // === Render Required Cards ===
  DragNDrop.prototype.renderRequiredCards = function () {
    console.log("[DragNDrop] ⭐ renderRequiredCards() called");

    try {
      if (!this.leftPane || typeof this.leftPane.getRequiredButtonConfigs !== "function") {
        console.warn("[DragNDrop] ⚠️ LeftPane.getRequiredButtonConfigs not available");
        return;
      }

      const requiredButtons = this.leftPane.getRequiredButtonConfigs();
      console.log(`[DragNDrop] ⭐ Found ${requiredButtons.length} required buttons`);

      if (requiredButtons.length === 0) {
        console.log("[DragNDrop] ℹ️ No required buttons to auto-render");
        return;
      }

      let cardsCreated = 0;

      requiredButtons.forEach((buttonConfig) => {
        const paramName = buttonConfig.paramName;
        console.log(`[DragNDrop] ⭐ Processing required parameter: ${paramName}`);

        // Check if card already exists
        if (this.rightPane.hasCard(paramName)) {
          console.log(`[DragNDrop] ℹ️ Required card for ${paramName} already exists`);
          return;
        }

        // Create the card
        const dragData = {
          optionName: buttonConfig.label,
          timestamp: Date.now(),
          fullConfig: buttonConfig,
          sourceButton: this.leftPane.findDOMButtonByParamName(paramName),
          isRequired: true,
        };

        console.log(`[DragNDrop] ⭐ Auto-creating required card for ${paramName}`);
        this.rightPane.addCard(dragData);
        cardsCreated++;

        // Disable the source button
        if (dragData.sourceButton) {
          dragData.sourceButton.classList.add("disabled");
          console.log(`[DragNDrop] 🎨 Disabled source button for required ${paramName}`);
        }
      });

      console.log(`[DragNDrop] ✅ Required cards rendered - ${cardsCreated} cards created`);
    } catch (err) {
      console.error("[DragNDrop] ❌ renderRequiredCards error:", err);
    }
  };

  // === Setup Drag Handlers (Mouse-Based) ===
  DragNDrop.prototype.setupDragHandlers = function () {
    console.log("[DragNDrop] 🎯 Setting up mouse-based drag handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      // Check if already setup
      if (this.isSetup) {
        console.warn("[DragNDrop] ⚠️ Already setup, skipping");
        return;
      }

      // Get all buttons EXCEPT preset buttons
      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button:not(.left-pane-preset-button)");
      console.log("[DragNDrop] 📍 Found", buttons.length, "regular buttons");

      if (buttons.length === 0) {
        console.warn("[DragNDrop] ⚠️ No buttons found");
        return;
      }

      buttons.forEach((button, idx) => {
        button.style.cursor = "grab";

        // Double-click handler
        button.addEventListener("dblclick", (e) => {
          e.preventDefault();
          console.log(`[DragNDrop] 🖱️🖱️ Double-click on: ${button.textContent.trim()}`);

          if (!button._buttonConfig) {
            console.warn("[DragNDrop] ⚠️ No _buttonConfig found on button");
            return;
          }

          const paramName = button._buttonConfig.paramName;

          if (this.rightPane.hasCard(paramName)) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramName} already exists - skipping`);
            return;
          }

          const dragData = {
            optionName: button.textContent.trim(),
            sourceIndex: idx,
            timestamp: Date.now(),
            fullConfig: button._buttonConfig,
            sourceButton: button,
          };

          console.log("[DragNDrop] 📞 Calling rightPane.addCard() from double-click");
          this.rightPane.addCard(dragData);
          console.log("[DragNDrop] ✅ Card added via double-click");

          button.classList.add("disabled");
          console.log("[DragNDrop] 🎨 Disabled source button");
        });

        // Mouse down - start drag
        button.addEventListener("mousedown", (e) => {
          e.preventDefault(); // Prevent text selection
          console.log(`[DragNDrop] 🖱 Mouse down on: ${button.textContent.trim()}`);

          // Check for stored button config
          if (button._buttonConfig) {
            console.log("[DragNDrop] ✅ Found stored button config");

            // Create dragData with full config
            this.dragData = {
              optionName: button.textContent.trim(),
              sourceIndex: idx,
              timestamp: Date.now(),
              fullConfig: button._buttonConfig,
              sourceButton: button,
            };

            console.log("[DragNDrop] 💾 dragData created with fullConfig");
            console.log("[DragNDrop] 💾 paramName:", button._buttonConfig.paramName);
            console.log("[DragNDrop] 💾 label:", button._buttonConfig.label);
          } else {
            console.warn("[DragNDrop] ⚠️ No _buttonConfig found on button");

            // Fallback without fullConfig
            this.dragData = {
              optionName: button.textContent.trim(),
              sourceIndex: idx,
              timestamp: Date.now(),
              sourceButton: button,
            };
          }

          // Create floating element
          this.createFloatingElement(button.textContent.trim(), e.clientX, e.clientY);

          // Visual feedback on source button
          button.style.opacity = "0.5";

          // Start tracking mouse movement
          this.startDrag();

          console.log("[DragNDrop] 🚀 Drag started");
        });
      });

      this.isSetup = true;
      console.log("[DragNDrop] ✅ Mouse drag handlers complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupDragHandlers error:", err);
    }
  };

  // === Create Floating Element ===
  DragNDrop.prototype.createFloatingElement = function (text, x, y) {
    console.log("[DragNDrop] 🎨 Creating floating element");

    // Create floating div
    this.floatingElement = document.createElement("div");
    this.floatingElement.className = "drag-floating";
    this.floatingElement.textContent = text;
    this.floatingElement.style.left = x + 10 + "px"; // Offset from cursor
    this.floatingElement.style.top = y + 10 + "px";

    document.body.appendChild(this.floatingElement);
    console.log("[DragNDrop] ✅ Floating element created");
  };

  // === Start Drag (Track Mouse) ===
  DragNDrop.prototype.startDrag = function () {
    console.log("[DragNDrop] 🚀 Starting drag tracking");
    this.isDragging = true;

    // Mouse move handler
    this.boundMouseMove = (e) => {
      if (!this.isDragging) return;

      // Update floating element position
      if (this.floatingElement) {
        this.floatingElement.style.left = e.clientX + 10 + "px";
        this.floatingElement.style.top = e.clientY + 10 + "px";
      }

      // Check if over drop zone
      this.checkDropZone(e.clientX, e.clientY);
    };

    // Mouse up handler
    this.boundMouseUp = (e) => {
      console.log("[DragNDrop] 🖱 Mouse up detected");
      this.endDrag(e.clientX, e.clientY);
    };

    // Attach to document (so we track everywhere)
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);

    console.log("[DragNDrop] ✅ Drag tracking started");
  };

  // === Check if Over Drop Zone ===
  DragNDrop.prototype.checkDropZone = function (x, y) {
    if (!this.dropZone) return;

    const rect = this.dropZone.getBoundingClientRect();
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (isOver) {
      this.dropZone.classList.add("drop-hover");
    } else {
      this.dropZone.classList.remove("drop-hover");
    }
  };

  // === End Drag ===
  DragNDrop.prototype.endDrag = function (x, y) {
    console.log("[DragNDrop] 🏁 Ending drag at:", x, y);

    // Check if over drop zone
    if (!this.dropZone) {
      console.warn("[DragNDrop] ⚠️ No drop zone available");
      this.cleanup();
      return;
    }

    const rect = this.dropZone.getBoundingClientRect();
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    console.log("[DragNDrop] 📍 Is over drop zone:", isOver);

    if (isOver) {
      console.log("[DragNDrop] ✅ Dropped over target!");

      if (this.rightPane && typeof this.rightPane.addCard === "function") {
        if (this.dragData.fullConfig) {
          const paramName = this.dragData.fullConfig.paramName;

          // Check for duplicate
          if (this.rightPane.hasCard(paramName)) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramName} already exists - skipping`);
            this.cleanup();
            return;
          }

          console.log("[DragNDrop] 📞 Calling rightPane.addCard()");
          this.rightPane.addCard(this.dragData);
          console.log("[DragNDrop] ✅ Card added to RightPane");

          // Grey out source button
          if (this.dragData.sourceButton) {
            this.dragData.sourceButton.classList.add("disabled");
            console.log("[DragNDrop] 🎨 Disabled source button with CSS class");
          }
        } else {
          console.warn("[DragNDrop] ⚠️ dragData.fullConfig missing, cannot create card");
        }
      } else {
        console.error("[DragNDrop] ❌ RightPane.addCard() not available");
      }
    }

    this.cleanup();
  };

  // === Cleanup ===
  DragNDrop.prototype.cleanup = function () {
    console.log("[DragNDrop] 🧹 Cleaning up drag operation");

    // Remove floating element
    if (this.floatingElement && this.floatingElement.parentNode) {
      document.body.removeChild(this.floatingElement);
      this.floatingElement = null;
    }

    // Remove drop zone highlight
    if (this.dropZone) {
      this.dropZone.classList.remove("drop-hover");
    }

    // Reset button opacity
    if (this.leftPane && this.leftPane.domNode) {
      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button");
      buttons.forEach((btn) => {
        btn.style.opacity = "1";
      });
    }

    // Remove event listeners
    if (this.boundMouseMove) {
      document.removeEventListener("mousemove", this.boundMouseMove);
      this.boundMouseMove = null;
    }
    if (this.boundMouseUp) {
      document.removeEventListener("mouseup", this.boundMouseUp);
      this.boundMouseUp = null;
    }

    // Reset state
    this.isDragging = false;
    this.dragData = null;

    console.log("[DragNDrop] ✅ Cleanup complete");
  };

  // === Destroy ===
  DragNDrop.prototype.destroy = function () {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      // Clean up any active drag
      if (this.isDragging) {
        this.cleanup();
      }

      // Reset everything
      this.leftPane = null;
      this.rightPane = null;
      this.dropZone = null;
      this.isSetup = false;
      this.isDragging = false;
      this.dragData = null;
      this.floatingElement = null;
      this.boundMouseMove = null;
      this.boundMouseUp = null;
      this.requiredCardsRendered = false;

      console.log("[DragNDrop] ✅ Destroyed");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy error:", err);
    }
  };

  return DragNDrop;
});
