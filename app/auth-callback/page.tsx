"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";

// ✅ Minimal JWT payload decode (no extra dependency) — used only to read the
// user id claim issued by the backend; token itself is still verified server-side.
function decodeJwtUserId(token: string): string {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      json.id ||
      json.sub ||
      json.userId ||
      json.nameid ||
      json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      ""
    );
  } catch {
    return "";
  }
}

import { Role } from "../../types";

function decodeJwtRole(token: string): Role {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    const role =
      json.role ||
      json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      "User";
    return (["SuperAdmin", "Admin", "Editor", "User"] as const).includes(role)
      ? (role as Role)
      : "User";
  } catch {
    return "User";
  }
}

function decodeJwtEmail(token: string): string {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      json.email ||
      json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      json.name ||
      json.unique_name ||
      ""
    );
  } catch {
    return "";
  }
}

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

    const resolvedEmail = email || decodeJwtEmail(token);

    // ✅ Call Zustand login so isAuthenticated becomes true
    login(token, {
      id: decodeJwtUserId(token),
      email: resolvedEmail,
      role: decodeJwtRole(token),
      createdAt: new Date().toISOString(),
      name: resolvedEmail,
      initials: resolvedEmail ? resolvedEmail[0].toUpperCase() : "A",
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