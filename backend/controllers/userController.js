exports.profile = async (req, res) => {

    res.status(200).json({

        success: true,

        message: 'User profile retrieved successfully.',

        user: req.user

    });

};