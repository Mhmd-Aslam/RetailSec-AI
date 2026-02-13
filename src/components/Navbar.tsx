"use strict";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <ShieldCheck className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            RetailSec AI
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Home
                        </Link>
                        <Link
                            href="/analyze"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Analyze
                        </Link>
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items could go here */}
                    </div>
                    <nav className="flex items-center">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="https://github.com/retailsec/ai" target="_blank" rel="noreferrer">
                                <span className="sr-only">GitHub</span>
                                {/* GitHub Icon could go here if needed, but keeping it minimal */}
                            </Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
