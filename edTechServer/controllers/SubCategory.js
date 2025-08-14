const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Create a new sub-category
exports.createSubCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name || !description || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const parentCategoryDetails = await Category.findById(parentCategory);
    if (!parentCategoryDetails) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found',
      });
    }

    const subCategoryDetails = await SubCategory.create({
      name: name,
      description: description,
      parentCategory: parentCategory,
    });

    return res.status(200).json({
      success: true,
      message: 'Sub-category created successfully',
      data: subCategoryDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create sub-category',
      error: err.message,
    });
  }
};

// Get all sub-categories
exports.showAllSubCategories = async (req, res) => {
  try {
    const allSubCategories = await SubCategory.find({}).populate('parentCategory').exec();
    return res.status(200).json({
      success: true,
      data: allSubCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-categories',
      error: error.message,
    });
  }
};

// Get all sub-categories for a specific parent category
exports.getSubCategoriesByParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        const subCategories = await SubCategory.find({ parentCategory: parentId });

        if (!subCategories) {
            return res.status(404).json({
                success: false,
                message: "No sub-categories found for this category",
            });
        }

        return res.status(200).json({
            success: true,
            data: subCategories,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching sub-categories",
            error: error.message,
        });
    }
};
