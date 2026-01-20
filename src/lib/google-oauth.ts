import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Google OAuth configuration and helper functions
 */

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + "/api/auth/callback/google"
);

/**
 * Get the Google OAuth URL for user consent
 */
export function getGoogleAuthUrl(state: string): string {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string) {
  const oauth2 = google.oauth2({ version: "v2" });
  const response = await oauth2.userinfo.get({
    auth: { access_token: accessToken },
  });

  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.name,
    picture: response.data.picture,
    verified_email: response.data.verified_email,
  };
}

/**
 * Verify Google ID token
 */
export async function verifyGoogleIdToken(idToken: string) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
      userId: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
      emailVerified: payload?.email_verified,
    };
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    return null;
  }
}
