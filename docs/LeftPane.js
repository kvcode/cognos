define([], function () {
  "use strict";

  console.log("[LeftPane] === Module Loaded ===");

  function LeftPane() {
    console.log("[LeftPane] 🏗 Constructor called");
    this.domNode = null;
    this.config = null;
    this.groupStates = {}; // Track collapsed/expanded states
  }

  LeftPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[LeftPane] 🔧 initialize() called");

    try {
      // === Create main container ===
      this.domNode = document.createElement("div");
      this.domNode.className = "left-pane-container";
      console.log("[LeftPane] 📦 DOM node created:", this.domNode);

      // === Retrieve configuration from control host ===
      const controlConfig = oControlHost.configuration || {};
      console.log("[LeftPane] ⚙️ Full configuration object received:", controlConfig);

      // Read the buttonGroups property (array)
      this.config = controlConfig.buttonGroups || [];
      console.log("[LeftPane] ✅ buttonGroups loaded:", this.config);

      // Initialize expanded/collapsed states
      this.config.forEach((group, idx) => {
        const label = group.groupLabel || `Group ${idx}`;
        const defaultExpanded = group.defaultExpanded !== false; // default true
        this.groupStates[label] = defaultExpanded;
      });
      console.log("[LeftPane] 🧭 Initialized groupStates:", this.groupStates);

      fnDoneInitializing();
      console.log("[LeftPane] ✅ Initialization complete");
    } catch (err) {
      console.error("[LeftPane] ❌ Error during initialize():", err);
      fnDoneInitializing();
    }
  };

  LeftPane.prototype.draw = function (oControlHost) {
    console.log("[LeftPane] 🖼 draw() called");

    try {
      if (!this.domNode) {
        console.warn("[LeftPane] ⚠️ domNode not initialized, aborting draw");
        return;
      }

      this.domNode.innerHTML = "";
      console.log("[LeftPane] 🧹 Cleared previous DOM content");

      if (!this.config || this.config.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No button groups configured.";
        this.domNode.appendChild(msg);
        console.log("[LeftPane] ⚠️ No button groups found — displayed placeholder message");
      } else {
        this.config.forEach((group, idx) => {
          const label = group.groupLabel || `Group ${idx}`;
          console.log(`[LeftPane] 🔹 Rendering group: ${label}`);

          const groupContainer = document.createElement("div");
          groupContainer.className = "left-pane-group";

          // === Group Header ===
          const header = document.createElement("div");
          header.className = "left-pane-group-header";
          header.style.cursor = "pointer";

          // Optional SVG icon for GROUP (not buttons)
          if (group.groupIcon && typeof group.groupIcon === "string") {
            const iconContainer = document.createElement("span");
            iconContainer.className = "left-pane-group-icon";
            iconContainer.innerHTML = group.groupIcon;
            iconContainer.style.marginRight = "6px";
            header.appendChild(iconContainer);
          }

          // Label text
          const labelSpan = document.createElement("span");
          labelSpan.textContent = label;
          header.appendChild(labelSpan);

          // Expand/collapse arrow
          const arrowSpan = document.createElement("span");
          arrowSpan.style.float = "right";
          arrowSpan.style.fontWeight = "bold";
          arrowSpan.style.userSelect = "none";

          const isExpanded = this.groupStates[label];
          arrowSpan.textContent = isExpanded ? "▲" : "▼";
          header.appendChild(arrowSpan);

          // Toggle group collapse
          header.addEventListener("click", () => {
            this.groupStates[label] = !this.groupStates[label];
            console.log(`[LeftPane] 🔁 Toggled '${label}' → ${this.groupStates[label] ? "expanded" : "collapsed"}`);
            this.draw(oControlHost); // Redraw to refresh display
          });

          groupContainer.appendChild(header);

          // === Buttons ===
          const buttonsContainer = document.createElement("div");
          buttonsContainer.className = "left-pane-buttons-container";

          if (isExpanded) {
            if (Array.isArray(group.buttons) && group.buttons.length > 0) {
              group.buttons.forEach((btn, bIdx) => {
                console.log(`[LeftPane] 🔘 Rendering button [${bIdx}] → ${btn.label}`);

                const button = document.createElement("button");
                button.className = "left-pane-button";
                button.textContent = btn.label || `Button ${bIdx}`;

                // NO ICONS on buttons - just clean text
                // Icons are only for group headers

                buttonsContainer.appendChild(button);
              });
            } else {
              const noBtnMsg = document.createElement("p");
              noBtnMsg.textContent = "No buttons in this group.";
              buttonsContainer.appendChild(noBtnMsg);
              console.log(`[LeftPane] ⚠️ No buttons in group '${label}'`);
            }
          } else {
            console.log(`[LeftPane] ⏸ Group '${label}' collapsed — skipping buttons`);
          }

          groupContainer.appendChild(buttonsContainer);
          this.domNode.appendChild(groupContainer);
        });
      }
    } catch (err) {
      console.error("[LeftPane] ❌ Error during draw():", err);
    }
  };

  LeftPane.prototype.destroy = function () {
    console.log("[LeftPane] 🧨 destroy() called");

    try {
      if (this.domNode && this.domNode.parentNode) {
        this.domNode.parentNode.removeChild(this.domNode);
        console.log("[LeftPane] 🧹 DOM node removed from container");
      } else {
        console.warn("[LeftPane] ⚠️ DOM node not found or already removed");
      }
    } catch (err) {
      console.error("[LeftPane] ❌ Error during destroy():", err);
    }
  };

  return LeftPane;
});
