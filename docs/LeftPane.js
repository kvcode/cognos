define([], function () {
  "use strict";

  function LeftPane() {
    this.domNode = null;
    this.config = null;
    this.presets = null;
    this.groupStates = {};
    this.subgroupStates = {};
    this.locale = "en";
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get Localized Text
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.getLocalizedText = function (config, property) {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    try {
      if (oControlHost.locale) {
        this.locale = oControlHost.locale.substring(0, 2);
        console.log("[LeftPane] 🌍 Detected locale:", this.locale);
      }

      this.domNode = document.createElement("div");
      this.domNode.className = "left-pane-container";

      const controlConfig = oControlHost.configuration || {};

      this.presets = controlConfig.presets || [];
      this.config = controlConfig.buttonGroups || [];

      console.log("[LeftPane] ✅ Presets loaded:", this.presets.length);
      console.log("[LeftPane] ✅ Button groups loaded:", this.config.length);

      // Initialize group states
      this.config.forEach((group, idx) => {
        const label = group.groupLabel || `Group ${idx}`;
        this.groupStates[label] = group.defaultExpanded !== false;

        // Initialize subgroup states from items array
        if (group.items && Array.isArray(group.items)) {
          group.items.forEach((item, itemIdx) => {
            if (item.type === "subgroup") {
              const subLabel = `${label}_${item.subgroupLabel || itemIdx}`;
              this.subgroupStates[subLabel] = item.defaultExpanded !== false;
            }
          });
        }
      });

      fnDoneInitializing();
    } catch (err) {
      console.error("[LeftPane] ❌ Error during initialize():", err);
      fnDoneInitializing();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.draw = function (oControlHost) {
    try {
      if (!this.domNode) {
        console.warn("[LeftPane] ⚠️ domNode not initialized");
        return;
      }

      this.domNode.innerHTML = "";

      // Render presets section
      if (this.presets && this.presets.length > 0) {
        this.renderPresetsSection();
      }

      // Render button groups
      if (!this.config || this.config.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No button groups configured.";
        this.domNode.appendChild(msg);
      } else {
        this.config.forEach((group, idx) => {
          this.renderButtonGroup(group, idx);
        });
      }
    } catch (err) {
      console.error("[LeftPane] ❌ Error during draw():", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER PRESETS SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.renderPresetsSection = function () {
    console.log("[LeftPane] 🎯 Rendering presets section");

    const presetsContainer = document.createElement("div");
    presetsContainer.className = "left-pane-presets-section";
    presetsContainer.style.marginBottom = "20px";
    presetsContainer.style.paddingBottom = "15px";
    presetsContainer.style.borderBottom = "2px solid #00141f";

    if (this.groupStates["__PRESETS__"] === undefined) {
      this.groupStates["__PRESETS__"] = true;
    }

    const header = document.createElement("div");
    header.className = "left-pane-group-header";
    header.style.cursor = "pointer";
    header.title = "Quick-load common parameter combinations";

    const labelSpan = document.createElement("span");
    labelSpan.textContent = "⚡ Presets";
    header.appendChild(labelSpan);

    const arrowSpan = document.createElement("span");
    arrowSpan.className = "group-arrow";
    const isExpanded = this.groupStates["__PRESETS__"];
    arrowSpan.textContent = isExpanded ? "▲" : "▼";
    header.appendChild(arrowSpan);

    header.addEventListener("click", () => {
      this.groupStates["__PRESETS__"] = !this.groupStates["__PRESETS__"];
      const newState = this.groupStates["__PRESETS__"];
      buttonsContainer.style.display = newState ? "flex" : "none";
      arrowSpan.textContent = newState ? "▲" : "▼";
    });

    presetsContainer.appendChild(header);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";
    buttonsContainer.style.marginTop = "8px";

    this.presets.forEach((preset) => {
      const button = document.createElement("button");
      button.className = "left-pane-button left-pane-preset-button";

      const label = this.getLocalizedText(preset, "label");
      button.textContent = label;

      const tooltip = preset.description || this.getLocalizedText(preset, "description");

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      if (tooltip) {
        wrapper.title = tooltip;
      }

      button._presetConfig = preset;

      button.style.backgroundColor = "#8cbee6";
      button.style.fontWeight = "600";

      wrapper.appendChild(button);
      buttonsContainer.appendChild(wrapper);
    });

    buttonsContainer.style.display = isExpanded ? "flex" : "none";
    presetsContainer.appendChild(buttonsContainer);
    this.domNode.appendChild(presetsContainer);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER BUTTON GROUP
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.renderButtonGroup = function (group, idx) {
    const label = group.groupLabel || `Group ${idx}`;

    const groupContainer = document.createElement("div");
    groupContainer.className = "left-pane-group";

    // Header
    const header = document.createElement("div");
    header.className = "left-pane-group-header";
    header.style.cursor = "pointer";

    const groupTooltip = this.getLocalizedText(group, "tooltip") || this.getLocalizedText(group, "description");
    if (groupTooltip) {
      header.title = groupTooltip;
    }

    if (group.groupIcon) {
      const iconContainer = document.createElement("span");
      iconContainer.className = "left-pane-group-icon";
      iconContainer.innerHTML = group.groupIcon;
      header.appendChild(iconContainer);
    }

    const labelSpan = document.createElement("span");
    labelSpan.textContent = this.getLocalizedText(group, "groupLabel") || label;
    header.appendChild(labelSpan);

    const arrowSpan = document.createElement("span");
    arrowSpan.className = "group-arrow";
    const isExpanded = this.groupStates[label];
    arrowSpan.textContent = isExpanded ? "▲" : "▼";
    header.appendChild(arrowSpan);

    header.addEventListener("click", () => {
      this.groupStates[label] = !this.groupStates[label];
      const newState = this.groupStates[label];
      buttonsContainer.style.display = newState ? "flex" : "none";
      arrowSpan.textContent = newState ? "▲" : "▼";
    });

    groupContainer.appendChild(header);

    // Items container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";

    // ✨ NEW: Render items in order from JSON
    if (group.items && Array.isArray(group.items)) {
      group.items.forEach((item, itemIdx) => {
        if (item.type === "subgroup") {
          this.renderSubgroup(item, itemIdx, label, buttonsContainer);
        } else if (item.type === "button") {
          this.renderButton(item, itemIdx, buttonsContainer);
        } else {
          console.warn(`[LeftPane] ⚠️ Unknown item type: ${item.type}`);
        }
      });
    } else {
      console.warn(`[LeftPane] ⚠️ Group "${label}" has no items array`);
    }

    buttonsContainer.style.display = isExpanded ? "flex" : "none";
    groupContainer.appendChild(buttonsContainer);
    this.domNode.appendChild(groupContainer);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.renderButton = function (btn, bIdx, container) {
    const label = this.getLocalizedText(btn, "label") || `Button ${bIdx}`;

    const button = document.createElement("button");
    button.className = "left-pane-button";
    button.textContent = label;

    const tooltip = this.getLocalizedText(btn, "tooltip");

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    if (tooltip) {
      wrapper.title = tooltip;
    }

    button._buttonConfig = btn;

    wrapper.appendChild(button);
    container.appendChild(wrapper);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER SUBGROUP
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.renderSubgroup = function (subgroup, subIdx, parentLabel, container) {
    const subLabel = subgroup.subgroupLabel || `Subgroup ${subIdx}`;
    const stateKey = `${parentLabel}_${subLabel}`;

    // Subgroup header
    const subHeader = document.createElement("div");
    subHeader.className = "left-pane-subgroup-header";
    subHeader.style.cursor = "pointer";
    subHeader.style.padding = "6px 12px";
    subHeader.style.marginTop = "8px";
    subHeader.style.marginBottom = "4px";
    subHeader.style.backgroundColor = "#d0d4d8";
    subHeader.style.borderRadius = "3px";
    subHeader.style.fontWeight = "600";
    subHeader.style.fontSize = "13px";
    subHeader.style.display = "flex";
    subHeader.style.justifyContent = "space-between";

    const subTooltip = this.getLocalizedText(subgroup, "tooltip") || this.getLocalizedText(subgroup, "description");
    if (subTooltip) {
      subHeader.title = subTooltip;
    }

    const subLabelSpan = document.createElement("span");
    subLabelSpan.textContent = this.getLocalizedText(subgroup, "subgroupLabel") || subLabel;
    subHeader.appendChild(subLabelSpan);

    const subArrow = document.createElement("span");
    const isSubExpanded = this.subgroupStates[stateKey];
    subArrow.textContent = isSubExpanded ? "▲" : "▼";
    subHeader.appendChild(subArrow);

    container.appendChild(subHeader);

    // Subgroup buttons
    const subButtonsContainer = document.createElement("div");
    subButtonsContainer.className = "left-pane-subgroup-buttons";
    subButtonsContainer.style.marginLeft = "12px";
    subButtonsContainer.style.paddingRight = "12px";
    subButtonsContainer.style.display = "flex";
    subButtonsContainer.style.flexDirection = "column";
    subButtonsContainer.style.gap = "5px";
    subButtonsContainer.style.boxSizing = "border-box";

    if (subgroup.buttons && Array.isArray(subgroup.buttons)) {
      subgroup.buttons.forEach((btn, bIdx) => {
        this.renderButton(btn, bIdx, subButtonsContainer);
      });
    }

    subButtonsContainer.style.display = isSubExpanded ? "flex" : "none";

    subHeader.addEventListener("click", () => {
      this.subgroupStates[stateKey] = !this.subgroupStates[stateKey];
      const newState = this.subgroupStates[stateKey];
      subButtonsContainer.style.display = newState ? "flex" : "none";
      subArrow.textContent = newState ? "▲" : "▼";
    });

    container.appendChild(subButtonsContainer);
  };

  LeftPane.prototype.destroy = function () {
    if (this.domNode && this.domNode.parentNode) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
  };

  return LeftPane;
});
