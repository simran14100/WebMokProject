const express = require('express')
const router = express.Router()
const { auth, isSuperAdmin } = require('../middlewares/auth')
const ctrl = require('../controllers/coursework')

// All endpoints require auth + SuperAdmin (adjust as needed)
router.use(auth, isSuperAdmin)

// Coursework Slots CRUD
router.get('/slots', ctrl.listSlots)
router.post('/slots', ctrl.createSlot)
router.put('/slots/:id', ctrl.updateSlot)
router.delete('/slots/:id', ctrl.deleteSlot)
router.patch('/slots/:id/toggle', ctrl.toggleActive)

// Coursework Images (3 images)
router.get('/images', ctrl.getImages)
router.put('/images', ctrl.updateImages)

// Coursework Papers CRUD
router.get('/papers', ctrl.listPapers)
router.post('/papers', ctrl.createPaper)
router.put('/papers/:id', ctrl.updatePaper)
router.delete('/papers/:id', ctrl.deletePaper)
router.patch('/papers/:id/toggle', ctrl.togglePaperActive)

// Coursework Results CRUD
router.get('/results', ctrl.listResults)
router.post('/results', ctrl.createResult)
router.put('/results/:id', ctrl.updateResult)
router.delete('/results/:id', ctrl.deleteResult)
router.patch('/results/:id/toggle', ctrl.toggleResultActive)

module.exports = router
