define([], function () {
  "use strict";

  console.log("[DragNDrop] === Module Loaded ===");

  function DragNDrop() {
    console.log("[DragNDrop] 🏗 Constructor called");
    this.leftPane = null;
    this.rightPane = null;
    this.isSetup = false;
    this.requiredCardsRendered = false;

    // Mouse drag state
    this.isDragging = false;
    this.dragData = null;
    this.floatingElement = null;
    this.dropZone = null;

    // Bound functions for cleanup
    this.boundMouseMove = null;
    this.boundMouseUp = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[DragNDrop] 🌱 initialize() called");

    try {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.draw = function () {
    console.log("[DragNDrop] 🖼 draw() called");

    try {
      // Store drop zone reference
      this.dropZone = this.rightPane.cardsContainer;
      console.log("[DragNDrop] 📍 Drop zone stored");

      // Setup mouse-based drag handlers
      this.setupDragHandlers();

      // Setup preset button handlers
      this.setupPresetHandlers();

      // Auto-render required cards
      this.renderRequiredCards();

      console.log("[DragNDrop] ✅ draw() complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ Error during draw():", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP DRAG HANDLERS (Mouse-Based)
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.setupDragHandlers = function () {
    console.log("[DragNDrop] 🎯 Setting up mouse-based drag handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      if (this.isSetup) {
        console.warn("[DragNDrop] ⚠️ Already setup, skipping");
        return;
      }

      const buttons = this.leftPane.domNode.querySelectorAll(".left-pane-button:not(.left-pane-preset-button)");
      console.log("[DragNDrop] 📍 Found", buttons.length, "draggable buttons");

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
          const paramNames = button._buttonConfig.paramNames;

          // Check for duplicate
          if (paramName && this.rightPane.hasCard(paramName)) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramName} already exists - skipping`);
            return;
          }
          if (paramNames && (this.rightPane.hasCard(paramNames.from) || this.rightPane.hasCard(paramNames.to))) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramNames.from}/${paramNames.to} already exists - skipping`);
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
          e.preventDefault();
          console.log(`[DragNDrop] 🖱 Mouse down on: ${button.textContent.trim()}`);

          if (button._buttonConfig) {
            console.log("[DragNDrop] ✅ Found stored button config");

            this.dragData = {
              optionName: button.textContent.trim(),
              sourceIndex: idx,
              timestamp: Date.now(),
              fullConfig: button._buttonConfig,
              sourceButton: button,
            };

            console.log("[DragNDrop] 💾 dragData created with fullConfig");
          } else {
            console.warn("[DragNDrop] ⚠️ No _buttonConfig found on button");

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

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP PRESET HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.setupPresetHandlers = function () {
    console.log("[DragNDrop] ⚡ Setting up preset handlers");

    try {
      if (!this.leftPane || !this.leftPane.domNode) {
        console.error("[DragNDrop] ❌ LeftPane domNode not available");
        return;
      }

      const presetButtons = this.leftPane.domNode.querySelectorAll(".left-pane-preset-button");
      console.log("[DragNDrop] 📍 Found", presetButtons.length, "preset buttons");

      presetButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          console.log(`[DragNDrop] ⚡ Preset button clicked: ${button.textContent.trim()}`);

          if (!button._presetConfig) {
            console.warn("[DragNDrop] ⚠️ No _presetConfig found on button");
            return;
          }

          this.applyPreset(button._presetConfig);
        });
      });

      console.log("[DragNDrop] ✅ Preset handlers setup complete");
    } catch (err) {
      console.error("[DragNDrop] ❌ setupPresetHandlers error:", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLY PRESET
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.applyPreset = function (presetConfig) {
    console.log("[DragNDrop] ⚡ Applying preset:", presetConfig.label);
    console.log("[DragNDrop] 📋 Parameters to load:", presetConfig.parameters);

    if (!presetConfig.parameters || !Array.isArray(presetConfig.parameters)) {
      console.warn("[DragNDrop] ⚠️ No parameters array in preset");
      return;
    }

    let cardsCreated = 0;

    presetConfig.parameters.forEach((param) => {
      const paramName = param.paramName;
      console.log(`[DragNDrop] 🔍 Looking for button with paramName: ${paramName}`);

      // Find button config from LeftPane
      const buttonConfig = this.leftPane.findButtonByParamName(paramName);

      if (!buttonConfig) {
        console.warn(`[DragNDrop] ⚠️ Button config not found for: ${paramName}`);
        return;
      }

      // Check for duplicate
      if (this.rightPane.hasCard(paramName)) {
        console.warn(`[DragNDrop] ⚠️ Card already exists for: ${paramName}`);
        return;
      }

      // Find DOM button to disable it
      const domButton = this.leftPane.findDOMButtonByParamName(paramName);

      // Create card
      const cardData = {
        optionName: buttonConfig.label,
        fullConfig: buttonConfig,
        sourceButton: domButton,
      };

      console.log(`[DragNDrop] ➕ Creating card for: ${paramName}`);
      this.rightPane.addCard(cardData);
      cardsCreated++;

      // Disable source button
      if (domButton) {
        domButton.classList.add("disabled");
        console.log(`[DragNDrop] 🎨 Disabled button for: ${paramName}`);
      }
    });

    console.log(`[DragNDrop] ✅ Preset applied - ${cardsCreated} cards created`);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER REQUIRED CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.renderRequiredCards = function () {
    console.log("[DragNDrop] 🔒 Checking for required cards to auto-render");

    if (this.requiredCardsRendered) {
      console.log("[DragNDrop] ⚠️ Required cards already rendered, skipping");
      return;
    }

    try {
      const requiredButtons = this.leftPane.getRequiredButtonConfigs();
      console.log(`[DragNDrop] 📋 Found ${requiredButtons.length} required buttons`);

      requiredButtons.forEach((buttonConfig) => {
        const paramName = buttonConfig.paramName;
        const paramNames = buttonConfig.paramNames;

        // Check for duplicate
        if (paramName && this.rightPane.hasCard(paramName)) {
          console.warn(`[DragNDrop] ⚠️ Required card already exists for: ${paramName}`);
          return;
        }
        if (paramNames && (this.rightPane.hasCard(paramNames.from) || this.rightPane.hasCard(paramNames.to))) {
          console.warn(`[DragNDrop] ⚠️ Required card already exists for: ${paramNames.from}/${paramNames.to}`);
          return;
        }

        // Find DOM button to disable
        const domButton = this.leftPane.findDOMButtonByParamName(paramName || (paramNames && paramNames.from));

        // Create card with isRequired flag
        const cardData = {
          optionName: buttonConfig.label,
          fullConfig: buttonConfig,
          sourceButton: domButton,
          isRequired: true,
        };

        console.log(`[DragNDrop] 🔒 Auto-rendering required card: ${buttonConfig.label}`);
        this.rightPane.addCard(cardData);

        // Disable source button
        if (domButton) {
          domButton.classList.add("disabled");
          console.log(`[DragNDrop] 🎨 Disabled required button: ${buttonConfig.label}`);
        }
      });

      this.requiredCardsRendered = true;
      console.log("[DragNDrop] ✅ Required cards rendered");
    } catch (err) {
      console.error("[DragNDrop] ❌ renderRequiredCards error:", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE FLOATING ELEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.createFloatingElement = function (text, x, y) {
    console.log("[DragNDrop] 🎨 Creating floating element");

    this.floatingElement = document.createElement("div");
    this.floatingElement.className = "drag-floating";
    this.floatingElement.textContent = text;
    this.floatingElement.style.left = x + 10 + "px";
    this.floatingElement.style.top = y + 10 + "px";

    document.body.appendChild(this.floatingElement);
    console.log("[DragNDrop] ✅ Floating element created");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // START DRAG (Track Mouse)
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.startDrag = function () {
    console.log("[DragNDrop] 🚀 Starting drag tracking");
    this.isDragging = true;

    this.boundMouseMove = (e) => {
      if (!this.isDragging) return;

      if (this.floatingElement) {
        this.floatingElement.style.left = e.clientX + 10 + "px";
        this.floatingElement.style.top = e.clientY + 10 + "px";
      }

      this.checkDropZone(e.clientX, e.clientY);
    };

    this.boundMouseUp = (e) => {
      console.log("[DragNDrop] 🖱 Mouse up detected");
      this.endDrag(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);

    console.log("[DragNDrop] ✅ Drag tracking started");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK IF OVER DROP ZONE
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // END DRAG
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.endDrag = function (x, y) {
    console.log("[DragNDrop] 🏁 Ending drag at:", x, y);

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
          const paramNames = this.dragData.fullConfig.paramNames;

          // Check for duplicate
          if (paramName && this.rightPane.hasCard(paramName)) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramName} already exists - skipping`);
            this.cleanup();
            return;
          }
          if (paramNames && (this.rightPane.hasCard(paramNames.from) || this.rightPane.hasCard(paramNames.to))) {
            console.warn(`[DragNDrop] ⚠️ Card with ${paramNames.from}/${paramNames.to} already exists - skipping`);
            this.cleanup();
            return;
          }

          console.log("[DragNDrop] 📞 Calling rightPane.addCard()");
          this.rightPane.addCard(this.dragData);
          console.log("[DragNDrop] ✅ Card added to RightPane");

          // Disable source button
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════════
  DragNDrop.prototype.destroy = function () {
    console.log("[DragNDrop] 🧨 destroy() called");

    try {
      if (this.isDragging) {
        this.cleanup();
      }

      this.leftPane = null;
      this.rightPane = null;
      this.dropZone = null;
      this.isSetup = false;
      this.requiredCardsRendered = false;
      this.isDragging = false;
      this.dragData = null;
      this.floatingElement = null;
      this.boundMouseMove = null;
      this.boundMouseUp = null;

      console.log("[DragNDrop] ✅ Destroyed");
    } catch (err) {
      console.error("[DragNDrop] ❌ destroy error:", err);
    }
  };

  return DragNDrop;
});
