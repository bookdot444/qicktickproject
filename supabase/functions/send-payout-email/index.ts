import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "https://esm.sh/nodemailer"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    // This handles the 'record' object sent by the Supabase Trigger
    const order = body.record; 

    if (!order) throw new Error("No order record found in request");

    // 1. Extract unique Vendor IDs from the JSONB items column
    // Your items structure seems to be: [{ product: { vendor_id: '...' }, ... }]
    const items = order.items || [];
    const vendorIds = [...new Set(items.map((item: any) => item.product?.vendor_id))].filter(Boolean);

    if (vendorIds.length === 0) {
      console.log("No vendors found in this order.");
      return new Response(JSON.stringify({ message: "No vendors to notify" }), { status: 200 });
    }

    // 2. Setup Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "qicktickofficial@gmail.com",
        pass: Deno.env.get("GMAIL_APP_PASSWORD"), 
      },
    });

    const results = [];

    // 3. Loop through vendors, get their email, and send the payout notification
    for (const vId of vendorIds) {
      const { data: vendor, error: vendorErr } = await supabase
        .from("vendor_register")
        .select("email, company_name")
        .eq("id", vId)
        .single();

      if (vendor?.email) {
        await transporter.sendMail({
          from: '"QuickTick Finance" <qicktickofficial@gmail.com>',
          to: vendor.email,
          subject: `Payout Settlement: Order #${order.id.slice(0, 8)}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #16a34a;">Payout Confirmed</h2>
              <p>Hello <strong>${vendor.company_name || 'Vendor'}</strong>,</p>
              <p>We have processed a settlement for your items in Order <strong>#${order.id}</strong>.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Total Order Amount:</strong> ₹${order.total_amount}</p>
                <p><strong>Payment Status:</strong> ${order.payment_status}</p>
                <p><strong>Vendor Payout Status:</strong> ${order.vendor_amount_status}</p>
              </div>
              <p>The funds will be transferred to your registered account shortly.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">QuickTick Solutions - Payout Notification</p>
            </div>
          `,
        });
        results.push({ vendorId: vId, status: "sent" });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payout Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});