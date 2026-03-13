"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, isAuthenticated } from "@/lib/auth";

export default function ProtectedPage({ children, roles }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const user = getSessionUser();
    if (roles && user && !roles.includes(user.role)) {
      router.replace("/dashboard");
      return;
    }

    setAllowed(true);
  }, [roles, router]);

  if (!allowed) {
    return <div className="p-6 text-sm text-muted-foreground">Checking access...</div>;
  }

  return children;
}
