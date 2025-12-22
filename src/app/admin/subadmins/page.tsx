"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubAdminPage() {
  const [subadmins, setSubadmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchSubAdmins = async () => {
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("role", "subadmin");

    setSubadmins(data || []);
  };

  const addSubAdmin = async () => {
    await supabase.from("admin_users").insert({
      email,
      password,
      role: "subadmin",
    });
    fetchSubAdmins();
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  return (
    <div className="p-6 text-black">
      <h1 className="text-xl font-bold mb-4 text-black">Sub Admin Users</h1>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mr-2 text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Password"
          className="border p-2 mr-2 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={addSubAdmin}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Sub Admin
        </button>
      </div>

      <table className="w-full border text-black">
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="p-3 border text-black">Email</th>
            <th className="p-3 border text-black">Role</th>
          </tr>
        </thead>
        <tbody>
          {subadmins.map((user: any) => (
            <tr key={user.id} className="text-black">
              <td className="p-3 border text-black">{user.email}</td>
              <td className="p-3 border text-black">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
