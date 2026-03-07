import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Activity,
    Trophy,
    CreditCard,
    Cpu
} from "lucide-react"

const navItems = [
    {
        title: "Tổng quan",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        exact: true
    },
    {
        title: "Tăng trưởng & Giữ chân",
        href: "/admin/dashboard/growth",
        icon: Users,
    },
    {
        title: "AI & Chatbot",
        href: "/admin/dashboard/ai",
        icon: Cpu,
    },
    {
        title: "Cộng đồng & Nội dung",
        href: "/admin/dashboard/community",
        icon: Trophy,
    },
    {
        title: "Doanh thu (Freemium)",
        href: "/admin/dashboard/monetization",
        icon: CreditCard,
    },
    {
        title: "Hệ thống & Tìm kiếm",
        href: "/admin/dashboard/system",
        icon: Activity,
    }
]

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
            {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap border-2",
                            isActive
                                ? "bg-primary text-primary-foreground border-primary pointer-events-none"
                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-slate-500")} />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}
