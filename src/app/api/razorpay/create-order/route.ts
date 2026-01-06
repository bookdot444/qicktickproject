import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // can be public key
  key_secret: process.env.RAZORPAY_KEY_SECRET!,     // secret key must remain server-side
});

export async function POST(req: Request) {
  const { amount } = await req.json();

  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    payment_capture: true, // fixed
  });

  return NextResponse.json(order);
}
