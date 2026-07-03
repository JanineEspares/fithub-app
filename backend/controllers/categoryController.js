const categoryService = require('../services/categoryService');
const apiResponse = require('../utils/apiResponse');

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();

        return apiResponse.success(
            res,
            200,
            'Categories retrieved successfully.',
            categories
        );

    } catch (err) {
        next(err);
    }
};

exports.createCategory = async (req, res, next) => {

    try {

        const category = await categoryService.createCategory({
            name: req.body.name,
            description: req.body.description
        });

        return apiResponse.success(
            res,
            201,
            'Category created successfully.',
            category
        );

    } catch (err) {
        next(err);
    }

};