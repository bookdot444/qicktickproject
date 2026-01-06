import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return Response.json(
        { error: "Razorpay keys missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();

    const order = await razorpay.orders.create({
      amount: body.amount * 100, // paise
      currency: "INR",
      receipt: body.receipt,
      payment_capture: true, // ✅ FIX
    });

    return Response.json(order);
  } catch (error) {
    console.error("Razorpay order error:", error);
    return Response.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
