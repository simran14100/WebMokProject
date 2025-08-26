const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const { createPaper, listPapers, getPaper, updatePaper, deletePaper } = require("../controllers/UGPGPaper");

// Protect all routes for admin-level users
router.use(auth, isAdminLevel);

router.get("/", listPapers);
router.post("/", createPaper);
router.get("/:id", getPaper);
router.patch("/:id", updatePaper);
router.delete("/:id", deletePaper);

module.exports = router;
