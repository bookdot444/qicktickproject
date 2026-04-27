import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderId, orderData } = await req.json();

    const apiEmail = process.env.SHIPROCKET_API_EMAIL;
    const apiPassword = process.env.SHIPROCKET_API_PASSWORD;

    if (!apiEmail || !apiPassword) {
      return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 500 });
    }

    // ✅ LOGIN
    const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: apiPassword }),
    });

    const authData = await authRes.json();
    if (!authData.token) {
      return NextResponse.json({ success: false, error: "Auth failed", details: authData }, { status: 401 });
    }

    const token = authData.token;

    // ✅ ADDRESS FIX
    let addr = orderData.address;
    if (typeof addr === "string") {
      try { addr = JSON.parse(addr); } catch { addr = {}; }
    }

    if (!addr?.name || !addr?.address || !addr?.city || !addr?.pincode || !addr?.phone) {
      return NextResponse.json({ success: false, error: "Invalid address", details: addr }, { status: 400 });
    }

    // ✅ FINAL PAYLOAD
    const payload = {
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "Primary",

      billing_customer_name: addr.name,
      billing_address: addr.address,
      billing_city: addr.city,
      billing_pincode: String(addr.pincode),
      billing_state: addr.state || "Tamil Nadu",
      billing_country: "India",
      billing_email: orderData.user_email || "test@gmail.com",
      billing_phone: String(addr.phone).slice(-10),

      shipping_customer_name: addr.name,
      shipping_address: addr.address,
      shipping_city: addr.city,
      shipping_pincode: String(addr.pincode),
      shipping_state: addr.state || "Tamil Nadu",
      shipping_country: "India",
      shipping_email: orderData.user_email || "test@gmail.com",
      shipping_phone: String(addr.phone).slice(-10),

      shipping_is_billing: true,

      order_items: orderData.items.map((item: any) => ({
        name: item.product.product_name,
        sku: `SKU-${item.product.id}`,
        units: item.quantity,
        selling_price: item.product.price,
      })),

payment_method: "COD",
      sub_total: Number(orderData.total_amount),

      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };

    console.log("FINAL PAYLOAD:", payload);

    // ✅ CREATE ORDER
    const orderRes = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await orderRes.json();
    console.log("SHIPROCKET RESPONSE:", result);

    if (result.order_id) {
      await supabase
        .from("orders")
        .update({
          order_status: "shipped",
          shiprocket_order_id: result.order_id,
          shiprocket_shipment_id: result.shipment_id
        })
        .eq("id", orderId);

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Shiprocket failed", details: result }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}