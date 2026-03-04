"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDemoMode } from "@/lib/demoContext";
import { Zap, ZapOff, Menu, X as CloseIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

export function Navbar() {
    const { isDemoMode, toggleDemoMode } = useDemoMode();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-14 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            RetailSec AI
                        </span>
                        {isDemoMode && (
                            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500 bg-amber-500/10">
                                DEMO MODE
                            </Badge>
                        )}
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
                    <nav className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDemoMode}
                            className={isDemoMode ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground"}
                            title={isDemoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
                        >
                            {isDemoMode ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
                        </Button>
                        <ThemeToggle />
                        
                        {/* Mobile Menu Toggle */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden ml-2" 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b bg-background px-4 py-4 animate-in slide-in-from-top duration-200">
                    <nav className="flex flex-col space-y-4">
                        <Link 
                            href="/" 
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/analyze" 
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Analyze
                        </Link>
                        <Link 
                            href="/dashboard" 
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <div className="pt-2 border-t flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Demo Mode</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    toggleDemoMode();
                                    setMobileMenuOpen(false);
                                }}
                                className={isDemoMode ? "border-amber-500 text-amber-500" : ""}
                            >
                                {isDemoMode ? "Enabled" : "Disabled"}
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </nav>
    );
}
