  // Available options for suggestion box, only if promptControl is a select
    const availableOptions = promptControl.tagName.toLowerCase() === "select"
    ? Array.from(promptControl.options).map(o => o.textContent.trim())
    : [];

    function createSuggestionBox(input, options) {
    const box = document.createElement("div");
    box.classList.add("suggestion-box");
    document.body.appendChild(box);

    let activeIndex = -1;

    function updateBox() {
      const query = input.value.toLowerCase().trim();
    box.innerHTML = "";
    if (!query) return box.style.display = "none";

      const matches = options.filter(o => o.toLowerCase().includes(query));
    if (!matches.length) return box.style.display = "none";

      matches.forEach((val, index) => {
        const item = document.createElement("div");
    item.textContent = val;
    item.classList.add("suggestion-item");
    if (index === activeIndex) item.classList.add("active");
    item.style.padding = "6px 10px";
    item.style.cursor = "pointer";
        item.addEventListener("mousedown", () => {
          if (!tags.includes(val)) {
        tags.push(val);
    renderTags();
    input.value = "";
          }
    box.style.display = "none";
    activeIndex = -1;
        });
    box.appendChild(item);
      });

    const rect = input.getBoundingClientRect();
    box.style.left = `${rect.left + window.scrollX}px`;
    box.style.top = `${rect.bottom + window.scrollY}px`;
    box.style.minWidth = `${input.offsetWidth}px`;
    box.style.display = "block";
    }

    input.addEventListener("input", () => {
        activeIndex = -1;
    updateBox();
    });

    input.addEventListener("keydown", (e) => {
      const items = box.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
        e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
    updateBox();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateBox();
      } else if (e.key === "Tab") {
        if (box.style.display === "block" && items.length > 0 && activeIndex >= 0) {
        e.preventDefault();
    const val = items[activeIndex].textContent.trim();
    if (!tags.includes(val)) {
        tags.push(val);
    renderTags();
    input.value = "";
          }
    box.style.display = "none";
        } else {
          const raw = input.value.trim();
    if (raw && !tags.includes(raw)) {
        tags.push(raw);
    renderTags();
    input.value = "";
          }
        }
      } else if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submit
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target !== input) box.style.display = "none";
    });
  }

  if (availableOptions.length) {
    createSuggestionBox(input, availableOptions);
  } else {
    // No suggestions, but still attach Tab handler for adding custom tags
    input.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const raw = input.value.trim();
        if (raw && !tags.includes(raw)) {
          tags.push(raw);
          renderTags();
          input.value = "";
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
      }
    });
  }
  

    renderTags();
}
