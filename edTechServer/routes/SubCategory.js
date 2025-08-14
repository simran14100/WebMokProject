const express = require('express');
const router = express.Router();

const { auth, isInstructor, isStudent, isAdmin } = require('../middlewares/auth');
const {
  createSubCategory,
  showAllSubCategories,
  getSubCategoriesByParent,
} = require('../controllers/SubCategory');

router.post('/createSubCategory', auth, isAdmin, createSubCategory);
router.get('/showAllSubCategories', showAllSubCategories);
router.get('/getSubCategory/:parentId', getSubCategoriesByParent);

module.exports = router;
