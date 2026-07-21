"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { ApiError } from '@/src/lib/enums/exception/api-error';
import { usersApi } from '@/src/lib/modules/api';
import { clearToken } from "@/src/lib/modules/storage/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getMe()
      .then((user) => setEmail(user.email))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
        }
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-sm">{email}</p>
          )}
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}