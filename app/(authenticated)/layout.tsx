import { Sidebar } from "@/components/Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--dc-bg-primary)" }}>
      <Sidebar />
      {/* Content area — offset for sidebar on desktop, top bar on mobile */}
      <main
        className="flex-1 min-w-0 pt-14 md:pt-0"
        style={{ marginLeft: "0" }}
      >
        <div className="md:ml-(--sidebar-width) min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
