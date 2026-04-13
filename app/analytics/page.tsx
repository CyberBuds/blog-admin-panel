"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const trafficData = [
  { name: "Mon", views: 4000, visitors: 2400 },
  { name: "Tue", views: 3000, visitors: 1398 },
  { name: "Wed", views: 2000, visitors: 9800 },
  { name: "Thu", views: 2780, visitors: 3908 },
  { name: "Fri", views: 1890, visitors: 4800 },
  { name: "Sat", views: 2390, visitors: 3800 },
  { name: "Sun", views: 3490, visitors: 4300 },
];

const deviceData = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 300 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your traffic and audience metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border bg-card rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="w-full mb-4">
            <h3 className="font-medium text-lg">Traffic Trends</h3>
            <p className="text-sm text-muted-foreground">Views vs Unique Visitors</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="w-full mb-4">
            <h3 className="font-medium text-lg">Device Breakdown</h3>
            <p className="text-sm text-muted-foreground">Where your traffic is coming from</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
