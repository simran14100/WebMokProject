const Batch = require("../models/Batch");
const User = require("../models/User");

// POST /api/v1/admin/create-batch
exports.createBatch = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: "name and department are required" });
    }

    // Normalize
    const normalizedName = String(name).trim();
    const normalizedDept = String(department).trim().toLowerCase();

    // Validate department against enum
    const allowedDepartments = ["skilling", "training", "personality"];
    if (!allowedDepartments.includes(normalizedDept)) {
      return res.status(400).json({
        success: false,
        message: `department must be one of: ${allowedDepartments.join(", ")}`,
      });
    }

    // Check duplicate
    const exists = await Batch.findOne({ name: normalizedName });
    if (exists) {
      return res.status(409).json({ success: false, message: "Batch with this name already exists" });
    }

    const batch = await Batch.create({
      name: normalizedName,
      department: normalizedDept,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, message: "Batch created successfully", data: batch });
  } catch (error) {
    console.error("CREATE BATCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/v1/admin/batches/:batchId
exports.updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, department } = req.body;

    if (!batchId) return res.status(400).json({ success: false, message: "batchId is required" });
    if (!name && !department) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (department !== undefined) {
      const normalizedDept = String(department).trim().toLowerCase();
      const allowedDepartments = ["skilling", "training", "personality"];
      if (!allowedDepartments.includes(normalizedDept)) {
        return res.status(400).json({ success: false, message: `department must be one of: ${allowedDepartments.join(", ")}` });
      }
      update.department = normalizedDept;
    }

    const updated = await Batch.findByIdAndUpdate(batchId, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: "Batch not found" });

    return res.status(200).json({ success: true, message: "Batch updated successfully", data: updated });
  } catch (error) {
    console.error("UPDATE BATCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/v1/admin/batches/:batchId
exports.deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) return res.status(400).json({ success: false, message: "batchId is required" });

    const deleted = await Batch.findByIdAndDelete(batchId).lean();
    if (!deleted) return res.status(404).json({ success: false, message: "Batch not found" });

    return res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    console.error("DELETE BATCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/admin/batches/:batchId
exports.getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId is required" });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    return res.status(200).json({ success: true, data: batch });
  } catch (error) {
    console.error("GET BATCH BY ID ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/admin/batches/:batchId/students
exports.listBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) return res.status(400).json({ success: false, message: "batchId is required" });

    const batch = await Batch.findById(batchId).populate({ path: "students", select: "firstName lastName email image phone enrollmentFeePaid accountType" }).lean();
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    return res.status(200).json({ success: true, data: batch.students || [] });
  } catch (error) {
    console.error("LIST BATCH STUDENTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/v1/admin/batches/:batchId/students
exports.addStudentToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentId } = req.body;

    if (!batchId || !studentId) {
      return res.status(400).json({ success: false, message: "batchId and studentId are required" });
    }

    const [batch, student] = await Promise.all([
      Batch.findById(batchId),
      User.findById(studentId).lean(),
    ]);

    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    if (student.accountType !== "Student") {
      return res.status(400).json({ success: false, message: "Only Student accounts can be assigned to a batch" });
    }

    const exists = (batch.students || []).some((id) => String(id) === String(studentId));
    if (!exists) {
      batch.students.push(studentId);
      await batch.save();
    }

    return res.status(200).json({ success: true, message: "Student assigned to batch" });
  } catch (error) {
    console.error("ADD STUDENT TO BATCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/v1/admin/batches/:batchId/students/:studentId
exports.removeStudentFromBatch = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    if (!batchId || !studentId) return res.status(400).json({ success: false, message: "batchId and studentId are required" });

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    const before = batch.students?.length || 0;
    batch.students = (batch.students || []).filter((id) => String(id) !== String(studentId));
    const after = batch.students.length;
    if (after !== before) {
      await batch.save();
    }

    return res.status(200).json({ success: true, message: "Student removed from batch" });
  } catch (error) {
    console.error("REMOVE STUDENT FROM BATCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/admin/batches
exports.listBatches = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      Batch.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Batch.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("LIST BATCHES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/admin/batches/export (CSV)
exports.exportBatches = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const items = await Batch.find(query).sort({ createdAt: -1 }).lean();

    // Build CSV
    const header = ["Serial No.", "Department Name", "Batch Name", "Created At", "Active"].join(","
    );
    const rows = items.map((b, idx) => [
      idx + 1,
      escapeCsv(b.department || ""),
      escapeCsv(b.name || ""),
      new Date(b.createdAt).toISOString(),
      b.isActive ? "Yes" : "No",
    ].join(","));
    const csv = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=all_batches.csv");
    return res.status(200).send(csv);
  } catch (error) {
    console.error("EXPORT BATCHES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper to escape CSV values
function escapeCsv(val) {
  const str = String(val).replace(/"/g, '""');
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str + '"';
  }
  return str;
}
