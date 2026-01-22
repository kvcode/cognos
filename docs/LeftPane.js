define([], function () {
  "use strict";

  function LeftPane() {
    this.domNode = null;
    this.config = null;
    this.presets = null;
    this.groupStates = {};
    this.subgroupStates = {};
    this.locale = "en"; // Default locale
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get Localized Text
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.getLocalizedText = function (config, property) {
    const pluralProperty = property + "s"; // e.g., 'labels', 'tooltips'

    // Try locale-specific version first
    if (config[pluralProperty] && typeof config[pluralProperty] === "object") {
      // Current locale
      if (config[pluralProperty][this.locale]) {
        return config[pluralProperty][this.locale];
      }
      // Fallback to English
      if (config[pluralProperty]["en"]) {
        return config[pluralProperty]["en"];
      }
      // First available
      const keys = Object.keys(config[pluralProperty]);
      if (keys.length > 0) {
        return config[pluralProperty][keys[0]];
      }
    }

    // Fallback to singular property
    return config[property] || "";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    try {
      // Detect locale
      if (oControlHost.locale) {
        this.locale = oControlHost.locale.substring(0, 2); // 'de' from 'de-DE'
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

        // Initialize subgroup states
        if (group.subgroups && Array.isArray(group.subgroups)) {
          group.subgroups.forEach((subgroup, subIdx) => {
            const subLabel = `${label}_${subgroup.subgroupLabel || subIdx}`;
            this.subgroupStates[subLabel] = subgroup.defaultExpanded !== false;
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

    // Header
    const header = document.createElement("div");
    header.className = "left-pane-group-header";
    header.style.cursor = "default";
    header.textContent = "⚡ Presets";
    presetsContainer.appendChild(header);

    // Buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";
    buttonsContainer.style.marginTop = "8px";

    this.presets.forEach((preset) => {
      const button = document.createElement("button");
      button.className = "left-pane-button left-pane-preset-button";

      const label = this.getLocalizedText(preset, "label");
      button.textContent = label;

      const tooltip = preset.description || this.getLocalizedText(preset, "description");
      if (tooltip) {
        button.title = tooltip;
      }

      button._presetConfig = preset;

      // Special styling
      button.style.backgroundColor = "#8cbee6";
      button.style.fontWeight = "600";

      buttonsContainer.appendChild(button);
    });

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

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";

    // Main buttons
    if (group.buttons && group.buttons.length > 0) {
      group.buttons.forEach((btn, bIdx) => {
        this.renderButton(btn, bIdx, buttonsContainer);
      });
    }

    // Subgroups
    if (group.subgroups && Array.isArray(group.subgroups)) {
      group.subgroups.forEach((subgroup, subIdx) => {
        this.renderSubgroup(subgroup, subIdx, label, buttonsContainer);
      });
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
    if (tooltip) {
      button.title = tooltip;
    }

    button._buttonConfig = btn;
    container.appendChild(button);
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
    subButtonsContainer.style.marginLeft = "12px";
    subButtonsContainer.style.display = "flex";
    subButtonsContainer.style.flexDirection = "column";
    subButtonsContainer.style.gap = "5px";

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
