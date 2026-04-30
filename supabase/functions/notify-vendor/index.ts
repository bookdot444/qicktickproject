import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "https://esm.sh/nodemailer"

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const { record } = await req.json();
        
        // Ensure items exist before mapping
        const items = record.items || [];
        const vendorIds = [...new Set(items.map((item: any) => item.product?.vendor_id))].filter(Boolean);

        // Gmail Configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "qicktickofficial@gmail.com",
                pass: Deno.env.get("GMAIL_APP_PASSWORD"), 
            },
        });

        const results = [];

        for (const vId of vendorIds) {
            const { data: vendor } = await supabase
                .from("vendor_register")
                .select("email, company_name")
                .eq("id", vId)
                .single();

            if (vendor?.email) {
                const info = await transporter.sendMail({
                    from: '"QuickTick Support" <qicktickofficial@gmail.com>',
                    to: vendor.email,
                    subject: `New Order Alert: #${record.id.slice(0, 8)}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #EAB308;">New Order Received!</h2>
                            <p>Hello <strong>${vendor.company_name}</strong>,</p>
                            <p>A new order has been placed for your products.</p>
                            <p><strong>Order ID:</strong> ${record.id}</p>
                            <p><strong>Total Amount:</strong> ₹${record.total_amount}</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p>Please log in to your dashboard to process the order.</p>
                        </div>
                    `,
                });
                results.push({ vendor: vendor.email, status: "sent" });
            }
        }

        return new Response(JSON.stringify({ success: true, results }), { 
            headers: { "Content-Type": "application/json" },
            status: 200 
        });

    } catch (error) {
        console.error("Function Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { 
            headers: { "Content-Type": "application/json" },
            status: 500 
        });
    }
});