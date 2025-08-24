const CourseworkSlot = require('../models/CourseworkSlot')
const CourseworkConfig = require('../models/CourseworkConfig')
const CourseworkPaper = require('../models/CourseworkPaper')
const CourseworkResult = require('../models/CourseworkResult')

// List slots with pagination and search
exports.listSlots = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {}

    const skip = (Number(page) - 1) * Number(limit)

    const [items, total] = await Promise.all([
      CourseworkSlot.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      CourseworkSlot.countDocuments(query)
    ])

    return res.json({ success: true, data: { items, meta: { total, page: Number(page), limit: Number(limit) } } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch coursework slots' })
  }
}

// ===== Coursework Papers =====
// List papers with pagination and optional search by code/name
exports.listPapers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const query = search
      ? { $or: [
          { code: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ] }
      : {}
    const skip = (Number(page) - 1) * Number(limit)
    const [items, total] = await Promise.all([
      CourseworkPaper.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      CourseworkPaper.countDocuments(query)
    ])
    return res.json({ success: true, data: { items, meta: { total, page: Number(page), limit: Number(limit) } } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch papers' })
  }
}

// Create paper
exports.createPaper = async (req, res) => {
  try {
    const { code, name, theoryMax, theoryMinPass, iaMax, iaMinPass, credit, paperType = 'Elective' } = req.body || {}
    if (!code || !name) return res.status(400).json({ success: false, message: 'code and name are required' })
    const paper = await CourseworkPaper.create({ code, name, theoryMax, theoryMinPass, iaMax, iaMinPass, credit, paperType })
    return res.status(201).json({ success: true, data: paper })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create paper' })
  }
}

// Update paper
exports.updatePaper = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body || {}
    const paper = await CourseworkPaper.findByIdAndUpdate(id, updates, { new: true })
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' })
    return res.json({ success: true, data: paper })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update paper' })
  }
}

// Delete paper
exports.deletePaper = async (req, res) => {
  try {
    const { id } = req.params
    const paper = await CourseworkPaper.findByIdAndDelete(id)
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' })
    return res.json({ success: true, message: 'Paper deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete paper' })
  }
}

// Toggle isActive
exports.togglePaperActive = async (req, res) => {
  try {
    const { id } = req.params
    const paper = await CourseworkPaper.findById(id)
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' })
    paper.isActive = !paper.isActive
    await paper.save()
    return res.json({ success: true, data: paper })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to toggle paper' })
  }
}

// Create slot
exports.createSlot = async (req, res) => {
  try {
    const { name, startDate, lateFeeDate, lateFee = 0, marksheetSeries = '' } = req.body
    if (!name || !startDate || !lateFeeDate) {
      return res.status(400).json({ success: false, message: 'name, startDate and lateFeeDate are required' })
    }

    const slot = await CourseworkSlot.create({ name, startDate, lateFeeDate, lateFee, marksheetSeries })
    return res.status(201).json({ success: true, data: slot })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create coursework slot' })
  }
}

// Update slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body || {}
    const slot = await CourseworkSlot.findByIdAndUpdate(id, updates, { new: true })
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' })
    return res.json({ success: true, data: slot })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update coursework slot' })
  }
}

// Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params
    const slot = await CourseworkSlot.findByIdAndDelete(id)
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' })
    return res.json({ success: true, message: 'Slot deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete coursework slot' })
  }
}

// Toggle active flag
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params
    const slot = await CourseworkSlot.findById(id)
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' })
    slot.isActive = !slot.isActive
    await slot.save()
    return res.json({ success: true, data: slot })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to toggle slot' })
  }
}

