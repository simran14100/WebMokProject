const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const Course = require('../models/Course');

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

// Get catalog-like data by SubCategory (shape matches Category.categoryPageDetails)
exports.subCategoryPageDetails = async (req, res) => {
  try {
    const { subCategoryId } = req.body;
    if (!subCategoryId) {
      return res.status(400).json({ success: false, message: 'subCategoryId is required' });
    }

    const selectedSubCategory = await SubCategory.findById(subCategoryId).exec();
    if (!selectedSubCategory) {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }

    // Courses for selected subcategory
    const selectedCourses = await Course.find({
      status: 'Published',
      subCategory: subCategoryId,
    })
      .populate('ratingAndReviews')
      .populate({ path: 'instructor', select: 'firstName lastName image email' })
      .exec();

    if (selectedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'No courses found for the selected subcategory.' });
    }

    // Pick a different subcategory and its courses
    const others = await SubCategory.find({ _id: { $ne: subCategoryId } }).exec();
    let differentSubCategory = null;
    let differentCourses = [];
    if (others.length > 0) {
      differentSubCategory = await SubCategory.findById(others[0]._id).exec();
      differentCourses = await Course.find({ status: 'Published', subCategory: differentSubCategory._id })
        .populate({ path: 'instructor', select: 'firstName lastName image email' })
        .exec();
    }

    // Most selling across all subcategories by studentsEnrolled length
    const allCourses = await Course.find({ status: 'Published' })
      .populate({ path: 'instructor', select: 'firstName lastName image email' })
      .exec();
    const mostSellingCourses = allCourses
      .map(c => ({ c, s: Array.isArray(c.studentsEnrolled) ? c.studentsEnrolled.length : 0 }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map(x => x.c);

    // Response shape mirrors Category.categoryPageDetails to avoid frontend changes
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory: { // use same key name
          _id: selectedSubCategory._id,
          name: selectedSubCategory.name,
          description: selectedSubCategory.description,
          courses: selectedCourses,
        },
        differentCategory: differentSubCategory
          ? {
              _id: differentSubCategory._id,
              name: differentSubCategory.name,
              description: differentSubCategory.description,
              courses: differentCourses,
            }
          : { _id: null, name: '', description: '', courses: [] },
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
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
