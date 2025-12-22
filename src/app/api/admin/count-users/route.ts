import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // SAFE IN API ROUTE ONLY
  );

  const { data } = await supabaseAdmin.auth.admin.listUsers();

  return NextResponse.json({
    totalCustomers: data?.users?.length ?? 0,
  });
}
