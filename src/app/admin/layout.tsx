import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // bg-[#0F172A] provides the dark color that will show in the "gap"
    <div className="flex min-h-screen w-full bg-[#0F172A] p-4 gap-4"> 
      
      {/* Sidebar Container */}
      <aside className="w-72 min-w-[288px] flex-shrink-0">
        {/* We wrap the sidebar in a div to ensure it handles the height correctly */}
        <div className="h-full rounded-2xl overflow-hidden shadow-xl">
           <AdminSidebar />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Inner container to provide spacing for the content */}
        <div className="h-full w-full p-8 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}