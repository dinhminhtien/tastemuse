export default function Loading() {
    return (
        <main className="min-h-screen">
            {/* Hero skeleton */}
            <section className="relative overflow-hidden hero-gradient py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="h-12 w-3/4 mx-auto bg-muted animate-pulse rounded-lg" />
                        <div className="h-6 w-1/2 mx-auto bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </section>

            {/* Grid skeleton */}
            <section className="py-12 section-alt">
                <div className="container mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-border overflow-hidden"
                            >
                                <div className="aspect-[4/3] bg-muted animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
