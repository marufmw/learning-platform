"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useGetChildrenQuery } from "@/lib/api/hooks";
import { useState, useEffect } from "react";
import { useSelectedChild } from "@/lib/context/ChildContext";

export function Navbar() {
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { selectedChildId, setSelectedChild } = useSelectedChild();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChild]);

  const handleSelectChild = (childId: string) => {
    setSelectedChild(childId);
    setIsDropdownOpen(false);
  };

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BB</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-gray-900 dark:text-white">
              Busy Brains
            </span>
          </Link>


          {/* Right - Navigation */}
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Center - Child Selector */}
            {selectedChild && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                >
                  <span className="text-lg">
                    {selectedChild.gender === "male" ? "👨" : "👩"}
                  </span>
                  <span className="font-medium">{selectedChild.name}</span>
                  <svg
                    className={`w-4 h-4 transition ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    {children?.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleSelectChild(child.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 ${child.id === selectedChildId
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <span className="text-lg">
                          {child.gender === "male" ? "👨" : "👩"}
                        </span>
                        <span className="font-medium">{child.name}</span>
                        {child.id === selectedChildId && (
                          <span className="ml-auto">✓</span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
                      <Link
                        href="/settings"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Manage Children →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/dashboard"
              className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition"
            >
              Dashboard
            </Link>
            <Link
              href="/modules"
              className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition"
            >
              Learn
            </Link>
            <Link
              href="/settings"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
