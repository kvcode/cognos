define([], function () {
  "use strict";

  console.log("[CustomPromptPage] === Module Loaded ===");

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════
  function CustomPromptPage() {
    console.log("[CustomPromptPage] 🏗 Constructor called");
    this.domNode = null;
    this.leftPane = null;
    this.rightPane = null;
    this.dragDrop = null;
    this.m_oControlHost = null; // Store for later use
    this.registeredParams = {}; // ✅ NEW: Store parameter objects by name

    // ❌ DO NOT BIND HERE - it breaks the oControlHost parameter signature!
    // Cognos needs to pass oControlHost as first parameter
    // The methods are on the prototype, 'this' will work fine when called
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.initialize = function (oControlHost, fnDoneInitializing) {
    console.log("[CustomPromptPage] 🔧 initialize() called");
    console.log("[CustomPromptPage] 🔍 oControlHost:", oControlHost);

    try {
      // Create main container
      this.domNode = document.createElement("div");
      this.domNode.className = "custom-prompt-page-container";
      console.log("[CustomPromptPage] 📦 DOM node created:", this.domNode);

      // Read config
      const config = oControlHost.configuration || {};
      console.log("[CustomPromptPage] ⚙️ Raw configuration received:", config);
      console.log("[CustomPromptPage] 🔍 buttonGroups:", config.buttonGroups);

      const basePaths = config.BaseScriptPaths || {};
      const fallbackBase = config.BaseScriptPath || "/cognos4/samples/javascript/CustomPromptPage/";
      console.log("[CustomPromptPage] 🧩 BaseScriptPaths detected:", basePaths);
      console.log("[CustomPromptPage] 🧩 Fallback BaseScriptPath:", fallbackBase);

      // Determine final paths
      const LeftPanePath = basePaths.LeftPane || fallbackBase + "LeftPane.js";
      const RightPanePath = basePaths.RightPane || fallbackBase + "RightPane.js";
      const DragDropPath = basePaths.DragDrop || fallbackBase + "DragNDrop.js";

      console.log("[CustomPromptPage] ✅ Computed module paths:", {
        LeftPanePath,
        RightPanePath,
        DragDropPath,
      });

      // --- Load LeftPane first
      console.log(`[CustomPromptPage] 🚀 Loading LeftPane from: ${LeftPanePath}`);
      require([LeftPanePath], (LeftPane) => {
        console.log(`[CustomPromptPage] ✅ LeftPane loaded from: ${LeftPanePath}`);

        this.leftPane = new LeftPane();
        console.log("[CustomPromptPage] 🧱 LeftPane instance created");

        this.leftPane.initialize(oControlHost, () => {
          console.log("[CustomPromptPage] ✅ LeftPane initialized");

          // --- Now load RightPane
          console.log(`[CustomPromptPage] 🚀 Loading RightPane from: ${RightPanePath}`);
          require([RightPanePath], (RightPane) => {
            console.log(`[CustomPromptPage] ✅ RightPane loaded from: ${RightPanePath}`);

            this.rightPane = new RightPane();
            console.log("[CustomPromptPage] 🧱 RightPane instance created");

            this.rightPane.initialize(oControlHost, () => {
              console.log("[CustomPromptPage] ✅ RightPane initialized");

              // --- Now load DragDrop with BOTH panes ready
              console.log(`[CustomPromptPage] 🚀 Loading DragDrop from: ${DragDropPath}`);
              require([DragDropPath], (DragDrop) => {
                console.log(`[CustomPromptPage] ✅ DragDrop loaded from: ${DragDropPath}`);

                this.dragDrop = new DragDrop();
                console.log("[CustomPromptPage] 🧱 DragDrop instance created");

                // CRITICAL: Set the panes BEFORE initializing
                this.dragDrop.leftPane = this.leftPane;
                this.dragDrop.rightPane = this.rightPane;
                console.log("[CustomPromptPage] 🔗 Panes assigned to DragDrop");

                this.dragDrop.initialize(oControlHost, () => {
                  console.log("[CustomPromptPage] ✅ DragDrop initialized");
                  console.log("[CustomPromptPage] ✅ All modules loaded successfully");

                  fnDoneInitializing();
                });
              }, (err) => {
                console.warn("[CustomPromptPage] ⚠️ DragDrop failed to load:", err);
                fnDoneInitializing();
              });
            });
          }, (err) => {
            console.error("[CustomPromptPage] ❌ RightPane failed to load:", err);
            fnDoneInitializing();
          });
        });
      }, (err) => {
        console.error("[CustomPromptPage] ❌ LeftPane failed to load:", err);
        fnDoneInitializing();
      });
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Fatal error during initialize():", err);
      fnDoneInitializing();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.draw = function (oControlHost) {
    console.log("[CustomPromptPage] 🖼 draw() called");

    try {
      // ✨ CRITICAL: Store oControlHost for later use
      this.m_oControlHost = oControlHost;
      console.log("[CustomPromptPage] 💾 Stored oControlHost");

      // ✨ Try to detect which parameters this control manages
      const config = oControlHost.configuration || {};
      console.log("[CustomPromptPage] 🔍 Checking for parameters in buttonGroups...");

      if (config.buttonGroups && Array.isArray(config.buttonGroups)) {
        const allParamNames = new Set();

        config.buttonGroups.forEach((group, gIdx) => {
          if (group.buttons && Array.isArray(group.buttons)) {
            group.buttons.forEach((btn, bIdx) => {
              if (btn.paramName) {
                allParamNames.add(btn.paramName);
                console.log(`[CustomPromptPage] 📋 Found parameter: ${btn.paramName} (${btn.label})`);
              }
            });
          }
        });

        console.log("[CustomPromptPage] 📋 Total unique parameters found:", allParamNames.size);
        console.log("[CustomPromptPage] 📋 Parameter names:", Array.from(allParamNames));

        // ✅ FIX: Try to register each parameter with Cognos AND STORE THE OBJECTS
        this.registeredParams = {}; // Clear previous

        allParamNames.forEach((paramName) => {
          try {
            // ✅ FIX: Use oControlHost.page.getParameter() not oControlHost.getParameter()
            const oParameter = oControlHost.page.getParameter(paramName);

            if (oParameter) {
              // ✅ FIX: STORE the parameter object for later use
              this.registeredParams[paramName] = oParameter;

              console.log(`[CustomPromptPage] ✅ Parameter ${paramName} registered with Cognos`);
              console.log(`[CustomPromptPage] 🔍 Parameter object:`, oParameter);
              console.log(`[CustomPromptPage] 💾 Stored parameter object for: ${paramName}`);
            } else {
              console.warn(`[CustomPromptPage] ⚠️ Parameter ${paramName} returned null - might not exist in report`);
            }
          } catch (e) {
            console.error(`[CustomPromptPage] ❌ Error registering parameter ${paramName}:`, e.message);
          }
        });

        console.log(`[CustomPromptPage] 📊 Total stored parameters: ${Object.keys(this.registeredParams).length}`);
      } else {
        console.warn("[CustomPromptPage] ⚠️ No buttonGroups found in configuration");
      }

      if (!this.domNode) {
        console.warn("[CustomPromptPage] ⚠️ domNode not initialized, aborting draw");
        return;
      }

      this.domNode.innerHTML = "";
      console.log("[CustomPromptPage] 🧹 Cleared previous DOM content");

      const layout = document.createElement("div");
      layout.className = "custom-prompt-layout";
      layout.style.display = "flex";
      layout.style.width = "100%";
      layout.style.height = "100%";

      if (this.leftPane && this.leftPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing LeftPane...");
        this.leftPane.draw(oControlHost);
        layout.appendChild(this.leftPane.domNode);
      }

      if (this.rightPane && this.rightPane.domNode) {
        console.log("[CustomPromptPage] 🧩 Drawing RightPane...");
        this.rightPane.draw(oControlHost);
        layout.appendChild(this.rightPane.domNode);
      }

      this.domNode.appendChild(layout);
      oControlHost.container.appendChild(this.domNode);
      console.log("[CustomPromptPage] ✅ Layout rendered successfully");

      // Setup DragDrop handlers after panes are drawn
      if (this.dragDrop && typeof this.dragDrop.draw === "function") {
        console.log("[CustomPromptPage] 🔗 Setting up DragDrop handlers");
        this.dragDrop.draw();
      }

      // 🔍 Final verification
      console.log("[CustomPromptPage] 🔍 VERIFICATION after draw() complete:");
      console.log("[CustomPromptPage] 🔍   this.rightPane exists:", !!this.rightPane);
      console.log(
        "[CustomPromptPage] 🔍   this.rightPane.getParameters exists:",
        !!(this.rightPane && typeof this.rightPane.getParameters === "function")
      );
      console.log("[CustomPromptPage] 🔍   Registered params count:", Object.keys(this.registeredParams).length);
      console.log("[CustomPromptPage] 🔍   oControlHost.control:", oControlHost.control);
      console.log(
        "[CustomPromptPage] 🔍   typeof oControlHost.control.getParameters:",
        typeof oControlHost.control.getParameters
      );
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during draw():", err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GET PARAMETERS (Called by Cognos on FINISH button)
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.getParameters = function (oControlHost) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[CustomPromptPage] 🚨🚨🚨 COGNOS CALLED getParameters()!!! 🚨🚨🚨");
    console.log("[CustomPromptPage] 📋 Timestamp:", new Date().toISOString());

    // Log what we received
    console.log("[CustomPromptPage] 🔍 oControlHost received:", oControlHost);
    console.log("[CustomPromptPage] 🔍 oControlHost type:", typeof oControlHost);

    if (oControlHost) {
      console.log("[CustomPromptPage] ✅ oControlHost exists");
    } else {
      console.warn("[CustomPromptPage] ⚠️ oControlHost is null/undefined - using stored m_oControlHost");
      oControlHost = this.m_oControlHost;
    }

    // Check our state
    console.log("[CustomPromptPage] 🔍 Checking internal state...");
    console.log("[CustomPromptPage] 🔍 this.rightPane exists:", !!this.rightPane);
    console.log("[CustomPromptPage] 🔍 this.registeredParams count:", Object.keys(this.registeredParams).length);
    console.log(
      "[CustomPromptPage] 🔍 this.rightPane.getParameters exists:",
      !!(this.rightPane && typeof this.rightPane.getParameters === "function")
    );

    try {
      if (!this.rightPane || typeof this.rightPane.getParameters !== "function") {
        console.error("[CustomPromptPage] ❌ RightPane not available or missing getParameters()");
        console.log("[CustomPromptPage] 📤 RETURNING null to Cognos");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return null;
      }

      console.log("[CustomPromptPage] ✅ RightPane found with getParameters() method");
      console.log("[CustomPromptPage] 📞 Calling this.rightPane.getParameters()...");

      // ✅ Get card data from RightPane (returns array with parameter NAMES)
      const cardData = this.rightPane.getParameters();

      console.log("[CustomPromptPage] 📦 Card data received from RightPane");
      console.log("[CustomPromptPage] 📦 Return type:", typeof cardData);
      console.log("[CustomPromptPage] 📦 Is array:", Array.isArray(cardData));
      console.log("[CustomPromptPage] 📦 Count:", cardData ? cardData.length : 0);
      console.log("[CustomPromptPage] 📦 Raw data:", JSON.stringify(cardData, null, 2));

      if (!cardData || !Array.isArray(cardData) || cardData.length === 0) {
        console.warn("[CustomPromptPage] ⚠️ No card data returned");
        console.log("[CustomPromptPage] 📤 RETURNING null to Cognos");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return null;
      }

      // ✅ FIX: Convert card data to Cognos format using stored parameter objects
      const cognosParams = [];

      cardData.forEach((card, idx) => {
        console.log(`[CustomPromptPage] 🔍 Processing card ${idx}:`, card);

        const paramName = card.parameter; // This is just a STRING like "P_Brand"
        const paramValues = card.values;

        console.log(`[CustomPromptPage] 🔍   Parameter name: ${paramName}`);
        console.log(`[CustomPromptPage] 🔍   Values:`, paramValues);

        // ✅ Look up the actual Cognos parameter object
        const paramObject = this.registeredParams[paramName];

        if (!paramObject) {
          console.error(`[CustomPromptPage] ❌ Parameter object not found for: ${paramName}`);
          console.log(`[CustomPromptPage] 🔍 Available registered params:`, Object.keys(this.registeredParams));
          return; // Skip this parameter
        }

        console.log(`[CustomPromptPage] ✅ Found parameter object for: ${paramName}`);

        // ✅ Build Cognos-compatible parameter entry
        const cognosParam = {
          parameter: paramObject, // ← The actual Cognos parameter object!
          values: paramValues, // ← The values from the card
        };

        cognosParams.push(cognosParam);
        console.log(`[CustomPromptPage] ✅ Added Cognos parameter:`, {
          paramName: paramName,
          paramObject: "<<ParameterObject>>",
          values: paramValues,
        });
      });

      console.log("[CustomPromptPage] 🎯 ==========================================");
      console.log("[CustomPromptPage] 🎯 FINAL RESULT:");
      console.log("[CustomPromptPage] 🎯 Total Cognos parameters:", cognosParams.length);
      console.log("[CustomPromptPage] 🎯 Structure validation:");

      cognosParams.forEach((param, idx) => {
        console.log(`[CustomPromptPage] 🎯   Param ${idx}:`);
        console.log(`[CustomPromptPage] 🎯     - parameter object exists:`, !!param.parameter);
        console.log(`[CustomPromptPage] 🎯     - parameter object type:`, typeof param.parameter);
        console.log(`[CustomPromptPage] 🎯     - values array exists:`, !!param.values);
        console.log(`[CustomPromptPage] 🎯     - values count:`, param.values ? param.values.length : 0);
        if (param.values && param.values.length > 0) {
          console.log(`[CustomPromptPage] 🎯     - first value:`, param.values[0]);
        }
      });

      console.log("[CustomPromptPage] 🎯 ==========================================");
      console.log("[CustomPromptPage] 📤 RETURNING", cognosParams.length, "parameters to Cognos");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return cognosParams;
    } catch (err) {
      console.error("[CustomPromptPage] ❌ getParameters() failed with error:");
      console.error("[CustomPromptPage] ❌ Error message:", err.message);
      console.error("[CustomPromptPage] ❌ Error stack:", err.stack);
    }

    console.warn("[CustomPromptPage] ⚠️ Returning null (error occurred)");
    console.log("[CustomPromptPage] 📤 RETURNING null to Cognos");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // IS IN VALID STATE
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.isInValidState = function (oControlHost) {
    console.log("[CustomPromptPage] 🔍 isInValidState() called");
    return true;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SET DATA
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.setData = function (oControlHost, oDataStore) {
    console.log("[CustomPromptPage] 📊 setData() called");
    this.dataStore = oDataStore;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════════
  CustomPromptPage.prototype.destroy = function (oControlHost) {
    console.log("[CustomPromptPage] 🧨 destroy() called");

    try {
      if (this.dragDrop && typeof this.dragDrop.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying DragDrop...");
        this.dragDrop.destroy();
        this.dragDrop = null;
      }

      if (this.leftPane && typeof this.leftPane.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying LeftPane...");
        this.leftPane.destroy();
        this.leftPane = null;
      }

      if (this.rightPane && typeof this.rightPane.destroy === "function") {
        console.log("[CustomPromptPage] 🧨 Destroying RightPane...");
        this.rightPane.destroy();
        this.rightPane = null;
      }

      if (this.domNode && this.domNode.parentNode) {
        console.log("[CustomPromptPage] 🧨 Removing DOM node...");
        this.domNode.parentNode.removeChild(this.domNode);
      }

      this.m_oControlHost = null;
      this.registeredParams = {}; // ✅ Clear stored params

      console.log("[CustomPromptPage] ✅ destroy() complete");
    } catch (err) {
      console.error("[CustomPromptPage] ❌ Error during destroy():", err);
    }
  };

  return CustomPromptPage;
});
