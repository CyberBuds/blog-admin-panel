"use client";

import { useAuthStore } from "../store/useAuthStore";
import { Users, FileText, Eye, ThumbsUp } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import useSWR from "swr";
import { fetcher, analyticsApi } from "../lib/services";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { data: dashboardData, error } = useSWR(
    isAuthenticated ? analyticsApi.getDashboard() : null, 
    fetcher
  );

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here is an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Blogs", value: dashboardData?.totalBlogs || "0", icon: FileText, change: "Current" },
          { title: "Total Users", value: dashboardData?.totalUsers || "0", icon: Users, change: "Current" },
          { title: "Total Views", value: dashboardData?.totalViews || "0", icon: Eye, change: "Current" },
          { title: "Total Likes", value: dashboardData?.totalLikes || "0", icon: ThumbsUp, change: "Current" },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground/80 mt-1">
              <span className="text-emerald-500 font-medium">{stat.change}</span> tracking period
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 border border-border bg-card rounded-xl shadow-sm p-6">
          <h3 className="font-medium mb-4">Traffic Overview</h3>
          <div className="h-[300px] w-full">
            {dashboardData?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 border border-border bg-card rounded-xl shadow-sm p-6">
          <h3 className="font-medium mb-4">Recent Activity</h3>
          <div className="space-y-6">
            {!dashboardData?.recentActivity?.length ? (
              <div className="text-sm text-muted-foreground">No recent activity detected.</div>
            ) : (
              dashboardData.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.timeAgo}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
