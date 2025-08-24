const express = require('express');
const router = express.Router();
const { auth, isAdminLevel } = require('../middlewares/auth');
const { listGuides, createGuide, updateGuide, deleteGuide } = require('../controllers/Guide');

// All endpoints require auth + admin-level access
router.use(auth, isAdminLevel);

router.get('/', listGuides);
router.post('/', createGuide);
router.patch('/:id', updateGuide);
router.delete('/:id', deleteGuide);

module.exports = router;
