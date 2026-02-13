"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, FileJson } from "lucide-react";
import { saveAlert, Alert } from "@/lib/storage";
import { analyzeLogs, LogEntry } from "@/lib/threatEngine";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function AnalyzePage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [generatedAlerts, setGeneratedAlerts] = useState<Alert[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsAnalyzing(true);
        setComplete(false);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const logs = JSON.parse(event.target?.result as string) as LogEntry[];

                // Simulate processing delay for effect
                setTimeout(() => {
                    const { alerts } = analyzeLogs(logs);

                    // Save all alerts
                    alerts.forEach(saveAlert);

                    setGeneratedAlerts(alerts);
                    setIsAnalyzing(false);
                    setComplete(true);

                    // Trigger AI enrichment
                    enrichAlertsWithAI(alerts);
                }, 2000);

            } catch (error) {
                console.error("Failed to parse log file", error);
                alert("Invalid JSON log file");
                setIsAnalyzing(false);
                setFileName(null);
            }
        };
        reader.readAsText(file);
    };

    const enrichAlertsWithAI = async (currentAlerts: Alert[]) => {
        // Dynamic import to avoid server-side issues
        const { generateThreatExplanation } = await import("@/lib/groqClient");

        // Process a few indicative alerts to save tokens/time
        const criticalAlerts = currentAlerts
            .filter(a => a.severity === "critical" || a.severity === "high")
            .slice(0, 3);

        for (const alert of criticalAlerts) {
            try {
                const aiResult = await generateThreatExplanation(alert);

                // Update state with new info
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

    return (
        <div className="container py-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Threat Analysis</h1>
                    <p className="text-muted-foreground">
                        Upload server logs (JSON) to identify potential security incidents.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Area */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Log Ingestion</CardTitle>
                            <CardDescription>
                                Supported interaction: Upload <code>sample_logs.json</code>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center hover:bg-muted/50 transition-colors relative"
                            >
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isAnalyzing}
                                />

                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-lg font-medium">Analyzing {fileName}...</p>
                                        <p className="text-sm text-muted-foreground">Running correlation engine...</p>
                                    </div>
                                ) : complete ? (
                                    <div className="flex flex-col items-center gap-4 z-10 pointer-events-none">
                                        <CheckCircle className="h-12 w-12 text-green-500" />
                                        <p className="text-lg font-medium">Analysis Complete</p>
                                        <p className="text-sm text-muted-foreground">
                                            {generatedAlerts.length} threats identified in {fileName}.
                                        </p>
                                        <div className="flex gap-4 mt-4 pointer-events-auto">
                                            <Button onClick={() => { setComplete(false); setFileName(null); }} variant="outline">
                                                Analyze Another File
                                            </Button>
                                            <Button asChild>
                                                <Link href="/dashboard">View Dashboard</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pointer-events-none">
                                        <div className="rounded-full bg-primary/10 p-4 mb-4 inline-block">
                                            <UploadCloud className="h-8 w-8 text-primary" />
                                        </div>
                                        <p className="text-lg font-medium">Click to upload log file</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            or drag and drop .json file here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Preview */}
                {complete && generatedAlerts.length > 0 && (
                    <div className="grid gap-4">
                        <h2 className="text-xl font-semibold">Detected Threats</h2>
                        {generatedAlerts.slice(0, 3).map((alert) => (
                            <Card key={alert.id} className="border-l-4 border-l-red-500">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="destructive">{alert.severity.toUpperCase()}</Badge>
                                                <span className="text-sm text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
                                            </div>
                                            <CardTitle className="text-lg">{alert.threatType}: {alert.description}</CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{alert.threatScore}</div>
                                            <div className="text-xs text-muted-foreground">Risk Score</div>
                                            {alert.aiConfidence && (
                                                <div className="text-xs font-bold text-blue-500 mt-1">AI: {alert.aiConfidence}%</div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p><span className="font-semibold text-foreground">Source:</span> {alert.sourceIp}</p>

                                        {alert.aiExplanation ? (
                                            <div className="bg-muted/50 p-3 rounded border border-blue-200 dark:border-blue-900 my-2">
                                                <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400 font-semibold">
                                                    <span>🤖 AI Analysis</span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-foreground text-xs leading-relaxed">{alert.aiExplanation}</p>
                                            </div>
                                        ) : (
                                            (alert.severity === "high" || alert.severity === "critical") && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground italic my-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Generating AI explanation...
                                                </div>
                                            )
                                        )}

                                        <div>
                                            <span className="font-semibold text-foreground">Evidence:</span>
                                            <ul className="list-disc pl-4 mt-1 text-xs">
                                                {alert.evidence?.map((e, i) => (
                                                    <li key={i}>{e}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-2 text-xs">
                                            <span className="font-semibold text-foreground">Recommended Action:</span>
                                            <pre className="whitespace-pre-wrap font-sans mt-1 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200">
                                                {alert.recommendedAction}
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
