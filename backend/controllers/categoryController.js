const categoryService = require('../services/categoryService');
const apiResponse = require('../utils/apiResponse');

exports.create = async (req, res, next) => {

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