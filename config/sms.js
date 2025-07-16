import fetch from "node-fetch";

export const sendOtp = async (mobile) => {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/AUTOGEN`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.Status !== "Success") {
    throw new Error("OTP send failed: " + data.Details);
  }

  return data.Details; // returns session ID
};
