window.FitHubPagination = {
  init(containerSelector, loadPage) {
    let page = 1;
    $(window).on('scroll', function () {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (!nearBottom) return;
      page += 1;
      loadPage(page);
    });
  }
};
