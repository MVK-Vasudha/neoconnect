"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export default function SubmitPage() {
  const [form, setForm] = useState({
    category: "Safety",
    department: "",
    location: "",
    severity: "Low",
    description: "",
    anonymous: false,
  });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (file) body.append("file", file);

      const data = await apiRequest("/api/cases", { method: "POST", body });
      setSuccess(`Complaint submitted successfully. Tracking ID: ${data.trackingId}`);
      setForm({
        category: "Safety",
        department: "",
        location: "",
        severity: "Low",
        description: "",
        anonymous: false,
      });
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage roles={["staff", "admin"]}>
      <AppShell>
        <Card className="max-w-3xl space-y-4">
          <div>
            <CardTitle>Submit Complaint</CardTitle>
            <CardDescription>Share concerns safely with optional anonymity and file evidence.</CardDescription>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Safety</option>
              <option>Policy</option>
              <option>Facilities</option>
              <option>HR</option>
              <option>Other</option>
            </Select>
            <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Select>
            <Textarea placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="flex items-center gap-2 text-sm">
              <input
                id="anonymous"
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
              />
              <label htmlFor="anonymous">Submit anonymously</label>
            </div>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

            {success ? <p className="rounded bg-emerald-100 p-2 text-sm text-emerald-700">{success}</p> : null}
            {error ? <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </Card>
      </AppShell>
    </ProtectedPage>
  );
}
