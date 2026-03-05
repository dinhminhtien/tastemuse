"use client"

interface UsageIndicatorProps {
    used: number
    limit: number   // -1 = unlimited
    isPremium: boolean
}

export function UsageIndicator({ used, limit, isPremium }: UsageIndicatorProps) {
    if (isPremium || limit === -1) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    ✨ Premium
                </span>
            </div>
        )
    }

    const remaining = Math.max(0, limit - used)
    const percentage = limit > 0 ? (used / limit) * 100 : 0

    // Color coding: green → yellow → red
    let colorClass = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    let barColor = "bg-emerald-500"

    if (percentage >= 80) {
        colorClass = "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
        barColor = "bg-red-500"
    } else if (percentage >= 50) {
        colorClass = "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
        barColor = "bg-yellow-500"
    }

    return (
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${colorClass}`}>
            {/* Mini progress bar */}
            <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">
                {remaining}/{limit}
            </span>
        </div>
    )
}
