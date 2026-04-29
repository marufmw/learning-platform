"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart, BarChart3, BookOpen, Target } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen bg-[#1e1f22]">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#5865F2] rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-[#b5bac1]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#313338] text-[#dbdee1]">
      {/* Navigation */}
      <nav className="border-b border-[#1e1f22] sticky top-0 bg-[#1e1f22]/80 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#dbdee1]">
            Busy Brains
          </div>
          <div className="space-x-4">
            <Link
              href="/sign-in"
              className="text-[#b5bac1] hover:text-[#dbdee1] transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-lg transition inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1e1f22]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Unlock Your Childs<br />
              <span className="text-[#5865F2]">
                Learning Potential
              </span>
            </h1>
            <p className="text-xl text-[#b5bac1] mb-8 max-w-2xl mx-auto leading-relaxed">
              A comprehensive learning platform designed to engage, inspire, and nurture the next generation of learners through interactive modules and adaptive learning paths.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
              >
                Start Free Trial →
              </Link>
              <Link
                href="/sign-in"
                className="bg-[#2b2d31] hover:bg-[#1e1f22] text-[#dbdee1] px-8 py-4 rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#dbdee1]">Why Choose Busy Brains?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl bg-[#2b2d31] border border-[#1e1f22]">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3 text-[#dbdee1]">Structured Learning</h3>
            <p className="text-[#b5bac1]">
              Progressive curriculum modules that build knowledge step by step, ensuring mastery at each level.
            </p>
          </div>
          <div className="p-8 rounded-xl bg-[#2b2d31] border border-[#1e1f22]">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-[#dbdee1]">Personalized Paths</h3>
            <p className="text-[#b5bac1]">
              Adaptive learning journeys tailored to each childs pace and learning style for optimal engagement.
            </p>
          </div>
          <div className="p-8 rounded-xl bg-[#2b2d31] border border-[#1e1f22]">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-[#dbdee1]">Progress Tracking</h3>
            <p className="text-[#b5bac1]">
              Real-time insights into learning progress with detailed analytics and achievement milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#2b2d31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            {/* Modules */}
            <div className="flex flex-col items-center">
              <div className="bg-[#5865F2]/10 p-4 rounded-xl mb-4">
                <BookOpen className="w-8 h-8 text-[#5865F2]" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">6</p>
              <p className="text-[#b5bac1]">Comprehensive Modules</p>
            </div>

            {/* Quests */}
            <div className="flex flex-col items-center">
              <div className="bg-[#5865F2]/10 p-4 rounded-xl mb-4">
                <Target className="w-8 h-8 text-[#5865F2]" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">50+</p>
              <p className="text-[#b5bac1]">Interactive Quests</p>
            </div>

            {/* Screens */}
            <div className="flex flex-col items-center">
              <div className="bg-[#5865F2]/10 p-4 rounded-xl mb-4">
                <BarChart className="w-8 h-8 text-[#5865F2]" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">200+</p>
              <p className="text-[#b5bac1]">Learning Screens</p>
            </div>

          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-[#2b2d31] rounded-2xl p-12 text-center border border-[#1e1f22]">
          <h2 className="text-4xl font-bold mb-4 text-[#dbdee1]">Ready to Get Started?</h2>
          <p className="text-[#b5bac1] text-lg mb-8">
            Join thousands of families discovering the joy of learning with Busy Brains.
          </p>
          <Link
            href="/sign-up"
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 inline-block shadow-lg"
          >
            Start Your Free Trial Today →
          </Link>
        </div>
      </div>

      <footer className="border-t border-[#1e1f22] bg-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <p className="font-bold text-lg mb-4 text-[#dbdee1]">
                Busy Brains
              </p>
              <p className="text-sm text-[#b5bac1]">
                Empowering the next generation of learners.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="font-semibold mb-4 text-[#dbdee1]">Product</p>
              <ul className="space-y-2 text-sm text-[#b5bac1]">
                <li><a href="#" className="hover:text-[#dbdee1]">Features</a></li>
                <li><a href="#" className="hover:text-[#dbdee1]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#dbdee1]">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="font-semibold mb-4 text-[#dbdee1]">Company</p>
              <ul className="space-y-2 text-sm text-[#b5bac1]">
                <li><a href="#" className="hover:text-[#dbdee1]">About</a></li>
                <li><a href="#" className="hover:text-[#dbdee1]">Blog</a></li>
                <li><a href="#" className="hover:text-[#dbdee1]">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="font-semibold mb-4 text-[#dbdee1]">Legal</p>
              <ul className="space-y-2 text-sm text-[#b5bac1]">
                <li><a href="#" className="hover:text-[#dbdee1]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#dbdee1]">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#2b2d31] pt-8 text-center text-sm text-[#b5bac1]">
            <p>&copy; 2026 Busy Brains. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

