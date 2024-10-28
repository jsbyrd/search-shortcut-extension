// Initialize the popup when it's opened
document.addEventListener("DOMContentLoaded", function () {
  // Load existing shortcuts
  loadShortcuts();

  // Load toggle state
  chrome.storage.sync.get(["shortcutsEnabled"], function (result) {
    document.getElementById("shortcutsToggle").checked =
      result.shortcutsEnabled;
  });

  // Add toggle switch listener
  document
    .getElementById("shortcutsToggle")
    .addEventListener("change", function () {
      chrome.storage.sync.set({ shortcutsEnabled: this.checked });
    });

  // Add new shortcut
  document.getElementById("addShortcut").addEventListener("click", function () {
    const key = document.getElementById("shortcutKey").value.trim();
    const value = document.getElementById("shortcutValue").value.trim();

    if (key && value) {
      chrome.storage.sync.get(["shortcuts"], (result) => {
        const shortcuts = result.shortcuts || {};
        shortcuts[key] = value;

        chrome.storage.sync.set({ shortcuts }, function () {
          loadShortcuts();
          document.getElementById("shortcutKey").value = "";
          document.getElementById("shortcutValue").value = "";
        });
      });
    }
  });

  // Reload shortcuts when detecting theme changes (dark/light)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      loadShortcuts();
    });
});

// Load and display all saved shortcuts in the popup
function loadShortcuts() {
  const shortcutList = document.getElementById("shortcutsList");
  shortcutList.innerHTML = "";

  chrome.storage.sync.get(["shortcuts"], (result) => {
    const shortcuts = result.shortcuts ?? {};
    const isDarkTheme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const testdiv = document.createElement("div");
    testdiv.innerHTML = `${Object.keys(shortcuts).length}`;

    Object.entries(shortcuts).forEach(([key, value]) => {
      const shortcutDiv = document.createElement("div");
      shortcutDiv.className = "shortcut-item";
      shortcutDiv.innerHTML = `
        <span class="shortcut-text-container">${key} &#8594; ${value}</span>
        <span class="shortcut-btn-container">
          <img 
            src="../assets/edit-${isDarkTheme ? "white" : "dark"}.svg"
            alt="Edit shortcut icon"
            class="edit-btn"
            data-key="${key}"
            data-value="${value}"
          />
          <span class="delete-btn" data-key="${key}">✖</span>
        </span>
      `;

      shortcutList.appendChild(shortcutDiv);
    });

    // Add event listeners for all edit buttons
    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", function () {
        const key = this.getAttribute("data-key");
        const value = this.getAttribute("data-value");
        enterEditMode(this, key, value);
      })
    );

    // Add event listeners for all delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const keyToDelete = btn.getAttribute("data-key");
        deleteShortcut(keyToDelete);
      });
    });
  });
}

function enterEditMode(editBtn, key, value) {
  // Find text container and replace the original text with input fields
  const shortcutDiv = editBtn.closest(".shortcut-item");
  const textContainer = shortcutDiv.querySelector(".shortcut-text-container");
  textContainer.innerHTML = `
    <input type="text" class="edit-key-input" value="${key}" />
    <input type="text" class="edit-value-input" value="${value}" />
  `;

  editBtn.src = "../assets/checkmark.svg";
  editBtn.alt = "Update shortcut icon";
  editBtn.classList.add("save-btn");

  // Remove old click event listeners to avoid duplicates
  const newSaveBtn = editBtn.cloneNode(true);
  editBtn.replaceWith(newSaveBtn);

  newSaveBtn.addEventListener("click", function () {
    const newKey = shortcutDiv.querySelector(".edit-key-input").value.trim();
    const newValue = shortcutDiv
      .querySelector(".edit-value-input")
      .value.trim();
    saveEditedShortcut(key, newKey, newValue);
  });
}

// Save the edited shortcut
function saveEditedShortcut(oldKey, newKey, newValue) {
  if (!newKey || !newValue) return;

  chrome.storage.sync.get(["shortcuts"], function (result) {
    const shortcuts = result.shortcuts ?? {};

    // Remove the old key if it has been changed
    if (oldKey !== newKey) {
      delete shortcuts[oldKey];
    }

    shortcuts[newKey] = newValue;

    chrome.storage.sync.set({ shortcuts }, function () {
      loadShortcuts();
    });
  });
}

// Removes a shortcut from the display and storage
const deleteShortcut = (key) => {
  chrome.storage.sync.get(["shortcuts"], function (result) {
    const shortcuts = result.shortcuts ?? {};
    delete shortcuts[key];
    chrome.storage.sync.set({ shortcuts }, function () {
      loadShortcuts();
    });
  });
};
