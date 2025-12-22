import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Fetch vendor
    const { data, error } = await supabase
      .from("vendor_register")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (data.status !== "approved") {
      return NextResponse.json(
        { error: "Registration not approved yet" },
        { status: 403 }
      );
    }

    // Return vendor data (do not include password)
    const { password: _, ...vendorData } = data;
    return NextResponse.json({ vendor: vendorData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
