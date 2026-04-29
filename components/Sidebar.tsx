"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useGetChildrenQuery } from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  ChevronDown,
  Menu,
  X,
  Brain,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Learn", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ChildAvatar({ gender, size = "sm" }: { gender: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-sm" : "w-9 h-9 text-base";
  return (
    <span className={`${sz} rounded-full bg-[#5865f2]/20 flex items-center justify-center flex-shrink-0`}>
      <User className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} style={{ color: "#5865f2" }} />
    </span>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, { skip: !isLoaded || !userId });
  const { selectedChildId, setSelectedChild } = useSelectedChild();
  const [childOpen, setChildOpen] = useState(false);

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  const handleSelect = (id: string) => {
    setSelectedChild(id);
    setChildOpen(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--dc-bg-secondary)" }}>
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: "var(--dc-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #5865f2, #4752c4)" }}>
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-base tracking-tight">Busy Brains</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-white/10 transition" style={{ color: "var(--dc-text-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Child Selector */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--dc-text-muted)" }}>
          Active Child
        </p>
        <div className="relative">
          <button
            onClick={() => setChildOpen(!childOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition text-left"
            style={{ background: childOpen ? "var(--dc-bg-modifier-active)" : "var(--dc-bg-modifier-hover)" }}
          >
            {selectedChild ? (
              <>
                <ChildAvatar gender={selectedChild.gender} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedChild.name}</p>
                  <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>Age {selectedChild.age}</p>
                </div>
              </>
            ) : (
              <>
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--dc-bg-modifier-hover)" }}>
                  <User className="w-3.5 h-3.5" style={{ color: "var(--dc-text-muted)" }} />
                </span>
                <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>No child selected</p>
              </>
            )}
            <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${childOpen ? "rotate-180" : ""}`}
              style={{ color: "var(--dc-text-muted)" }} />
          </button>

          {childOpen && children && children.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-2xl overflow-hidden z-50 border"
              style={{ background: "var(--dc-bg-floating)", borderColor: "var(--dc-border)" }}>
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelect(child.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 transition text-left"
                  style={{
                    background: child.id === selectedChildId ? "var(--dc-bg-modifier-selected)" : "transparent",
                    color: child.id === selectedChildId ? "white" : "var(--dc-text-normal)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = child.id === selectedChildId ? "var(--dc-bg-modifier-selected)" : "transparent")}
                >
                  <ChildAvatar gender={child.gender} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>Age {child.age}</p>
                  </div>
                  {child.id === selectedChildId && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--dc-green)" }} />
                  )}
                </button>
              ))}
              <div className="border-t px-3 py-2.5" style={{ borderColor: "var(--dc-border)" }}>
                <Link href="/settings" onClick={onClose}
                  className="text-xs font-medium transition hover:underline"
                  style={{ color: "var(--dc-blurple)" }}>
                  Manage children → 
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-2 px-1" style={{ color: "var(--dc-text-muted)" }}>
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "var(--dc-bg-modifier-selected)" : "transparent",
                color: active ? "white" : "var(--dc-text-muted)",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--dc-bg-modifier-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--dc-text-normal)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--dc-text-muted)";
                }
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <span className="ml-auto w-1 h-4 rounded-full" style={{ background: "var(--dc-blurple)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t flex items-center gap-2.5" style={{ borderColor: "var(--dc-border)", background: "var(--dc-bg-tertiary)" }}>
        <UserButton />
        <p className="text-sm font-medium text-white flex-1 min-w-0 truncate">Account</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{ width: "var(--sidebar-width)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg transition"
          style={{ color: "var(--dc-text-muted)" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5865f2, #4752c4)" }}>
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Busy Brains</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 h-full shadow-2xl"
            style={{ background: "var(--dc-bg-secondary)" }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
