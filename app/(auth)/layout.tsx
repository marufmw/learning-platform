import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#313338]">

      {/* Background glow (brand-colored) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5865F2] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4752c4] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Optional top branding */}
      <div className="absolute top-6 left-0 right-0 z-10 w-screen">
        <Link href="/" className="text-xl text-left pl-12 font-bold text-[#dbdee1] hover:opacity-80 transition">
          Busy Brains
        </Link>
      </div>

      {/* Auth Card Wrapper */}
      {children}
    </div>
  );
}