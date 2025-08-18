const { google } = require("googleapis");

// Uses the same env vars as Google Calendar controller:
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

function getOAuth2Client() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth not configured. Missing env variables.");
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

// GET /api/v1/google/auth
// Redirects user to Google consent screen to obtain offline access (refresh_token)
exports.getAuthUrl = async (req, res) => {
  try {
    const oAuth2Client = getOAuth2Client();

    const scopes = [
      // Minimum for creating calendar events with Meet links
      "https://www.googleapis.com/auth/calendar.events",
    ];

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline", // ensures refresh_token on first consent
      prompt: "consent",       // force showing consent to get refresh_token again
      scope: scopes,
    });

    return res.status(200).json({ success: true, authUrl });
  } catch (err) {
    console.error("getAuthUrl error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate auth URL", error: err.message });
  }
};

// GET /api/v1/google/oauth2callback?code=...
// Exchanges the authorization code for tokens and returns the refresh_token
exports.oauthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ success: false, message: "Missing 'code' query param" });
    }

    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    // tokens may contain access_token, refresh_token, expiry_date
    const { refresh_token, access_token, expiry_date } = tokens || {};

    if (!refresh_token) {
      // If no refresh_token, user may have previously consented. Ask them to try again with prompt=consent
      return res.status(200).json({
        success: true,
        message: "No refresh_token returned. Re-run consent with prompt=consent or revoke prior access and try again.",
        tokens: { access_token, expiry_date },
      });
    }

    // For security, do not auto-write to .env. Show plain response so admin can store securely.
    return res.status(200).json({
      success: true,
      message: "Copy the refresh_token and add it to your server .env as GOOGLE_REFRESH_TOKEN, then restart the server.",
      refresh_token,
      info: {
        note: "Set GOOGLE_REDIRECT_URI to this callback URL in Google Cloud OAuth client.",
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
        scope: "https://www.googleapis.com/auth/calendar.events",
      },
    });
  } catch (err) {
    console.error("oauthCallback error:", err.response?.data || err.message);
    return res.status(500).json({ success: false, message: "OAuth callback failed", error: err.message });
  }
};
