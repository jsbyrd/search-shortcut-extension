// Intercepts and modifies Google search URLs
chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  if (details.url.includes("google.com/search")) {
    const url = new URL(details.url);
    const query = url.searchParams.get("q");

    if (query) {
      chrome.storage.sync.get(
        ["shortcuts", "shortcutsEnabled"],
        function (result) {
          if (result.shortcutsEnabled === false) {
            return;
          }

          const shortcuts = result.shortcuts || {};
          let modifiedQuery = query;

          for (const [key, value] of Object.entries(shortcuts)) {
            modifiedQuery = modifiedQuery.replace(
              new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              value
            );
          }

          // Update query
          if (modifiedQuery !== query) {
            url.searchParams.set("q", modifiedQuery);
            chrome.tabs.update(details.tabId, { url: url.toString() });
          }
        }
      );
    }
  }
});
