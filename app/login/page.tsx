"use client";

import { User, Role } from '../../types';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "../../components/FormInput";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "../../lib/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);
  try {
    const response = await api.post("/auth/login", null, {
      params: {
        Email: data.email,
        password: data.password,
      },
    });

    const token = response.data;
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userEmail =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      payload.email ||
      data.email;

    const userRole =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.role ||
      "User";

    // ✅ JWT has no user ID — fetch it from the users API using the token
    let userId: string | null = null;
    try {
      const usersRes = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle all response shapes
      const list = Array.isArray(usersRes.data)
        ? usersRes.data
        : Array.isArray(usersRes.data?.data)
        ? usersRes.data.data
        : Array.isArray(usersRes.data?.items)
        ? usersRes.data.items
        : [];

      const me = list.find(
        (u: { email: string; id: string }) =>
          u.email?.toLowerCase() === userEmail?.toLowerCase()
      );

      if (me?.id) userId = me.id;
    } catch {
      console.warn("Could not fetch user ID from users API");
    }

    const user: User = {
      id: userId ?? "",
      name: userEmail,
      email: userEmail,
      role: userRole as Role,
      createdAt: new Date().toISOString(),
      tenantId: payload.tenantId || payload.TenantId || "",
    };

    login(token, user);
    toast.success("Login successful");
    router.push("/");
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string }; status?: number } };
    console.log("Login failed:", err.response?.status, err.response?.data);
    toast.error(err.response?.data?.message || "Invalid credentials");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 mb-4 shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            BlogOps
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            Log into your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md shadow-primary/30 hover:bg-primary/90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : "Sign in to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}