"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { getAlerts, saveAlert, generateMockAlert, Alert } from "@/lib/storage";
import Link from "next/link";

export default function AnalyzePage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [generatedAlerts, setGeneratedAlerts] = useState<Alert[]>([]);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setComplete(false);

        // Simulate processing time
        setTimeout(() => {
            const newAlerts: Alert[] = [];
            const count = Math.floor(Math.random() * 3) + 1; // Generate 1-3 alerts

            for (let i = 0; i < count; i++) {
                const alert = generateMockAlert();
                // Customize mock alert a bit
                alert.timestamp = new Date().toISOString();
                if (i === 0) alert.severity = "high"; // Ensure at least one high severity for demo

                saveAlert(alert);
                newAlerts.push(alert);
            }

            setGeneratedAlerts(newAlerts);
            setIsAnalyzing(false);
            setComplete(true);
        }, 2500);
    };

    return (
        <div className="container py-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Threat Analysis</h1>
                    <p className="text-muted-foreground">
                        Upload server logs to identify potential security incidents.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Area */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Log Ingestion</CardTitle>
                            <CardDescription>
                                Supported formats: .log, .csv, .json, .txt
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={!isAnalyzing ? handleAnalyze : undefined}
                            >
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-lg font-medium">Analyzing log patterns...</p>
                                        <p className="text-sm text-muted-foreground">Applying heuristic analysis...</p>
                                    </div>
                                ) : complete ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <CheckCircle className="h-12 w-12 text-green-500" />
                                        <p className="text-lg font-medium">Analysis Complete</p>
                                        <p className="text-sm text-muted-foreground">
                                            {generatedAlerts.length} potential threats identified.
                                        </p>
                                        <div className="flex gap-4 mt-4">
                                            <Button onClick={() => setComplete(false)} variant="outline">
                                                Analyze Another File
                                            </Button>
                                            <Button asChild>
                                                <Link href="/dashboard">View Dashboard</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                                            <UploadCloud className="h-8 w-8 text-primary" />
                                        </div>
                                        <p className="text-lg font-medium">Click to upload log file</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            or drag and drop here
                                        </p>
                                        <Button className="mt-6" onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}>
                                            Start Analysis
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Preview (only nice to have, maybe mock terminal output) */}
                {!complete && !isAnalyzing && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-xs text-muted-foreground p-4 bg-muted rounded-md h-32 overflow-hidden flex flex-col justify-end">
                                <p>System initialized...</p>
                                <p>Waiting for input stream...</p>
                                <p className="animate-pulse">_</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
