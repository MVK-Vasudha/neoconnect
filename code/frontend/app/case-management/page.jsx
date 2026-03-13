"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, THead, TH, TD } from "@/components/ui/table";
import { getSessionUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

export default function CaseManagementPage() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseManagers, setCaseManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState({});
  const [statusInput, setStatusInput] = useState({});
  const [noteInput, setNoteInput] = useState({});
  const [error, setError] = useState("");

  const isSecretariat = useMemo(() => ["secretariat", "admin"].includes(user?.role), [user]);
  const isCaseManager = useMemo(() => ["caseManager", "admin"].includes(user?.role), [user]);

  const loadCases = async () => {
    const data = await apiRequest("/api/cases");
    setCases(data);
  };

  useEffect(() => {
    const loggedInUser = getSessionUser();
    setUser(loggedInUser);

    loadCases().catch((err) => setError(err.message));

    if (["secretariat", "admin"].includes(loggedInUser?.role)) {
      apiRequest("/api/auth/users?role=caseManager")
        .then(setCaseManagers)
        .catch((err) => setError(err.message));
    }
  }, []);

  const assignCase = async (caseId) => {
    try {
      setError("");
      const caseManagerId = selectedManager[caseId];
      if (!caseManagerId) throw new Error("Please choose a case manager first.");
      await apiRequest("/api/cases/assign", {
        method: "PUT",
        body: JSON.stringify({ caseId, caseManagerId }),
      });
      await loadCases();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (caseId) => {
    try {
      setError("");
      await apiRequest("/api/cases/update-status", {
        method: "PUT",
        body: JSON.stringify({
          caseId,
          status: statusInput[caseId] || "In Progress",
          note: noteInput[caseId] || "",
        }),
      });
      await loadCases();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ProtectedPage roles={["secretariat", "caseManager", "admin"]}>
      <AppShell>
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">Case Management</h2>
            <p className="text-sm text-muted-foreground">Assign, update, and resolve complaints based on your role.</p>
          </div>
          {error ? <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

          <Card>
            <CardTitle>Active Cases</CardTitle>
            <div className="mt-3 overflow-x-auto">
              <Table>
                <THead>
                  <tr>
                    <TH>Tracking ID</TH>
                    <TH>Category</TH>
                    <TH>Department</TH>
                    <TH>Status</TH>
                    <TH>Assigned To</TH>
                    <TH>Actions</TH>
                  </tr>
                </THead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item._id}>
                      <TD>{item.trackingId}</TD>
                      <TD>{item.category}</TD>
                      <TD>{item.department}</TD>
                      <TD>{item.status}</TD>
                      <TD>{item.assignedTo?.name || "Unassigned"}</TD>
                      <TD>
                        <div className="space-y-2">
                          {isSecretariat ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <Select
                                className="max-w-[220px]"
                                value={selectedManager[item._id] || ""}
                                onChange={(e) => setSelectedManager({ ...selectedManager, [item._id]: e.target.value })}
                              >
                                <option value="">Assign manager</option>
                                {caseManagers.map((manager) => (
                                  <option key={manager._id} value={manager._id}>
                                    {manager.name}
                                  </option>
                                ))}
                              </Select>
                              <Button onClick={() => assignCase(item._id)} variant="outline">Assign</Button>
                            </div>
                          ) : null}

                          {isCaseManager ? (
                            <div className="space-y-2">
                              <Select
                                value={statusInput[item._id] || item.status}
                                onChange={(e) => setStatusInput({ ...statusInput, [item._id]: e.target.value })}
                              >
                                <option>Assigned</option>
                                <option>In Progress</option>
                                <option>Pending</option>
                                <option>Resolved</option>
                                <option>Escalated</option>
                              </Select>
                              <Textarea
                                placeholder="Add note"
                                value={noteInput[item._id] || ""}
                                onChange={(e) => setNoteInput({ ...noteInput, [item._id]: e.target.value })}
                              />
                              <Button onClick={() => updateStatus(item._id)}>Update</Button>
                            </div>
                          ) : null}
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </section>
      </AppShell>
    </ProtectedPage>
  );
}
