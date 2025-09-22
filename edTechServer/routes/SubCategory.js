const express = require('express');
const router = express.Router();

const { auth, isAdmin } = require('../middlewares/auth');
const {
  createSubCategory,
  showAllSubCategories,
  getSubCategoriesByParent,
  subCategoryPageDetails,
  updateSubCategory,
  deleteSubCategory,
  bulkDeleteSubCategories,
} = require('../controllers/SubCategory');

// Public routes
router.get('/showAllSubCategories', showAllSubCategories);
router.get('/getSubCategory/:parentId', getSubCategoriesByParent);
router.post('/subCategoryPageDetails', subCategoryPageDetails);

// Protected admin routes
router.post('/createSubCategory', auth, isAdmin, createSubCategory);
router.put('/updateSubCategory/:subCategoryId', auth, isAdmin, updateSubCategory);
router.delete('/deleteSubCategory/:subCategoryId', auth, isAdmin, deleteSubCategory);
router.post('/bulkDeleteSubCategories', auth, isAdmin, bulkDeleteSubCategories);

module.exports = router;
