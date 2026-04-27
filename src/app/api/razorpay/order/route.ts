import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // 🔥 IMPORTANT FIX

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let amount = Number(body.amount);

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // 🔥 convert to paise safely (avoid float issues)
    amount = Math.round(amount);

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay keys missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.log("RAZORPAY ERROR:", error);

    return NextResponse.json(
      {
        error: error?.error?.description || error.message || "Server error",
      },
      { status: 500 }
    );
  }
}