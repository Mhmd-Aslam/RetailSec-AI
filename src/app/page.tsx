import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldAlert, Activity, FileText, Lock, Database, Search, Brain, FileOutput, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
            Next-Gen Threat Intelligence
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            RetailSec AI
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Advanced security operations center platform for real-time threat detection and analysis.
            Built for enterprise-scale monitoring.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/analyze">
                Start Analysis <Activity className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Autonomous Multi-Agent Core</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Powered by a constellation of specialized AI agents working in concert to detect, analyze, and remediate threats.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 relative z-10">

              {/* Agent 1 */}
              <div className="flex flex-col items-center gap-4 bg-background p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Database className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Log Ingestion</h3>
                  <p className="text-sm text-muted-foreground mt-2">Parses and normalizes raw server logs.</p>
                </div>
                <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                  <ArrowRight className="rotate-90" />
                </div>
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-background rounded-full p-1 border z-20">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Agent 2 */}
              <div className="flex flex-col items-center gap-4 bg-background p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Threat Classification</h3>
                  <p className="text-sm text-muted-foreground mt-2">Identifies known attack signatures.</p>
                </div>
                <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                  <ArrowRight className="rotate-90" />
                </div>
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-background rounded-full p-1 border z-20">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Agent 3 */}
              <div className="flex flex-col items-center gap-4 bg-background p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Activity className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Anomaly Detection</h3>
                  <p className="text-sm text-muted-foreground mt-2">Detects zero-day behavioral outliers.</p>
                </div>
                <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                  <ArrowRight className="rotate-90" />
                </div>
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-background rounded-full p-1 border z-20">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Agent 4 */}
              <div className="flex flex-col items-center gap-4 bg-background p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Response Agent</h3>
                  <p className="text-sm text-muted-foreground mt-2">Generates mitigation strategies using LLMs.</p>
                </div>
                <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                  <ArrowRight className="rotate-90" />
                </div>
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-background rounded-full p-1 border z-20">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Agent 5 */}
              <div className="flex flex-col items-center gap-4 bg-background p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <FileOutput className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Reporting</h3>
                  <p className="text-sm text-muted-foreground mt-2">Compiles executive summaries and alerts.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-24 lg:py-32 mx-auto px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Log Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload and analyze server logs to identify potential security threats and anomalies in real-time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShieldAlert className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Threat Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automated detection of suspicious activities using advanced heuristic algorithms and pattern matching.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Secure Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Local persistence ensures your data is accessible across sessions without compromising privacy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
