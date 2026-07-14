"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    localStorage.removeItem("auth-store");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("tenant-store");
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    localStorage.setItem("force-logout", Date.now().toString());

    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging out...
    </div>
  );
}