"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DemoContextType {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("retailsec_demo_mode");
        if (stored) {
            setIsDemoMode(JSON.parse(stored));
        }
    }, []);

    const toggleDemoMode = () => {
        setIsDemoMode(prev => {
            const newValue = !prev;
            localStorage.setItem("retailsec_demo_mode", JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemoMode() {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error("useDemoMode must be used within a DemoProvider");
    }
    return context;
}
