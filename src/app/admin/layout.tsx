import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#0F172A] p-4 gap-4">

      {/* SIDEBAR */}
      <aside className="w-72 min-w-[288px] flex-shrink-0">
        <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-xl">
          <AdminSidebar />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-full w-full p-8 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
