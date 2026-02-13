"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, getAlerts, clearAlerts } from "@/lib/storage";
import { AlertTriangle, CheckCircle, Clock, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
    const [securityAlerts, setSecurityAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        setSecurityAlerts(getAlerts());
    }, []);

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all alerts?")) {
            clearAlerts();
            setSecurityAlerts([]);
        }
    };

    const highSeverityCount = securityAlerts.filter((a) => a.severity === "high" || a.severity === "critical").length;
    const newCount = securityAlerts.filter((a) => a.status === "new").length;

    return (
        <div className="container py-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
                    <p className="text-muted-foreground">Real-time overview of security posture.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleClear} disabled={securityAlerts.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear History
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{securityAlerts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{highSeverityCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Incidents</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newCount}</div>
                        <p className="text-xs text-muted-foreground">
                            In the last 24 hours
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Active</div>
                        <p className="text-xs text-muted-foreground">
                            All sensors operational
                        </p>
                    </CardContent>
                </Card>
            </div>


            {/* Charts Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-end justify-between gap-2 px-4">
                            {[35, 60, 45, 70, 50, 80, 65, 40, 55, 75, 60, 90].map((h, i) => (
                                <div key={i} className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors relative group">
                                    <div
                                        className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow border">
                                        {h * 10} reqs
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 px-4 text-xs text-muted-foreground">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Threat Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center">
                            <div className="relative h-40 w-40 rounded-full border-8 border-muted flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-r-transparent rotate-45"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{highSeverityCount}</div>
                                    <div className="text-xs text-muted-foreground">Critical</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-primary"></div>
                                <span>Detected</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-muted"></div>
                                <span>Safe</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Severity</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Score</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Source IP</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {securityAlerts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="h-24 text-center">
                                                No alerts found. Run an analysis to generate data.
                                            </td>
                                        </tr>
                                    ) : (
                                        securityAlerts.map((alert) => (
                                            <tr key={alert.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle">
                                                    <Badge
                                                        variant={
                                                            alert.severity === "critical" || alert.severity === "high" ? "destructive" :
                                                                alert.severity === "medium" ? "secondary" : "default"
                                                        }
                                                        className={
                                                            alert.severity === "low" ? "bg-blue-500 hover:bg-blue-600 border-transparent text-white" : ""
                                                        }
                                                    >
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle font-medium">{alert.threatType || "Unknown"}</td>
                                                <td className="p-4 align-middle">{alert.description}</td>
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
                                                <td className="p-4 align-middle">{alert.sourceIp}</td>
                                                <td className="p-4 align-middle">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                                                <td className="p-4 align-middle">
                                                    <Button variant="ghost" size="sm" onClick={() => window.alert(`Details:\n${alert.evidence?.join("\n") || "No evidence"}\n\nAction:\n${alert.recommendedAction || "None"}`)}>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
