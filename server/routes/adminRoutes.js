const express = require("express");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { createEbook, listAdminEbooks, updateEbook, createUploadUrl } = require("../controllers/ebookController");
const { deleteEbook } = require("../controllers/deleteEbookController");
const { uploadCover, importCover } = require("../controllers/coverController");

const router = express.Router();
router.use(requireUser, requireAdmin);
router.post("/covers", express.raw({ type: "application/octet-stream", limit: "10mb" }), uploadCover);
router.post("/covers/import", importCover);
router.get("/ebooks", listAdminEbooks);
router.post("/ebooks", createEbook);
router.patch("/ebooks/:id", updateEbook);
router.delete("/ebooks/:id", deleteEbook);
router.post("/uploads/signed-url", createUploadUrl);

module.exports = router;
