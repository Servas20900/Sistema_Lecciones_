import { AdminNav } from "@/components/admin/admin-nav";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      {/* pt-14 compensa el header fijo en móvil; en desktop md:pt-0 lo cancela */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
