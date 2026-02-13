"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, FileJson, ShieldAlert, Activity, Database, Save, Play, FileText } from "lucide-react";
import { saveAlert, Alert } from "@/lib/storage";
import { analyzeLogs, LogEntry } from "@/lib/threatEngine";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { downloadReport } from "@/lib/reportGenerator";
import { generateMaliciousLogs } from "@/lib/attackSimulator";
import { useDemoMode } from "@/lib/demoContext";
// Actually my Dialog.tsx exports { Dialog, ... } but usage is often <Dialog open={...}><DialogContent>...
// My Dialog.tsx above puts content directly in Dialog. Let's adjust usage to match my simple implementation or update component.
// The simple implementation I wrote has `children` directly in `Dialog`.
// Let's stick to the implementation I wrote: <Dialog open={...} onOpenChange={...}> <DialogHeader>... </Dialog>

export default function AnalyzePage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [generatedAlerts, setGeneratedAlerts] = useState<Alert[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [logsCount, setLogsCount] = useState(0);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([]);
    const { isDemoMode } = useDemoMode();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const loadSampleData = async () => {
        try {
            const response = await fetch("/sample_logs.json");
            if (!response.ok) throw new Error("Failed to load sample data");
            const blob = await response.blob();
            const file = new File([blob], "sample_logs.json", { type: "application/json" });
            processFile(file);
        } catch (error) {
            console.error(error);
            alert("Could not load sample data. Ensure public/sample_logs.json exists.");
        }
    };

    const processFile = (file: File) => {
        setFileName(file.name);
        setIsAnalyzing(true);
        setComplete(false);
        setGeneratedAlerts([]);
        setIsSaved(false);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const logs = JSON.parse(content);

                // Basic Validation
                if (!Array.isArray(logs) || logs.length === 0 || !logs[0].timestamp || !logs[0].ip) {
                    throw new Error("Invalid schema");
                }

                setLogsCount(logs.length);

                // Simulate processing delay
                // In a real app, we might chunk this or send to backend
                setTimeout(() => {
                    setCurrentLogs(logs as LogEntry[]);
                    const { alerts } = analyzeLogs(logs as LogEntry[]);
                    setGeneratedAlerts(alerts);
                    setIsAnalyzing(false);
                    setComplete(true);

                    // Trigger AI enrichment
                    enrichAlertsWithAI(alerts);
                }, isDemoMode ? 500 : 2000);

            } catch (error) {
                console.error("Failed to parse", error);
                window.alert("Invalid JSON format or schema. Expected standard log entries.");
                setIsAnalyzing(false);
                setFileName(null);
            }
        };
        reader.readAsText(file);
    };

    const enrichAlertsWithAI = async (currentAlerts: Alert[]) => {
        const { generateThreatExplanation } = await import("@/lib/groqClient");
        // Process top 5 high/critical alerts
        const priorityAlerts = currentAlerts
            .filter(a => a.severity === "critical" || a.severity === "high")
            .slice(0, 5);

        for (const alert of priorityAlerts) {
            try {
                const aiResult = await generateThreatExplanation(alert);
                setGeneratedAlerts(prev => prev.map(a => {
                    if (a.id === alert.id) {
                        return {
                            ...a,
                            aiExplanation: aiResult.explanation,
                            aiConfidence: aiResult.confidence,
                            recommendedAction: (a.recommendedAction || "") + "\n\n" + aiResult.mitigationSteps.join("\n")
                        };
                    }
                    return a;
                }));
            } catch (e) {
                console.error("AI enrichment failed", e);
            }
        }
    };

    const handleSaveResults = () => {
        generatedAlerts.forEach(saveAlert);
        setIsSaved(true);
        window.alert("Results saved to Dashboard!");
    };

    const handleSimulateAttack = () => {
        if (currentLogs.length === 0) return;

        const lastLogTime = currentLogs[currentLogs.length - 1].timestamp;
        const maliciousLogs = generateMaliciousLogs(lastLogTime);
        const newLogs = [...currentLogs, ...maliciousLogs];

        setCurrentLogs(newLogs);
        setLogsCount(newLogs.length);

        // Re-analyze
        const { alerts } = analyzeLogs(newLogs);
        setGeneratedAlerts(alerts);
        enrichAlertsWithAI(alerts);

        window.alert(`Simulated Attack Injected! Added ${maliciousLogs.length} malicious logs.`);
    };

    const stats = {
        total: generatedAlerts.length,
        critical: generatedAlerts.filter(a => a.severity === "critical" || a.severity === "high").length,
        types: new Set(generatedAlerts.map(a => a.threatType)).size
    };

    return (
        <div className="container py-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Threat Analysis</h1>
                        <p className="text-muted-foreground">Log ingestion and automated threat detection engine.</p>
                    </div>
                    {!isAnalyzing && !complete && (
                        <Button variant="outline" onClick={loadSampleData}>
                            <Play className="mr-2 h-4 w-4" /> Load Sample Data
                        </Button>
                    )}
                </div>

                {!complete && (
                    <Card className="border-dashed border-2">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center p-12 text-center relative min-h-[300px]">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isAnalyzing}
                                />
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                                            <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Analyzing {fileName}</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            Running heuristic analysis on {logsCount} log entries...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-full bg-primary/10 p-6 mb-6">
                                            <UploadCloud className="h-10 w-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Upload Log File</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            Drag and drop your JSON log file here, or click to browse.
                                            <br />Supported format: JSON Array of LogEntry.
                                        </p>
                                        <Button className="pointer-events-none">Select File</Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {complete && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Logs Processed</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{logsCount}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Critical/High</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Threat Types</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.types}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                            <div className="text-sm text-muted-foreground">
                                Analysis completed for <strong>{fileName}</strong>. Review alerts below.
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setComplete(false); setFileName(null); }}>
                                    Analyze New File
                                </Button>
                                <Button variant="outline" onClick={() => downloadReport(generatedAlerts)}>
                                    <FileText className="mr-2 h-4 w-4" /> Report
                                </Button>
                                <Button variant="destructive" onClick={handleSimulateAttack}>
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Simulate Attack
                                </Button>
                                <Button onClick={handleSaveResults} disabled={isSaved}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaved ? "Saved" : "Save Results"}
                                </Button>
                            </div>
                        </div>

                        {/* Alerts List */}
                        <div className="grid gap-4">
                            {generatedAlerts.map((alert) => (
                                <Card
                                    key={alert.id}
                                    className="cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => setSelectedAlert(alert)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Badge variant={alert.severity as "critical" | "high" | "medium" | "low"} className="w-20 justify-center">
                                                {alert.severity.toUpperCase()}
                                            </Badge>
                                            <div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    {alert.threatType}
                                                    {alert.aiConfidence && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                                            AI
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{alert.description}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-muted-foreground">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </div>
                                            <div className="w-24 text-right">
                                                <span className="font-mono font-bold text-lg">{alert.threatScore}</span>
                                                <span className="text-xs text-muted-foreground ml-1">Score</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
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
                                    Detected at {new Date(selectedAlert.timestamp).toLocaleString()} from {selectedAlert.sourceIp}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                {/* AI Section */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <span className="text-xl">🤖</span> AI Analysis
                                        {selectedAlert.aiConfidence && <span className="text-xs font-normal text-muted-foreground">(Confidence: {selectedAlert.aiConfidence}%)</span>}
                                    </h4>
                                    {selectedAlert.aiExplanation ? (
                                        <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedAlert.aiExplanation}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                                            {(selectedAlert.severity === 'high' || selectedAlert.severity === 'critical') ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                            {(selectedAlert.severity === 'high' || selectedAlert.severity === 'critical') ? "Analyzing with Groq Llama-3..." : "AI analysis skipped for low severity."}
                                        </div>
                                    )}
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

                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setSelectedAlert(null)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </Dialog>
            </div>
        </div>
    );
}
