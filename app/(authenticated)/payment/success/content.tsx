"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LayoutDashboard, BookOpen } from "lucide-react";

export function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/dashboard");
    }
  }, [countdown, router]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ color: "var(--dc-text-normal)" }}>
      <div className="max-w-sm w-full rounded-2xl border p-8 text-center"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(35,165,89,0.15)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "var(--dc-green)" }} />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-sm mb-6" style={{ color: "var(--dc-text-muted)" }}>
          Your plan is now active. Start your learning journey!
        </p>

        <p className="text-xs mb-4" style={{ color: "var(--dc-text-muted)" }}>
          Redirecting to dashboard in <span className="font-bold text-white">{countdown}</span>s...
        </p>

        <div className="space-y-2">
          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--dc-blurple)" }}>
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </Link>
          <Link href="/modules"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-normal)" }}>
            <BookOpen className="w-4 h-4" /> View Modules
          </Link>
        </div>
      </div>
    </div>
  );
}
