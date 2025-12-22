"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Eye, X } from "lucide-react";

type TravelRequest = {
  id: number;
  name: string;
  phone: string;
  purpose: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  travel_date: string | null;
  goods_description: string | null;
  weight_kg: string | null;
  created_at: string | null;
};

export default function TravelRequestsPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("travel_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setRequests(data);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Travel Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-black text-black">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-black text-left">Name</th>
              <th className="py-2 px-4 border-b border-black text-left">Phone</th>
              <th className="py-2 px-4 border-b border-black text-left">Purpose</th>
              <th className="py-2 px-4 border-b border-black text-left">Travel Date</th>
              <th className="py-2 px-4 border-b border-black text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="py-2 px-4 border-b border-black">{req.name}</td>
                <td className="py-2 px-4 border-b border-black">{req.phone}</td>
                <td className="py-2 px-4 border-b border-black">{req.purpose || "-"}</td>
                <td className="py-2 px-4 border-b border-black">{req.travel_date || "-"}</td>
                <td className="py-2 px-4 border-b border-black">
                  <button onClick={() => setSelectedRequest(req)}>
                    <Eye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 w-full max-w-md relative text-black">
            <button
              className="absolute top-4 right-4"
              onClick={() => setSelectedRequest(null)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedRequest.name}'s Request</h2>
            <p><strong>Name:</strong> {selectedRequest.name}</p>
            <p><strong>Phone:</strong> {selectedRequest.phone}</p>
            <p><strong>Purpose:</strong> {selectedRequest.purpose || "-"}</p>
            <p><strong>Pickup Location:</strong> {selectedRequest.pickup_location || "-"}</p>
            <p><strong>Drop Location:</strong> {selectedRequest.drop_location || "-"}</p>
            <p><strong>Travel Date:</strong> {selectedRequest.travel_date || "-"}</p>
            <p><strong>Goods Description:</strong> {selectedRequest.goods_description || "-"}</p>
            <p><strong>Weight (kg):</strong> {selectedRequest.weight_kg || "-"}</p>
            <p><strong>Created At:</strong> {selectedRequest.created_at || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
