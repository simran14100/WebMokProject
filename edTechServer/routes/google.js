const express = require("express");
const router = express.Router();
const { getAuthUrl, oauthCallback } = require("../controllers/GoogleOAuth");

// Public endpoints to initiate OAuth and handle callback
router.get("/auth", getAuthUrl);
router.get("/oauth2callback", oauthCallback);

module.exports = router;
