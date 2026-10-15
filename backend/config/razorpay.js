import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

let razorpay = null;

const isConfigured = Boolean(
  razorpayKeyId &&
  razorpayKeySecret &&
  !razorpayKeyId.includes("placeholder") &&
  razorpayKeyId !== "dummy_mode"
);

if (isConfigured) {
  try {
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    console.log("Razorpay SDK initialized with key:", razorpayKeyId.slice(0, 8) + "...");
  } catch (err) {
    console.warn("Razorpay SDK initialization failed, dummy mode will be used:", err.message);
  }
} else {
  console.log("No live Razorpay keys provided; default dummy mode active.");
}

export default razorpay;
export const key_id = razorpayKeyId;
export const key_secret = razorpayKeySecret;
export const isRazorpayReady = Boolean(razorpay);
