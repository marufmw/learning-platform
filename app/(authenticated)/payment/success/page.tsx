"use client";

import { Suspense } from "react";
import { PaymentSuccessContent } from "./content";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div><p>Loading...</p></div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
