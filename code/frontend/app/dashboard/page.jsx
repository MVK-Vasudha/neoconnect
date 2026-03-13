"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

const COLORS = ["#1d6996", "#73af48", "#e17c05", "#c13b24", "#7a5195", "#ef5675"];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [cases, setCases] = useState([]);
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, caseData, pollData] = await Promise.all([
          apiRequest("/api/analytics"),
          apiRequest("/api/cases"),
          apiRequest("/api/polls"),
        ]);
        setAnalytics(analyticsData);
        setCases(caseData.slice(0, 6));
        setPolls(pollData.slice(0, 3));
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, []);

  const statusCards = useMemo(() => analytics?.byStatus || [], [analytics]);

  return (
    <ProtectedPage>
      <AppShell>
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
            <p className="text-sm text-muted-foreground">Track complaints, trends, and team pulse at a glance.</p>
          </div>

          {error ? <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-4 md:grid-cols-3">
            {statusCards.map((item) => (
              <Card key={item.status}>
                <CardDescription>{item.status}</CardDescription>
                <CardTitle className="text-3xl">{item.count}</CardTitle>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle>Cases by Department</CardTitle>
              <div className="h-72 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.byDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1d6996" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardTitle>Cases by Category</CardTitle>
              <div className="h-72 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics?.byCategory || []} dataKey="count" nameKey="category" outerRadius={100}>
                      {(analytics?.byCategory || []).map((entry, index) => (
                        <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle>Recent Complaints</CardTitle>
              <div className="mt-3 space-y-2">
                {cases.length === 0 ? <p className="text-sm text-muted-foreground">No complaints yet.</p> : null}
                {cases.map((item) => (
                  <div key={item._id} className="rounded-md border border-border p-3">
                    <p className="font-medium">{item.trackingId}</p>
                    <p className="text-sm text-muted-foreground">{item.department} • {item.category}</p>
                    <Badge className="mt-2">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle>Recent Polls</CardTitle>
              <div className="mt-3 space-y-2">
                {polls.length === 0 ? <p className="text-sm text-muted-foreground">No polls yet.</p> : null}
                {polls.map((poll) => (
                  <div key={poll._id} className="rounded-md border border-border p-3">
                    <p className="font-medium">{poll.question}</p>
                    <p className="text-sm text-muted-foreground">{poll.options.length} options</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </AppShell>
    </ProtectedPage>
  );
}
