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
  // HELPER: Check if item is a subgroup
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.isSubgroup = function (item) {
    // Subgroup is detected by having subgroupLabel or buttons array
    return item.subgroupLabel !== undefined || Array.isArray(item.buttons);
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

      // ✨ Store FULL config (not just presets/buttonGroups)
      this.config = controlConfig;
      this.presets = controlConfig.presets || [];
      this.buttonGroups = controlConfig.buttonGroups || [];

      console.log("[LeftPane] ✅ Presets loaded:", this.presets.length);
      console.log("[LeftPane] ✅ Button groups loaded:", this.buttonGroups.length);

      // Initialize group states
      this.buttonGroups.forEach((group, idx) => {
        const label = group.groupLabel || `Group ${idx}`;
        this.groupStates[label] = group.defaultExpanded !== false;

        if (group.groupItems && Array.isArray(group.groupItems)) {
          group.groupItems.forEach((item, itemIdx) => {
            if (this.isSubgroup(item)) {
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
      if (!this.buttonGroups || this.buttonGroups.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No button groups configured.";
        this.domNode.appendChild(msg);
      } else {
        this.buttonGroups.forEach((group, idx) => {
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

    if (this.groupStates["__PRESETS__"] === undefined) {
      this.groupStates["__PRESETS__"] = true;
    }

    const header = document.createElement("div");
    header.className = "left-pane-group-header";
    header.title = "Quick-load common parameter combinations";

    const labelSpan = document.createElement("span");

    // ✨ NEW: Use configurable label instead of hardcoded "⚡ Presets"
    const presetLabel = this.getLocalizedText(this.config, "presetsLabel") || "Presets";
    labelSpan.textContent = `⚡ ${presetLabel}`;

    header.appendChild(labelSpan);

    const arrowSpan = document.createElement("span");
    arrowSpan.className = "group-arrow";
    const isExpanded = this.groupStates["__PRESETS__"];
    arrowSpan.textContent = isExpanded ? "▲" : "▼";
    header.appendChild(arrowSpan);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";

    header.addEventListener("click", () => {
      this.groupStates["__PRESETS__"] = !this.groupStates["__PRESETS__"];
      const newState = this.groupStates["__PRESETS__"];
      buttonsContainer.style.display = newState ? "flex" : "none";
      arrowSpan.textContent = newState ? "▲" : "▼";
    });

    presetsContainer.appendChild(header);

    this.presets.forEach((preset) => {
      const wrapper = document.createElement("div");

      const button = document.createElement("button");
      button.className = "left-pane-button left-pane-preset-button";

      const label = this.getLocalizedText(preset, "label");
      button.textContent = label;

      const tooltip = preset.description || this.getLocalizedText(preset, "description");
      if (tooltip) {
        wrapper.title = tooltip;
      }

      button._presetConfig = preset;

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

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "left-pane-buttons-container";

    header.addEventListener("click", () => {
      this.groupStates[label] = !this.groupStates[label];
      const newState = this.groupStates[label];
      buttonsContainer.style.display = newState ? "flex" : "none";
      arrowSpan.textContent = newState ? "▲" : "▼";
    });

    groupContainer.appendChild(header);

    // Render groupItems in order from JSON
    if (group.groupItems && Array.isArray(group.groupItems)) {
      group.groupItems.forEach((item, itemIdx) => {
        if (this.isSubgroup(item)) {
          // Has subgroupLabel or buttons array → render as subgroup
          this.renderSubgroup(item, itemIdx, label, buttonsContainer);
        } else {
          // Everything else → render as button
          this.renderButton(item, itemIdx, buttonsContainer);
        }
      });
    } else {
      console.warn(`[LeftPane] ⚠️ Group "${label}" has no groupItems array`);
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

    const wrapper = document.createElement("div");

    const button = document.createElement("button");
    button.className = "left-pane-button";
    button.textContent = label;

    const tooltip = this.getLocalizedText(btn, "tooltip");
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

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get all button configs (flattened)
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.getAllButtonConfigs = function () {
    const allButtons = [];

    if (!this.buttonGroups) return allButtons;

    this.buttonGroups.forEach((group) => {
      if (group.groupItems && Array.isArray(group.groupItems)) {
        group.groupItems.forEach((item) => {
          if (this.isSubgroup(item)) {
            if (item.buttons && Array.isArray(item.buttons)) {
              allButtons.push(...item.buttons);
            }
          } else {
            allButtons.push(item);
          }
        });
      }
    });

    return allButtons;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get required button configs
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.getRequiredButtonConfigs = function () {
    return this.getAllButtonConfigs().filter((btn) => btn.required === true);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Find button config by paramName
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.findButtonByParamName = function (paramName) {
    const allButtons = this.getAllButtonConfigs();

    // Check single paramName
    let found = allButtons.find((btn) => btn.paramName === paramName);
    if (found) return found;

    // Check paramNames (for dateFromTo type)
    found = allButtons.find(
      (btn) => btn.paramNames && (btn.paramNames.from === paramName || btn.paramNames.to === paramName),
    );

    return found || null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Find DOM button by paramName
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.findDOMButtonByParamName = function (paramName) {
    if (!this.domNode) return null;

    const buttons = this.domNode.querySelectorAll(".left-pane-button");

    for (const btn of buttons) {
      if (btn._buttonConfig) {
        // Check single paramName
        if (btn._buttonConfig.paramName === paramName) {
          return btn;
        }
        // Check paramNames (for dateFromTo type)
        if (btn._buttonConfig.paramNames) {
          if (btn._buttonConfig.paramNames.from === paramName || btn._buttonConfig.paramNames.to === paramName) {
            return btn;
          }
        }
      }
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════════
  LeftPane.prototype.destroy = function () {
    if (this.domNode && this.domNode.parentNode) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
  };

  return LeftPane;
});
