"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/api/analytics")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <p className="text-sm text-muted-foreground">Visualize trends and flag hotspots before they spread.</p>
          </div>

          {error ? <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle>Cases by Status</CardTitle>
              <div className="h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#e17c05" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardTitle>Hotspot Detection</CardTitle>
              <CardDescription>Flagged when 5+ complaints share department and category.</CardDescription>
              <div className="mt-4 space-y-2">
                {(data?.hotspots || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hotspots detected.</p>
                ) : (
                  data.hotspots.map((hotspot, idx) => (
                    <div key={idx} className="rounded border border-border p-3">
                      <p className="font-medium">{hotspot.department}</p>
                      <p className="text-sm text-muted-foreground">{hotspot.category}</p>
                      <Badge tone="warning" className="mt-2">{hotspot.count} complaints</Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle>Cases by Department</CardTitle>
              <div className="h-72 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis allowDecimals={false} />
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
                  <BarChart data={data?.byCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#73af48" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>
      </AppShell>
    </ProtectedPage>
  );
}
