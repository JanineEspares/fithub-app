const db = require('./models');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    // ============================================
    // STEP 1: Create Default Admin Account
    // ============================================
    const adminExists = await db.User.findOne({
      where: { email: 'admin@fithub.com' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await db.User.create({
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@fithub.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        jwt_token: null
      });
      console.log('✅ Default admin account created (Email: admin@fithub.com | Password: Admin@123)');
    } else {
      console.log('✅ Admin account already exists.');
    }

    // ============================================
    // STEP 2: Create Sample Products
    // ============================================
    const count = await db.Product.count();
    if (count > 0) {
      console.log('✅ Products already seeded.');
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

    console.log('✅ Seed data created successfully.');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};

module.exports = seed;

/**
 * SEEDER DOCUMENTATION
 * ====================
 * 
 * This seeder automatically creates:
 * 1. Default Admin Account (if not exists)
 *    - Email: admin@fithub.com
 *    - Password: Admin@123
 *    - Role: admin
 *    - Status: active
 * 
 * 2. Sample Products (if products table is empty)
 *    - Supplements category
 *    - 3 sample fitness products
 * 
 * Runs automatically on server startup (see server.js)
 * Safe to run multiple times (idempotent checks)
 */
