"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, THead, TH, TD } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE, apiRequest } from "@/lib/api";
import { getSessionUser, isAuthenticated } from "@/lib/auth";

export default function PublicHubPage() {
  const [resolvedCases, setResolvedCases] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const canUploadMinutes = useMemo(() => ["secretariat", "admin"].includes(user?.role), [user]);

  const loadPublicData = async (query = "") => {
    try {
      const [casesData, minutesData] = await Promise.all([
        apiRequest("/api/cases/resolved/public", { method: "GET" }),
        apiRequest(`/api/minutes${query ? `?search=${encodeURIComponent(query)}` : ""}`, { method: "GET" }),
      ]);
      setResolvedCases(casesData);
      setMinutes(minutesData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setUser(isAuthenticated() ? getSessionUser() : null);
    loadPublicData();
  }, []);

  const uploadMinutes = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const body = new FormData();
      body.append("title", title);
      if (file) body.append("file", file);
      await apiRequest("/api/minutes", { method: "POST", body });
      setTitle("");
      setFile(null);
      await loadPublicData(search);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Public Hub</h2>
          <p className="text-sm text-muted-foreground">Quarterly digest, outcomes, and searchable minutes archive.</p>
        </div>

        {error ? <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

        <Card>
          <CardTitle>Quarterly Digest</CardTitle>
          <CardDescription>
            This quarter focused on faster response workflows, safety action plans, and improved facilities escalation tracking.
          </CardDescription>
        </Card>

        <Card>
          <CardTitle>Resolved Cases</CardTitle>
          <div className="mt-3 space-y-2">
            {resolvedCases.length === 0 ? <p className="text-sm text-muted-foreground">No resolved cases available.</p> : null}
            {resolvedCases.map((item) => (
              <div key={item._id} className="rounded border border-border p-3">
                <p className="font-medium">{item.trackingId} - {item.category}</p>
                <p className="text-sm text-muted-foreground">{item.department}</p>
                <p className="mt-1 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Impact Tracking</CardTitle>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <THead>
                <tr>
                  <TH>Issue Raised</TH>
                  <TH>Action Taken</TH>
                  <TH>What Changed</TH>
                </tr>
              </THead>
              <tbody>
                {resolvedCases.slice(0, 10).map((item) => (
                  <tr key={item._id}>
                    <TD>{item.description}</TD>
                    <TD>{item.notes?.[0]?.content || "Case reviewed and resolved by operations team."}</TD>
                    <TD>{`${item.department} reported closure and monitoring.`}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardTitle>Minutes Archive</CardTitle>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search minutes by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => loadPublicData(search)}>Search</Button>
          </div>

          {canUploadMinutes ? (
            <form className="mt-4 grid gap-2 md:grid-cols-3" onSubmit={uploadMinutes}>
              <Input placeholder="Minutes title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              <Button type="submit">Upload PDF</Button>
            </form>
          ) : null}

          <div className="mt-4 space-y-2">
            {minutes.map((item) => (
              <a
                key={item._id}
                href={`${API_BASE}${item.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded border border-border p-3 hover:bg-muted"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
