window.FitHubAutocomplete = {
  init(inputSelector, endpoint, renderSuggestion, listSelector) {
    const listId = listSelector || `${inputSelector.replace(/[^a-z0-9]/gi, '')}-suggestions`;
    if (!document.querySelector(listId)) {
      $(inputSelector).after(`<div id="${listId.replace('#', '')}" class="autocomplete-list"></div>`);
    }
    $(document).on('input', inputSelector, function () {
      const query = $(this).val();
      if (!query || query.length < 2) return;
      window.FitHubUtils.apiRequest(`${endpoint}?q=${encodeURIComponent(query)}`).done((response) => {
        const payload = response?.data || {};
        const items = Array.isArray(payload) ? payload : (payload.products || []);
        $(listId).html(items.map(renderSuggestion).join(''));
      });
    });
  }
};
