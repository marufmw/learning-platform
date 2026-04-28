"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push("/dashboard");
    }
  }, [countdown, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-md w-full p-8 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your payment has been processed successfully.
        </p>

        {sessionId && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 break-all border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Session ID:</p>
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Redirecting to dashboard in <strong>{countdown}</strong> seconds...
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full bg-blue-600 dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 font-medium transition"
          >
            Go to Dashboard Now
          </Link>
          <Link
            href="/modules"
            className="inline-block w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition"
          >
            View Modules
          </Link>
        </div>
      </div>
    </div>
  );
}
