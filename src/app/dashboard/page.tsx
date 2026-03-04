"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, getAlerts, clearAlerts, saveAlert } from "@/lib/storage";
import { AlertTriangle, CheckCircle, Clock, Shield, Trash2, Download, Search, Filter, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SeverityBarChart, ThreatTypePieChart } from "@/components/Charts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { downloadReport } from "@/lib/reportGenerator";
import { Loader2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
    const [securityAlerts, setSecurityAlerts] = useState<Alert[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState<"severity" | "threatType" | "threatScore" | "timestamp">("severity");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const { toast } = useToast();

    useEffect(() => {
        setSecurityAlerts(getAlerts());
    }, []);

    const handleClear = () => {
        clearAlerts();
        setSecurityAlerts([]);
        setIsClearDialogOpen(false);
        toast({
            title: "Dashboard Cleared",
            message: "All security alerts have been removed from local storage.",
            type: "info"
        });
    };

    const handleExport = (format: "json" | "csv") => {
        if (format === "json") {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(securityAlerts, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "security_alerts.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } else {
            const headers = ["ID", "Timestamp", "Severity", "Type", "Source IP", "Score", "Description"];
            const csvContent = [
                headers.join(","),
                ...securityAlerts.map(a => [
                    a.id,
                    a.timestamp,
                    a.severity,
                    a.threatType || "Unknown",
                    a.sourceIp,
                    a.threatScore || 0,
                    `"${a.description.replace(/"/g, '""')}"`
                ].join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "security_alerts.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredAlerts = useMemo(() => {
        const severityRank: Record<string, number> = { "critical": 4, "high": 3, "medium": 2, "low": 1 };

        return securityAlerts
            .filter(alert => {
                const matchesSearch =
                    alert.sourceIp.includes(searchTerm) ||
                    alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (alert.threatType && alert.threatType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (alert.aiExplanation && alert.aiExplanation.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;

                return matchesSearch && matchesSeverity;
            })
            .sort((a, b) => {
                let comparison = 0;

                if (sortBy === "severity") {
                    comparison = (severityRank[a.severity] || 0) - (severityRank[b.severity] || 0);
                } else if (sortBy === "threatScore") {
                    comparison = (a.threatScore || 0) - (b.threatScore || 0);
                } else if (sortBy === "timestamp") {
                    comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                } else if (sortBy === "threatType") {
                    comparison = (a.threatType || "").localeCompare(b.threatType || "");
                }

                return sortOrder === "asc" ? comparison : -comparison;
            });
    }, [securityAlerts, searchTerm, severityFilter, sortBy, sortOrder]);

    /**
     * Aggregates alert data into Key Performance Indicators (KPIs).
     */
    const kpi = useMemo(() => {
        const total = securityAlerts.length;
        const critical = securityAlerts.filter(a => a.severity === "critical" || a.severity === "high").length;

        const typeCounts: Record<string, number> = {};
        securityAlerts.forEach(a => {
            const t = a.threatType || "Unknown";
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const topThreat = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

        const ipCounts: Record<string, number> = {};
        securityAlerts.forEach(a => {
            ipCounts[a.sourceIp] = (ipCounts[a.sourceIp] || 0) + 1;
        });
        const topIp = Object.entries(ipCounts).sort((a, b) => b[1] - a[1])[0];

        const actionsTaken = securityAlerts.filter(a => a.actionTaken).length;

        return {
            total,
            critical,
            topThreat: topThreat ? `${topThreat[0]} (${topThreat[1]})` : "N/A",
            topIp: topIp ? topIp[0] : "N/A",
            activeStatus: total > 0 && critical > 0 ? "Under Attack" : "Secure",
            actionsTaken
        };
    }, [securityAlerts]);

    /**
     * Normalizes alert data for visualization in charts.
     */
    const severityData = useMemo(() => {
        const counts = { critical: 0, high: 0, medium: 0, low: 0 };
        securityAlerts.forEach(a => {
            if (a.severity in counts) counts[a.severity as keyof typeof counts]++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
    }, [securityAlerts]);

    const threatTypeData = useMemo(() => {
        const counts: Record<string, number> = {};
        securityAlerts.forEach(a => {
            const t = a.threatType || "Other";
            counts[t] = (counts[t] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Extract top 5 threats for visual clarity
    }, [securityAlerts]);

    /**
     * Executes a simulated IP block by updating alert status in local persistence.
     */
    const handleBlockIp = (alert: Alert) => {
        const updatedAlerts = securityAlerts.map(a => {
            if (a.id === alert.id) {
                return { ...a, actionTaken: true, actionTimestamp: new Date().toISOString() };
            }
            return a;
        });

        clearAlerts();
        updatedAlerts.forEach(saveAlert);

        setSecurityAlerts(updatedAlerts);
        setSelectedAlert(prev => prev ? { ...prev, actionTaken: true, actionTimestamp: new Date().toISOString() } : null);

        toast({
            title: "Action Executed",
            message: `Simulated Action: Blocked IP ${alert.sourceIp} on Firewall.`,
            type: "success"
        });
    };

    const handleSort = (key: typeof sortBy) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("desc"); // Default to desc when changing keys
        }
    };

    const SortIcon = ({ column }: { column: typeof sortBy }) => {
        if (sortBy !== column) return <span className="ml-1 opacity-20">↕</span>;
        return sortOrder === "asc" ? <span className="ml-1 text-primary">↑</span> : <span className="ml-1 text-primary">↓</span>;
    };


    return (
        <div className="container py-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
                    <p className="text-muted-foreground">Real-time overview of security posture.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadReport(securityAlerts)} disabled={securityAlerts.length === 0}>
                        <FileText className="mr-2 h-4 w-4" /> Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={securityAlerts.length === 0}>
                        <Download className="mr-2 h-4 w-4" /> JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={securityAlerts.length === 0}>
                        <Download className="mr-2 h-4 w-4" /> CSV
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsClearDialogOpen(true)} disabled={securityAlerts.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{kpi.critical}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actions Taken</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{kpi.actionsTaken}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security Posture</CardTitle>
                        <ShieldCheck className={`h-4 w-4 ${kpi.activeStatus === "Secure" ? "text-green-500" : "text-amber-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpi.activeStatus === "Secure" ? "text-green-500" : "text-amber-500"}`}>
                            {kpi.activeStatus}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Threat</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={kpi.topThreat}>{kpi.topThreat}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Attacking IP</CardTitle>
                        <CheckCircle className={`h-4 w-4 ${kpi.activeStatus === "Secure" ? "text-green-500" : "text-amber-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{kpi.topIp}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Area */}
            {securityAlerts.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mb-8">
                    <Card className="lg:col-span-4 transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle>Threat Types Distribution</CardTitle>
                            <CardDescription>Breakdown of detected incidents by category.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThreatTypePieChart data={threatTypeData} />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3 transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle>Severity Breakdown</CardTitle>
                            <CardDescription>Alert count by severity level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeverityBarChart data={severityData} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="mb-8 border-dashed">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No Alerts Found</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Run a log analysis or simulate an attack to see security metrics and distribution.
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/analyze">Go to Analysis</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Config & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-end md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search IP, description, threat type..."
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 group">
                    <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <select
                        className="h-9 w-[160px] rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-primary/50 transition-all cursor-pointer font-medium"
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="flex md:hidden items-center gap-2 group w-full">
                    <Activity className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <select
                        className="h-9 flex-1 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-primary/50 transition-all cursor-pointer font-medium"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <option value="severity">Sort: Severity</option>
                        <option value="threatScore">Sort: Score</option>
                        <option value="timestamp">Sort: Time</option>
                        <option value="threatType">Sort: Type</option>
                    </select>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                        {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                </div>
                <div className="ml-auto text-sm text-muted-foreground hidden md:block">
                    Showing {filteredAlerts.length} of {securityAlerts.length} alerts
                </div>
            </div>

            {/* Alerts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Alerts Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden md:block w-full overflow-auto max-h-[600px]">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th
                                            className="h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                            onClick={() => handleSort("severity")}
                                        >
                                            Severity <SortIcon column="severity" />
                                        </th>
                                        <th
                                            className="h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                            onClick={() => handleSort("threatType")}
                                        >
                                            Type <SortIcon column="threatType" />
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                                        <th
                                            className="h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                            onClick={() => handleSort("threatScore")}
                                        >
                                            Score <SortIcon column="threatScore" />
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Source IP</th>
                                        <th
                                            className="h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                            onClick={() => handleSort("timestamp")}
                                        >
                                            Time <SortIcon column="timestamp" />
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredAlerts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="h-24 text-center">
                                                No alerts found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAlerts.map((alert) => (
                                            <tr key={alert.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle">
                                                    <Badge
                                                        variant={alert.severity as "critical" | "high" | "medium" | "low"}
                                                        className="w-20 justify-center"
                                                    >
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    {alert.threatType || "Unknown"}
                                                    {alert.aiConfidence && <span className="ml-1 text-[10px] text-blue-500">★</span>}
                                                </td>
                                                <td className="p-4 align-middle max-w-[300px] truncate" title={alert.description}>{alert.description}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <span className={
                                                            (alert.threatScore || 0) > 80 ? "text-red-500 font-bold" :
                                                                (alert.threatScore || 0) > 50 ? "text-yellow-500 font-bold" : ""
                                                        }>
                                                            {alert.threatScore || "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle font-mono">{alert.sourceIp}</td>
                                                <td className="p-4 align-middle whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                                                <td className="p-4 align-middle">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(alert)}>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y">
                            {filteredAlerts.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No alerts found matching your criteria.
                                </div>
                            ) : (
                                filteredAlerts.map((alert) => (
                                    <div key={alert.id} className="p-4 space-y-3" onClick={() => setSelectedAlert(alert)}>
                                        <div className="flex justify-between items-start">
                                            <Badge variant={alert.severity as "critical" | "high" | "medium" | "low"}>
                                                {alert.severity.toUpperCase()}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">
                                                {alert.threatType || "Unknown"}
                                                {alert.aiConfidence && <span className="ml-1 text-[10px] text-blue-500">★</span>}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{alert.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <div className="text-xs font-mono text-muted-foreground">
                                                {alert.sourceIp}
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 text-xs">View Details</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Dialog reused from similar logic, or we can just import the Dialog from component if generic */}
            <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
                {selectedAlert && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                {selectedAlert.threatType}
                                <Badge variant={selectedAlert.severity as "critical" | "high" | "medium" | "low"}>
                                    {selectedAlert.severity.toUpperCase()}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                Incident ID: {selectedAlert.id}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                            {/* AI Section if present */}
                            {selectedAlert.aiExplanation && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <span className="text-xl">🤖</span> AI Analysis
                                        {selectedAlert.aiConfidence && <span className="text-xs font-normal text-muted-foreground">(Conf: {selectedAlert.aiConfidence}%)</span>}
                                    </h4>
                                    <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-blue-500">
                                        {selectedAlert.aiExplanation}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Description</h4>
                                <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                            </div>

                            {/* Mitigation */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Recommended Actions</h4>
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-lg p-3 text-sm">
                                    <pre className="whitespace-pre-wrap font-sans text-red-800 dark:text-red-200">
                                        {selectedAlert.recommendedAction || "No specific actions recommended."}
                                    </pre>
                                </div>
                            </div>

                            {/* Evidence */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Technical Evidence</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                    {selectedAlert.evidence?.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                            <div className="flex gap-2">
                                {!selectedAlert.actionTaken ? (
                                    <Button variant="destructive" onClick={() => handleBlockIp(selectedAlert)}>
                                        <Shield className="mr-2 h-4 w-4" /> Simulate Block IP
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> Action Taken
                                    </Badge>
                                )}
                            </div>
                            <Button variant="secondary" onClick={() => setSelectedAlert(null)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </Dialog>

            {/* Clear Confirmation Dialog */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Alerts?</DialogTitle>
                        <DialogDescription>
                            This action will permanently remove all security alerts from your dashboard. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsClearDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleClear}>Clear Everything</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
