import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../config.js";
import { badRequestError } from "../exceptions/index.js";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

//1: verifyGoogleToken
export const verifyGoogleToken = async (idToken) => {
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
  } catch (error) {
    badRequestError("Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload?.email) {
    badRequestError("Invalid Google token");
  }
  //the email must be verified by Google
  if (payload.email_verified !== true) {
    badRequestError("Google email is not verified");
  }

  return { email: payload.email, name: payload.name ?? payload.email.split("@")[0] };
};