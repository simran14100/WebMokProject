const express = require('express');
const router = express.Router();
const {
  getVisitDepartments,
  getVisitDepartment,
  createVisitDepartment,
  updateVisitDepartment,
  deleteVisitDepartment,
} = require('../controllers/VisitDepartment');

// Public list/create
router.route('/')
  .get(getVisitDepartments)
  .post(createVisitDepartment);

router.route('/:id')
  .get(getVisitDepartment)
  .put(updateVisitDepartment)
  .delete(deleteVisitDepartment);

module.exports = router;
