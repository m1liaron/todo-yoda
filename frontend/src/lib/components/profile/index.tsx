"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/src/lib/components/ui/button";
import { clearToken } from "@/src/lib/modules/storage/auth";
import { useAuth } from "@/src/lib/providers/AuthProvider";

export function ProfileBar() {
  const router = useRouter();
  const { user } = useAuth();  

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="absolute right-4 top-4 flex items-center gap-3">
      {user?.email && (
        <Link href="/profile" className="text-sm text-muted-foreground hover:underline">
          {user?.email}
        </Link>
      )}
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
}