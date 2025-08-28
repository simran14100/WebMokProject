const express = require("express");
const router = express.Router();
const {
  createVisitorLog,
  listVisitorLogs,
  updateVisitorLog,
  deleteVisitorLog,
} = require("../controllers/VisitorLog");

// CRUD for UG/PG Visitor Logs (separate from PhD)
router.get("/", listVisitorLogs);
router.post("/", createVisitorLog);
router.put("/:id", updateVisitorLog);
router.delete("/:id", deleteVisitorLog);

module.exports = router;
