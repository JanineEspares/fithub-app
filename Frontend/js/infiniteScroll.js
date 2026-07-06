window.FitHubInfiniteScroll = {
  init(listSelector, loadMore) {
    let loading = false;
    $(window).on('scroll', function () {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 220;
      if (nearBottom && !loading) {
        loading = true;
        Promise.resolve(loadMore()).finally(() => { loading = false; });
      }
    });
  }
};
