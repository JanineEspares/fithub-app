const test = require('node:test');
const assert = require('node:assert/strict');

const modelsPath = require.resolve('../models');
const orderServicePath = require.resolve('../services/orderService');

const createMockDb = () => {
  const inventoryUpdateCalls = [];
  const orderCreateCalls = [];

  const mockDb = {
    Cart: {
      findOne: async () => ({
        id: 10,
        status: 'active',
        items: [
          {
            product: { id: 1, base_price: '100.00', status: 'active' },
            quantity: 2,
            product_id: 1
          }
        ],
        update: async (payload) => payload
      })
    },
    CartItem: {},
    Product: {},
    ProductVariant: {
      findOne: async () => ({
        id: 9,
        product_id: 1,
        stock_quantity: 10,
        update: async (payload) => payload
      })
    },
    Inventory: {
      findOne: async () => ({
        id: 7,
        product_variant_id: 9,
        current_stock: 10,
        reserved_stock: 0,
        update: async (payload) => {
          inventoryUpdateCalls.push(payload);
          return payload;
        }
      })
    },
    Order: {
      create: async (payload) => {
        orderCreateCalls.push(payload);
        return {
          id: 42,
          update: async (data) => data
        };
      }
    },
    OrderItem: {
      create: async () => ({})
    },
    Transaction: {
      create: async () => ({})
    },
    sequelize: {
      transaction: async (callback) => callback({})
    }
  };

  return { mockDb, inventoryUpdateCalls, orderCreateCalls };
};

test('checkout reduces stock and creates an order for a valid cart', async () => {
  const { mockDb, inventoryUpdateCalls, orderCreateCalls } = createMockDb();

  delete require.cache[require.resolve('../services/orderService')];
  require.cache[modelsPath] = { exports: mockDb };
  const orderService = require('../services/orderService');

  const order = await orderService.checkout(7, {
    recipient_name: 'Test User',
    contact_number: '09171234567',
    address_line: '123 Street',
    city: 'Cebu',
    province: 'Cebu',
    postal_code: '6000',
    payment_method: 'cod'
  });

  assert.ok(order);
  assert.equal(order.id, 42);
  assert.equal(inventoryUpdateCalls.length, 1);
  assert.equal(orderCreateCalls.length, 1);
  assert.equal(orderCreateCalls[0].total_amount, 200);
});

test('checkout rejects carts with insufficient stock', async () => {
  const { mockDb } = createMockDb();
  mockDb.Inventory.findOne = async () => ({
    id: 7,
    current_stock: 1,
    reserved_stock: 0,
    update: async () => ({})
  });
  mockDb.ProductVariant.findOne = async () => ({
    id: 9,
    product_id: 1,
    stock_quantity: 1,
    update: async () => ({})
  });

  delete require.cache[orderServicePath];
  require.cache[modelsPath] = { exports: mockDb };
  const orderService = require('../services/orderService');

  await assert.rejects(
    () => orderService.checkout(7, {
      recipient_name: 'Test User',
      contact_number: '09171234567',
      address_line: '123 Street',
      city: 'Cebu',
      province: 'Cebu',
      postal_code: '6000',
      payment_method: 'cod'
    }),
    /Insufficient stock/
  );
});
