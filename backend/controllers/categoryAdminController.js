const db = require('../models');
const apiResponse = require('../utils/apiResponse');

exports.list = async (req, res, next) => {
  try {
    const categories = await db.Category.findAll({ order: [['id', 'DESC']] });
    return apiResponse.success(res, 200, 'Categories retrieved successfully.', categories);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const category = await db.Category.create({
      name: req.body.name,
      description: req.body.description
    });
    return apiResponse.success(res, 201, 'Category created successfully.', category);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return apiResponse.error(res, 404, 'Category not found.');
    }

    await category.update({
      name: req.body.name || category.name,
      description: req.body.description || category.description
    });

    return apiResponse.success(res, 200, 'Category updated successfully.', category);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return apiResponse.error(res, 404, 'Category not found.');
    }

    const productCount = await db.Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      return apiResponse.error(res, 409, 'Cannot delete a category that has products.');
    }

    await category.destroy();
    return apiResponse.success(res, 200, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
};
