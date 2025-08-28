const express = require('express');
const router = express.Router();
const {
    getVisitPurposes,
    getVisitPurpose,
    createVisitPurpose,
    updateVisitPurpose,
    deleteVisitPurpose
} = require('../controllers/VisitPurpose');

// Public routes
router.route('/')
    .get(getVisitPurposes)
    .post(createVisitPurpose);

router.route('/:id')
    .get(getVisitPurpose)
    .put(updateVisitPurpose)
    .delete(deleteVisitPurpose);

module.exports = router;