// Get 3 coursework images
exports.getImages = async (req, res) => {
  try {
    let config = await CourseworkConfig.findOne().sort({ createdAt: -1 })
    if (!config) {
      config = await CourseworkConfig.create({ image1Url: '', image2Url: '', image3Url: '' })
    }
    return res.json({ success: true, data: { image1Url: config.image1Url, image2Url: config.image2Url, image3Url: config.image3Url } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to load coursework images' })
  }
}

// Update 3 coursework images
exports.updateImages = async (req, res) => {
  try {
    const { image1Url = '', image2Url = '', image3Url = '' } = req.body || {}
    let config = await CourseworkConfig.findOne().sort({ createdAt: -1 })
    if (!config) {
      config = new CourseworkConfig()
    }
    config.image1Url = image1Url
    config.image2Url = image2Url
    config.image3Url = image3Url
    await config.save()
    return res.json({ success: true, data: { image1Url, image2Url, image3Url } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update coursework images' })
  }
}

// ===== Coursework Results =====
// List results with pagination and optional search by student/paper fields
exports.listResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const q = search
      ? {
          $or: [
            { studentId: { $regex: search, $options: 'i' } },
            { studentName: { $regex: search, $options: 'i' } },
            { paperCode: { $regex: search, $options: 'i' } },
            { paperName: { $regex: search, $options: 'i' } },
            { result: { $regex: search, $options: 'i' } },
            { grade: { $regex: search, $options: 'i' } },
          ],
        }
      : {}
    const skip = (Number(page) - 1) * Number(limit)
    const [items, total] = await Promise.all([
      CourseworkResult.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      CourseworkResult.countDocuments(q),
    ])
    return res.json({ success: true, data: { items, meta: { total, page: Number(page), limit: Number(limit) } } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch results' })
  }
}

// Create a result. Auto-calculate total/result/grade if not provided
exports.createResult = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      paperCode,
      paperName,
      theoryObt = 0,
      iaObt = 0,
      passMarks = 0,
      remarks = '',
      isActive = true,
    } = req.body || {}
    if (!studentId || !studentName || !paperCode || !paperName) {
      return res.status(400).json({ success: false, message: 'studentId, studentName, paperCode and paperName are required' })
    }
    const total = Number(theoryObt || 0) + Number(iaObt || 0)
    const result = Number(passMarks) > 0 ? (total >= Number(passMarks) ? 'Pass' : 'Fail') : 'Pending'
    let grade = ''
    if (result === 'Pass') {
      if (total >= 90) grade = 'A+'
      else if (total >= 80) grade = 'A'
      else if (total >= 70) grade = 'B+'
      else if (total >= 60) grade = 'B'
      else if (total >= 50) grade = 'C'
      else grade = 'D'
    } else if (result === 'Fail') {
      grade = 'F'
    }
    const doc = await CourseworkResult.create({ studentId, studentName, paperCode, paperName, theoryObt, iaObt, passMarks, total, result, grade, remarks, isActive })
    return res.status(201).json({ success: true, data: doc })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create result' })
  }
}

// Update a result
exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body || {}
    if (updates.theoryObt != null || updates.iaObt != null || updates.passMarks != null) {
      const theoryObt = Number(updates.theoryObt ?? 0)
      const iaObt = Number(updates.iaObt ?? 0)
      const passMarks = Number(updates.passMarks ?? 0)
      const total = theoryObt + iaObt
      const result = passMarks > 0 ? (total >= passMarks ? 'Pass' : 'Fail') : 'Pending'
      let grade = ''
      if (result === 'Pass') {
        if (total >= 90) grade = 'A+'
        else if (total >= 80) grade = 'A'
        else if (total >= 70) grade = 'B+'
        else if (total >= 60) grade = 'B'
        else if (total >= 50) grade = 'C'
        else grade = 'D'
      } else if (result === 'Fail') {
        grade = 'F'
      }
      updates.total = total
      updates.result = result
      updates.grade = grade
    }
    const doc = await CourseworkResult.findByIdAndUpdate(id, updates, { new: true })
    if (!doc) return res.status(404).json({ success: false, message: 'Result not found' })
    return res.json({ success: true, data: doc })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update result' })
  }
}

// Delete a result
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params
    const doc = await CourseworkResult.findByIdAndDelete(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Result not found' })
    return res.json({ success: true, message: 'Result deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete result' })
  }
}

// Toggle result active flag
exports.toggleResultActive = async (req, res) => {
  try {
    const { id } = req.params
    const doc = await CourseworkResult.findById(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Result not found' })
    doc.isActive = !doc.isActive
    await doc.save()
    return res.json({ success: true, data: doc })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to toggle result' })
  }
}
