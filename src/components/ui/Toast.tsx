"use client"

import * as React from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
    id: string
    title?: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toast: (props: Omit<Toast, "id">) => void
    dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const toast = React.useCallback(({ title, message, type, duration = 3000 }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, title, message, type, duration }])

        if (duration !== Infinity) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }
    }, [])

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ title, message, type, onDismiss }: Toast & { onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    }

    const backgrounds = {
        success: "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900",
        error: "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900",
        warning: "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900",
        info: "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900",
    }

    return (
        <div className={cn(
            "pointer-events-auto flex w-full items-start gap-4 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300",
            backgrounds[type]
        )}>
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1">
                {title && <h5 className="font-semibold text-sm mb-1">{title}</h5>}
                <p className="text-sm opacity-90">{message}</p>
            </div>
            <button onClick={onDismiss} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}
