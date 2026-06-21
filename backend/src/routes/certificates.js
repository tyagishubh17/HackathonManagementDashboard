const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getMyCertificates, downloadCertificate } = require("../controllers/certificateController");

const router = express.Router();

router.use(authenticate);

router.get("/mine", getMyCertificates);
router.get("/:certId/download", downloadCertificate);

module.exports = router;
