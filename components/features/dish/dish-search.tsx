'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DishSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [signatureOnly, setSignatureOnly] = useState(searchParams.get('signature') === 'true')

    const handleSearch = () => {
        const params = new URLSearchParams()

        if (searchTerm) {
            params.set('search', searchTerm)
        }

        if (signatureOnly) {
            params.set('signature', 'true')
        }

        const queryString = params.toString()
        router.push(queryString ? `/dishes?${queryString}` : '/dishes')
    }

    const handleClear = () => {
        setSearchTerm('')
        setSignatureOnly(false)
        router.push('/dishes')
    }

    // Dynamic search - triggers on searchTerm or signatureOnly change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, signatureOnly])

    const hasFilters = searchTerm || signatureOnly

    return (
        <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm món ăn..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-12">
                            <Filter className="w-4 h-4 mr-2" />
                            Lọc
                            {signatureOnly && (
                                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                    1
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Loại món</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={signatureOnly}
                            onCheckedChange={setSignatureOnly}
                        >
                            Chỉ món đặc sản
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                        onClick={handleClear}
                        title="Xóa bộ lọc"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
