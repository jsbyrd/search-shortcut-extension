// Replaces shortcut keys with their values in search queries
const replaceShortcuts = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["shortcuts", "shortcutsEnabled"], (result) => {
      if (result.shortcutsEnabled === false) {
        resolve(query);
        return;
      }

      const shortcuts = result.shortcuts ?? {};
      let modifiedQuery = query;

      for (const [key, value] of Object.entries(shortcuts)) {
        modifiedQuery = modifiedQuery.replace(
          new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          value
        );
      }

      resolve(modifiedQuery);
    });
  });
};

// Handles changes to the search input field
const searchInput = document.querySelector('input[name="q"]');
if (searchInput) {
  searchInput.addEventListener("change", async function () {
    const modifiedQuery = await replaceShortcuts(this.value);
    if (modifiedQuery !== this.value) {
      this.value = modifiedQuery;
    }
  });
}

// Handle form submission
const searchForm = document.querySelector('form[role="search"]');
if (searchForm) {
  searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const searchInput = this.querySelector('input[name="q"]');
    if (searchInput) {
      const modifiedQuery = await replaceShortcuts(searchInput.value);
      searchInput.value = modifiedQuery;
      this.submit();
    }
  });
}
