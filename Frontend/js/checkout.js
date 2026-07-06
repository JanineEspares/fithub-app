$(function () {
  if (document.body.dataset.page !== 'checkout') return;
  $('#checkout-form').on('submit', function (event) {
    event.preventDefault();
    window.location.href = 'orders.html';
  });

  $('#checkout-summary').html(`
    <div class="d-flex justify-content-between"><span>Protein Shaker Bottle</span><strong>$350.00</strong></div>
    <div class="d-flex justify-content-between"><span>Resistance Bands</span><strong>$840.00</strong></div>
  `);
});
