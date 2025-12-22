"use client";

import { useEffect, useState } from "react";

export default function CustomerListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-users")
      .then(res => res.json())
      .then(data => {
        console.log("API Returned:", data);

        // Handle array or object
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data?.users) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl text-black font-bold mb-5">All Registered Users</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border text-left text-black">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Registered</th>
              <th className="p-3 border">Last Login</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No users found</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-100 transition">
                  <td className="p-3 border">{i + 1}</td>
                  <td className="p-3 border">{u.user_metadata?.name || "-"}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="p-3 border">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="p-3 border">
                    {u.last_sign_in_at
                      ? <span className="bg-green-600 text-white px-2 py-1 rounded">Active</span>
                      : <span className="bg-red-600 text-white px-2 py-1 rounded">Inactive</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
