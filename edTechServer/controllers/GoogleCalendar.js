const { google } = require("googleapis");

// Expects the following env vars configured on the server:
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN
// Optional: CALENDAR_ID (defaults to 'primary')

function getOAuth2Client() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Google Calendar API not configured. Missing OAuth env variables.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return oAuth2Client;
}

exports.createMeetEvent = async (req, res) => {
  try {
    const { title, description, startISO, endISO } = req.body || {};
    if (!startISO || !endISO) {
      return res.status(400).json({ success: false, message: "startISO and endISO are required" });
    }

    const start = new Date(startISO);
    const end = new Date(endISO);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: "Invalid start/end time" });
    }

    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth });
    const calendarId = process.env.CALENDAR_ID || "primary";

    const event = {
      summary: title || "Live Class",
      description: description || "",
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `req-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const { data } = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const hangoutLink = data.hangoutLink || (data.conferenceData && data.conferenceData.entryPoints && data.conferenceData.entryPoints.find(e => e.entryPointType === "video")?.uri) || null;

    return res.status(200).json({ success: true, eventId: data.id, hangoutLink, event: data });
  } catch (err) {
    console.error("createMeetEvent error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to create Google Meet link", error: err.message });
  }
};
