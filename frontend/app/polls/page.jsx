"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

export default function PollsPage() {
  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState("");

  const canCreate = useMemo(() => ["secretariat", "admin"].includes(user?.role), [user]);
  const canVote = useMemo(() => user?.role === "staff", [user]);

  const loadPolls = async () => {
    const data = await apiRequest("/api/polls");
    setPolls(data);
  };

  useEffect(() => {
    setUser(getSessionUser());
    loadPolls().catch((err) => setError(err.message));
  }, []);

  const createPoll = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/api/polls", {
        method: "POST",
        body: JSON.stringify({ question, options: options.filter(Boolean) }),
      });
      setQuestion("");
      setOptions(["", ""]);
      await loadPolls();
    } catch (err) {
      setError(err.message);
    }
  };

  const vote = async (pollId, optionId) => {
    setError("");
    try {
      await apiRequest("/api/polls/vote", {
        method: "POST",
        body: JSON.stringify({ pollId, optionId }),
      });
      await loadPolls();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Pulse Polls</h2>
            <p className="text-sm text-muted-foreground">Create polls and capture one vote per staff member.</p>
          </div>

          {error ? <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

          {canCreate ? (
            <Card>
              <CardTitle>Create Poll</CardTitle>
              <form className="mt-3 space-y-2" onSubmit={createPoll}>
                <Input placeholder="Poll question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                {options.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const next = [...options];
                      next[index] = e.target.value;
                      setOptions(next);
                    }}
                    required
                  />
                ))}
                <Button type="button" variant="outline" onClick={() => setOptions([...options, ""])}>Add Option</Button>
                <Button type="submit" className="ml-2">Create Poll</Button>
              </form>
            </Card>
          ) : null}

          <div className="space-y-4">
            {polls.map((poll) => (
              <Card key={poll._id}>
                <CardTitle>{poll.question}</CardTitle>
                <CardDescription>
                  Created on {new Date(poll.createdAt).toLocaleDateString()}
                </CardDescription>
                {canVote ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {poll.options.map((option) => (
                      <Button key={option._id} variant="outline" onClick={() => vote(poll._id, option._id)}>
                        {option.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Only staff accounts can cast votes.</p>
                )}
                <div className="mt-4 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={poll.options.map((option) => ({ option: option.text, votes: option.votes }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="option" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#1d6996" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </AppShell>
    </ProtectedPage>
  );
}
