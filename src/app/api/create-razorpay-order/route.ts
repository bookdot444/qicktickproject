import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();

    const order = await razorpay.orders.create({
      amount: body.amount * 100, // paise
      currency: "INR",
      receipt: body.receipt ?? `rcpt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
