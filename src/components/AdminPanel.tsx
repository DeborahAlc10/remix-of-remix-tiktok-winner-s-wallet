import { useState, useCallback } from "react";
import {
  Shield,
  Mail,
  FileText,
  Building,
  Calendar,
  RefreshCw,
  Lock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminUser {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  withdrawalMethod: string | null;
  loginTs: number;
  lastSeenTs: number | null;
  createdAt: string;
  daysSinceLogin: number;
}

type SortField = "createdAt" | "daysSinceLogin" | "email" | "docsSubmitted" | "bankSubmitted";
type SortDir = "asc" | "desc";

function flowStage(user: AdminUser): { label: string; color: "warning" | "success" | "destructive" } {
  if (!user.docsSubmitted) return { label: "Documents", color: "warning" };
  if (!user.bankSubmitted) return { label: "Bank details", color: "warning" };
  if (user.daysSinceLogin >= 7) return { label: "Day 7 - Failed", color: "destructive" };
  if (user.daysSinceLogin >= 3) return { label: "Day 3+ - Approved", color: "success" };
  return { label: "Processing", color: "warning" };
}

function formatDate(ts: number | string): string {
  const date = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatDateTime(ts: number | string): string {
  const date = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const AdminPanel = () => {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchUsers = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("user-progress", {
      body: { action: "listAll", adminPassword: pw },
    });
    if (fnError) {
      const status = (fnError as { context?: { status?: number } }).context?.status;
      if (status === 401) {
        setError("Wrong admin password.");
      } else {
        setError("Failed to load data.");
      }
      setLoading(false);
      return;
    }
    setUsers(data?.users ?? []);
    setAuthed(true);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(password);
  };

  const handleRefresh = () => fetchUsers(password);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...users].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "email":
        cmp = a.email.localeCompare(b.email);
        break;
      case "daysSinceLogin":
        cmp = a.daysSinceLogin - b.daysSinceLogin;
        break;
      case "docsSubmitted":
        cmp = Number(a.docsSubmitted) - Number(b.docsSubmitted);
        break;
      case "bankSubmitted":
        cmp = Number(a.bankSubmitted) - Number(b.bankSubmitted);
        break;
      case "createdAt":
      default:
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const stats = {
    total: users.length,
    docsDone: users.filter((u) => u.docsSubmitted).length,
    bankDone: users.filter((u) => u.bankSubmitted).length,
    day7Plus: users.filter((u) => u.daysSinceLogin >= 7).length,
  };

  // --- Login gate ---
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
              autoFocus
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={!password || loading}>
              {loading ? "Verifying..." : "Access Panel"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- Admin dashboard ---
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />
    ) : null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold tracking-tight">Admin Panel</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={stats.total} />
          <StatCard label="Docs Submitted" value={stats.docsDone} accent="warning" />
          <StatCard label="Bank Submitted" value={stats.bankDone} accent="success" />
          <StatCard label="Day 7+ (Failed)" value={stats.day7Plus} accent="destructive" />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {loading && users.length === 0 ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No users registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort("email")}>
                      Email <SortIcon field="email" />
                    </th>
                    <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort("createdAt")}>
                      Joined <SortIcon field="createdAt" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort("docsSubmitted")}>
                      Docs <SortIcon field="docsSubmitted" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort("bankSubmitted")}>
                      Bank <SortIcon field="bankSubmitted" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort("daysSinceLogin")}>
                      Day <SortIcon field="daysSinceLogin" />
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Flow Stage</th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((user) => {
                    const stage = flowStage(user);
                    return (
                      <tr key={user.email} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.email}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.userName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {user.docsSubmitted ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">No</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {user.bankSubmitted ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">No</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold tabular-nums">{user.daysSinceLogin}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              stage.color === "success"
                                ? "bg-success/10 text-success border-success/20 text-[10px]"
                                : stage.color === "destructive"
                                ? "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                                : "bg-warning/10 text-warning border-warning/20 text-[10px]"
                            }
                          >
                            {stage.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {user.lastSeenTs ? formatDateTime(user.lastSeenTs) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Docs = submitted documents</span>
          <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Bank = submitted bank details</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Day = days since login</span>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "warning" | "success" | "destructive";
}) {
  const colorClass =
    accent === "success"
      ? "text-success"
      : accent === "destructive"
      ? "text-destructive"
      : accent === "warning"
      ? "text-warning"
      : "text-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
    </div>
  );
}

export default AdminPanel;
