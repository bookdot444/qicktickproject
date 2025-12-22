"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Loader2, Mail, User, Fingerprint, CalendarClock, Camera } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

 const uploadImage = async (e: any) => {
  try {
    setUploading(true);
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${user.id}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("profile_images")
      .upload(fileName, file, { upsert: false });

    if (uploadError) throw uploadError;

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_images/${fileName}`;

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { profile_image: imageUrl },
    });

    // 🔥 Update backend table also
    await supabase
      .from("profiles") // <-- change this to your table name
      .update({ profile_image: imageUrl })
      .eq("user_id", user.id); // <-- change this if table uses email instead

    // Refresh user
    const { data: refresh } = await supabase.auth.getUser();
    setUser(refresh?.user);
  } catch (err) {
    console.log(err);
  } finally {
    setUploading(false);
  }
};

  if (!user)
    return (
      <div className="flex items-center justify-center h-[70vh] text-xl text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mr-2 text-yellow-600" />
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-sm rounded-3xl p-8 text-center border text-white">
          {/* Profile Image */}
          <div className="relative w-fit mx-auto">
            <Image
              src={user.user_metadata?.profile_image || "/profile-demo.png"}
              width={140}
              height={140}
              alt="Profile"
              className="rounded-full border-4 border-white shadow-lg object-cover"
            />

            {/* Upload Button */}
            <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer hover:scale-105 transition">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-yellow-600" />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={uploadImage} />
            </label>
          </div>

          <h1 className="text-3xl font-extrabold mt-4">{user.user_metadata?.name || "Unnamed User"}</h1>
          <p className="text-white/90">{user.email}</p>
        </div>


        {/* Details */}
        <div className="bg-white shadow-md rounded-2xl p-8 space-y-5 border">
          <DetailRow title="Name" value={user.user_metadata?.name} icon={<User className="w-5 h-5" />} />
          <DetailRow title="Email" value={user.email} icon={<Mail className="w-5 h-5" />} />
          <DetailRow title="User ID" value={user.id} icon={<Fingerprint className="w-5 h-5" />} />
          <DetailRow
            title="Account Created"
            value={new Date(user.created_at).toLocaleString()}
            icon={<CalendarClock className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );

}

function DetailRow({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl hover:shadow-sm transition">
      <div className="bg-yellow-600 text-white p-2 rounded-lg">{icon}</div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-500">{title}</span>
        <span className="text-lg font-medium text-gray-900">{value || "—"}</span>
      </div>
    </div>
  );
}
