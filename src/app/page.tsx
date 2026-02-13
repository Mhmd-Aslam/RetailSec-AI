import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldAlert, Activity, FileText, Lock } from "lucide-react";

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
