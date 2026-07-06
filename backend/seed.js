const db = require('./models');

const seed = async () => {
  try {
    const count = await db.Product.count();
    if (count > 0) {
      console.log('Products already seeded.');
      return;
    }

    const category = await db.Category.create({ name: 'Supplements', description: 'Fuel your training.' });
    const products = [
      { category_id: category.id, name: 'Performance Protein', description: 'Clean whey protein for post-workout recovery.', base_price: 49.99, brand: 'FitHub' },
      { category_id: category.id, name: 'Pre-Workout Charge', description: 'Caffeine and electrolytes for stronger sessions.', base_price: 34.5, brand: 'FitHub' },
      { category_id: category.id, name: 'Recovery Foam Roller', description: 'Support muscle recovery and mobility.', base_price: 29.0, brand: 'FitHub' }
    ];

    for (const product of products) {
      const created = await db.Product.create(product);
      await db.ProductVariant.create({
        product_id: created.id,
        variant_name: 'Default',
        sku: `SKU-${created.id}`,
        price: created.base_price,
        stock_quantity: 25,
        status: 'active'
      });
    }

    console.log('Seed data created.');
  } catch (error) {
    console.error(error);
  }
};

module.exports = seed;
