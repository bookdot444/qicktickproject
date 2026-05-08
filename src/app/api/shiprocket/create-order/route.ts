import { NextResponse } from "next/server";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const SHIPROCKET_DEFAULT_EMAIL = "qicktick4@gmail.com";

async function getShiprocketToken() {
  const authRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  const data = await authRes.json();
  return data.token;
}

export async function POST(req: Request) {
  try {
    const { orderData, vendorProfile } = await req.json();
    const token = await getShiprocketToken();
    if (!token) throw new Error("Shiprocket Auth Failed");

    // 1. PREPARE PICKUP (VENDOR: Government of Karnataka)
    const pickupNickname = (vendorProfile.company_name || "Primary").trim().substring(0, 30);
    
    // Logic to satisfy: "Address line 1 should have House no / Flat no"
    let vAddr1 = `${vendorProfile.flat_no || ''} ${vendorProfile.building || ''}`.trim();
    // If it doesn't start with a number, prepend one (Shiprocket requirement)
    if (!/^\d/.test(vAddr1)) {
      vAddr1 = `No. 1, ${vAddr1}`;
    }

    const pickupResponse = await fetch(`${BASE_URL}/settings/company/addpickup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        pickup_location: pickupNickname,
        name: vendorProfile.owner_name || "Vendor",
        email: SHIPROCKET_DEFAULT_EMAIL,
        phone: vendorProfile.mobile_number,
        address: vAddr1,
        address_2: vendorProfile.street || vendorProfile.area,
        city: vendorProfile.city,
        state: vendorProfile.state || "Karnataka",
        pincode: vendorProfile.pincode,
        pin_code: vendorProfile.pincode, // redundant field for safety
        country: "India"
      }),
    });

    // 2. EXTRACT CUSTOMER (DELIVERY: Vyshnavi, Chennai)
    const custAddr = typeof orderData.address === 'string' ? JSON.parse(orderData.address) : orderData.address;
    
    // Map Anna Nagar address correctly
    const cAddr1 = custAddr.address || `${custAddr.building} ${custAddr.street}`;
    const cAddr2 = custAddr.area || custAddr.city;

    // 3. CREATE FINAL ORDER PAYLOAD
    const payload = {
      order_id: orderData.id,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: pickupNickname, 
      
      billing_customer_name: custAddr.name || "Customer",
      billing_last_name: ".",
      billing_address: cAddr1,
      billing_address_2: cAddr2,
      billing_city: custAddr.city,
      billing_pincode: custAddr.pincode,
      // Fallback state if missing in JSON (Chennai -> Tamil Nadu)
      billing_state: custAddr.state || (custAddr.city === "Chennai" ? "Tamil Nadu" : "Karnataka"),
      billing_country: "India",
      billing_email: SHIPROCKET_DEFAULT_EMAIL,
      billing_phone: custAddr.phone,
      shipping_is_billing: true,

      order_items: (typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items).map((item: any) => ({
        name: item.product.product_name,
        sku: item.product.id,
        units: item.quantity,
        selling_price: item.product.price,
        discount: 0,
        tax: 0,
        hsn: ""
      })),
      
      payment_method: "Prepaid",
      sub_total: parseFloat(orderData.total_amount),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    // 4. SEND TO SHIPROCKET
    const response = await fetch(`${BASE_URL}/orders/create/adhoc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status_code === 1 || result.order_id) {
      return NextResponse.json({ success: true, data: result });
    } else {
      console.error("SHIPROCKET REJECTION:", result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}