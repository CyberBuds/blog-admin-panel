"use client";

import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore";
import { Users, FileText, Eye, ThumbsUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher, analyticsApi } from "../lib/services";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { activeTenantId, tenants } = useTenantStore(); // ✅ use activeTenantId 
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // ✅ Derive selectedTenant from activeTenantId + tenants array
  const selectedTenant = tenants.find(t => t.id === activeTenantId) ?? null;

  const apiUrl = isAuthenticated
    ? analyticsApi.getDashboard(activeTenantId) // ✅ pass activeTenantId
    : null;

  const { data: dashboardData, isLoading } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const stats = [
    { title: "Total Blogs", value: dashboardData?.totalBlogs ?? "—", icon: FileText },
    { title: "Total Users", value: dashboardData?.totalUsers ?? "—", icon: Users },
    { title: "Total Views", value: dashboardData?.totalViews ?? "—", icon: Eye },
    { title: "Total Likes", value: dashboardData?.totalLikes ?? "—", icon: ThumbsUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}.{" "}
          {selectedTenant
            ? <><strong className="text-foreground">{selectedTenant.name}</strong> workspace.</>
            : <><strong className="text-foreground">All workspaces</strong> combined.</>
          }
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {isLoading
                ? <span className="animate-pulse text-muted-foreground">...</span>
                : stat.value}
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1">
              <span className="text-emerald-500 font-medium">
                {selectedTenant ? selectedTenant.name : "All Workspaces"}
              </span>{" "}tracking period
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 border border-border bg-card rounded-xl shadow-sm p-6">
          <h3 className="font-medium mb-1">Traffic Overview</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {selectedTenant ? selectedTenant.name : "All Workspaces"}
          </p>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
                Loading chart...
              </div>
            ) : dashboardData?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.05)" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 border border-border bg-card rounded-xl shadow-sm p-6">
          <h3 className="font-medium mb-1">Recent Activity</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {selectedTenant ? selectedTenant.name : "All Workspaces"}
          </p>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
            ) : !dashboardData?.recentActivity?.length ? (
              <div className="text-sm text-muted-foreground">No recent activity.</div>
            ) : (
              dashboardData.recentActivity.map(
                (a: { title: string; description: string; timeAgo: string }, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{a.timeAgo}</div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}