const Task = require('../models/Task');
const Batch = require('../models/Batch');
const TaskSubmission = require('../models/TaskSubmission');

// List tasks for a batch
exports.listBatchTasks = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tasks = await Task.find({ batch: batchId })
      .populate('createdBy', 'firstName lastName email accountType')
      .populate('assignedTo', 'firstName lastName email accountType')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch tasks' });
  }
};

// Create a task for a batch
exports.createBatchTask = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { title, description = '', dueDate = null, assignedTo = null } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const task = await Task.create({
      title: title.trim(),
      description: (description || '').trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      batch: batchId,
      createdBy: req.user && (req.user._id || req.user.id),
      assignedTo: assignedTo || undefined,
    });
    // Populate sequentially to avoid calling populate on a Promise (Mongoose v6+/v7 behavior)
    await task.populate('createdBy', 'firstName lastName email accountType');
    await task.populate('assignedTo', 'firstName lastName email accountType');
    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create task' });
  }
};

// Update a task (title, description, status, dueDate, assignedTo)
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, dueDate, assignedTo } = req.body;

    const updates = {};
    if (typeof title !== 'undefined') updates.title = String(title).trim();
    if (typeof description !== 'undefined') updates.description = String(description).trim();
    if (typeof status !== 'undefined') updates.status = status;
    if (typeof dueDate !== 'undefined') updates.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (typeof assignedTo !== 'undefined') updates.assignedTo = assignedTo || undefined;

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true })
      .populate('createdBy', 'firstName lastName email accountType')
      .populate('assignedTo', 'firstName lastName email accountType');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    return res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete task' });
  }
};

// Get per-student statuses for a task (Option A: completed = submitted)
exports.getTaskStatuses = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('batch', 'name students');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Load batch students
    const batch = await Batch.findById(task.batch).populate('students', 'firstName lastName email');
    const students = batch?.students || [];

    // Load all submissions for this task
    const submissions = await TaskSubmission.find({ task: taskId }).populate('student', 'firstName lastName email');
    const subByStudent = new Map(submissions.map((s) => [String(s.student?._id || s.student), s]));

    // Compose statuses
    const data = students.map((stu) => {
      const sid = String(stu._id);
      const sub = subByStudent.get(sid);
      return {
        student: { _id: stu._id, firstName: stu.firstName, lastName: stu.lastName, email: stu.email },
        status: sub ? 'completed' : 'pending', // Option A: completed if submitted
        submittedAt: sub?.submittedAt || null,
        score: typeof sub?.score === 'number' ? sub.score : null,
        submissionId: sub?._id || null,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch task statuses' });
  }
};

// Summary counts for a task
exports.getTaskSummary = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('batch', 'students');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const batch = await Batch.findById(task.batch, 'students');
    const total = batch?.students?.length || 0;
    const submitted = await TaskSubmission.countDocuments({ task: taskId });
    const pending = Math.max(total - submitted, 0);
    // Option A: completed == submitted; graded: submissions with score
    const graded = await TaskSubmission.countDocuments({ task: taskId, score: { $ne: null } });

    return res.status(200).json({ success: true, data: { total, pending, submitted, completed: submitted, graded } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch task summary' });
  }
};

