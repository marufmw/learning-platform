"use client";

import { Suspense } from "react";
import { PaymentSuccessContent } from "./content";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full animate-pulse mx-auto mb-3"
            style={{ background: "var(--dc-blurple)" }} />
          <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
