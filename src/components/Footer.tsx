"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Shield className="h-6 w-6 text-primary" />
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; {currentYear} RetailSec AI. Developed by{" "}
                        <a
                            href="https://github.com/Mhmd-Aslam"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
                        >
                            Mhmd Aslam
                        </a>
                        . All rights reserved.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/analyze"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Analyze
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </footer>
    );
}
