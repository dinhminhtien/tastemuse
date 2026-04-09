import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
    searchParams?: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
    if (totalPages <= 1) return null

    // Build URL with preserved search params
    function buildUrl(page: number) {
        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && key !== "page") params.set(key, value)
        })
        if (page > 1) params.set("page", String(page))
        const qs = params.toString()
        return `${basePath}${qs ? `?${qs}` : ""}`
    }

    // Generate page numbers to show
    function getPageNumbers(): (number | "...")[] {
        const pages: (number | "...")[] = []
        const delta = 2 // pages around current

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
            return pages
        }

        // Always show first page
        pages.push(1)

        const start = Math.max(2, currentPage - delta)
        const end = Math.min(totalPages - 1, currentPage + delta)

        if (start > 2) pages.push("...")

        for (let i = start; i <= end; i++) pages.push(i)

        if (end < totalPages - 1) pages.push("...")

        // Always show last page
        pages.push(totalPages)

        return pages
    }

    const pageNumbers = getPageNumbers()
    const hasPrev = currentPage > 1
    const hasNext = currentPage < totalPages

    return (
        <nav aria-label="Phân trang" className="flex items-center justify-center gap-1 pt-8 pb-4">
            {/* First page */}
            <Link
                href={buildUrl(1)}
                aria-disabled={!hasPrev}
                className={!hasPrev ? "pointer-events-none" : ""}
            >
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasPrev}
                    className="h-9 w-9 hidden sm:inline-flex"
                    aria-label="Trang đầu"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </Link>

            {/* Previous */}
            <Link
                href={buildUrl(currentPage - 1)}
                aria-disabled={!hasPrev}
                className={!hasPrev ? "pointer-events-none" : ""}
            >
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasPrev}
                    className="h-9 w-9"
                    aria-label="Trang trước"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </Link>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 text-muted-foreground select-none">
                            …
                        </span>
                    ) : (
                        <Link key={page} href={buildUrl(page)}>
                            <Button
                                variant={page === currentPage ? "default" : "outline"}
                                size="icon"
                                className={`h-9 w-9 text-sm font-medium ${page === currentPage
                                        ? "shadow-md pointer-events-none"
                                        : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                    }`}
                            >
                                {page}
                            </Button>
                        </Link>
                    )
                )}
            </div>

            {/* Next */}
            <Link
                href={buildUrl(currentPage + 1)}
                aria-disabled={!hasNext}
                className={!hasNext ? "pointer-events-none" : ""}
            >
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasNext}
                    className="h-9 w-9"
                    aria-label="Trang sau"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>

            {/* Last page */}
            <Link
                href={buildUrl(totalPages)}
                aria-disabled={!hasNext}
                className={!hasNext ? "pointer-events-none" : ""}
            >
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasNext}
                    className="h-9 w-9 hidden sm:inline-flex"
                    aria-label="Trang cuối"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </Link>
        </nav>
    )
}
