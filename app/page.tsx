"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Foundation</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your full-stack application starts here
      </p>
      <div className="space-x-4">
        <Link
          href="/sign-in"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 inline-block"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
