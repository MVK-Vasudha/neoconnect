"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submit", label: "Submit Complaint", roles: ["staff", "admin"] },
  { href: "/case-management", label: "Case Management", roles: ["secretariat", "caseManager", "admin"] },
  { href: "/polls", label: "Polls" },
  { href: "/analytics", label: "Analytics" },
  { href: "/public-hub", label: "Public Hub" },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, [pathname]);

  const visibleLinks = useMemo(() => {
    if (!user) return links;
    return links.filter((link) => !link.roles || link.roles.includes(user.role));
  }, [user]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-primary">NeoConnect</h1>
            <p className="text-xs text-muted-foreground">Staff Feedback & Complaint Management</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  pathname === link.href ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.name} ({user.role})</span>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
              </>
            ) : (
              <Button onClick={() => router.push("/login")} variant="outline">Login</Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
