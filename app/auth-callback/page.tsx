"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token) {
      router.replace("/");
      return;
    }

    // ✅ Call Zustand login so isAuthenticated becomes true
    login(token, {
      id: "",
      email: email ?? "",
      role: "SuperAdmin",
      createdAt: new Date().toISOString(),
      name: email ?? "",
      initials: email ? email[0].toUpperCase() : "A",
    });

    localStorage.setItem("token", token);
    localStorage.setItem("isAuthenticated", "true");
    if (email) localStorage.setItem("email", email);

    // ✅ Redirect inside useEffect — never during render
    router.replace("/");
  }, [router, login]);

  // ✅ Always show loading — never conditionally call router during render
  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging you in...
    </div>
  );
}