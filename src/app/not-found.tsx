"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users back to the landing page (/)
    router.replace("/");
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="animate-pulse text-sm text-slate-400">Loading...</div>
    </div>
  );
}
