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
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Busy Brains
          </div>
          <div className="space-x-4">
            <Link
              href="/sign-in"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Unlock Your Childs<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Potential
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              A comprehensive learning platform designed to engage, inspire, and nurture the next generation of learners through interactive modules and adaptive learning paths.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
              >
                Start Free Trial →
              </Link>
              <Link
                href="/sign-in"
                className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Busy Brains?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3">Structured Learning</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Progressive curriculum modules that build knowledge step by step, ensuring mastery at each level.
            </p>
          </div>
          <div className="p-8 rounded-xl bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Personalized Paths</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adaptive learning journeys tailored to each childs pace and learning style for optimal engagement.
            </p>
          </div>
          <div className="p-8 rounded-xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time insights into learning progress with detailed analytics and achievement milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white text-center">
            <div>
              <p className="text-4xl font-bold mb-2">6</p>
              <p className="text-blue-100">Comprehensive Modules</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50+</p>
              <p className="text-blue-100">Interactive Quests</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">200+</p>
              <p className="text-blue-100">Learning Screens</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Join thousands of families discovering the joy of learning with Busy Brains.
          </p>
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 inline-block shadow-lg"
          >
            Start Your Free Trial Today →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-lg mb-4">Busy Brains</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empowering the next generation of learners.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 Busy Brains. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
