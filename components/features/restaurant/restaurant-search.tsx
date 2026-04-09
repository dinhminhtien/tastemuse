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

const DISTRICTS = ['Ninh Kiều', 'Cái Răng', 'Ô Môn', 'Bình Thủy', 'Thốt Nốt']

export function RestaurantSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
        searchParams.get('districts')?.split(',').filter(Boolean) || []
    )

    const handleSearch = () => {
        const params = new URLSearchParams()

        if (searchTerm) {
            params.set('search', searchTerm)
        }

        if (selectedDistricts.length > 0) {
            params.set('districts', selectedDistricts.join(','))
        }

        const queryString = params.toString()
        router.push(queryString ? `/restaurants?${queryString}` : '/restaurants')
    }

    const handleClear = () => {
        setSearchTerm('')
        setSelectedDistricts([])
        router.push('/restaurants')
    }

    const toggleDistrict = (district: string) => {
        setSelectedDistricts(prev =>
            prev.includes(district)
                ? prev.filter(d => d !== district)
                : [...prev, district]
        )
    }

    // Dynamic search - triggers on searchTerm or selectedDistricts change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, selectedDistricts])

    const hasFilters = searchTerm || selectedDistricts.length > 0

    return (
        <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm nhà hàng..."
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
                            {selectedDistricts.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                    {selectedDistricts.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Quận/Huyện</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {DISTRICTS.map((district) => (
                            <DropdownMenuCheckboxItem
                                key={district}
                                checked={selectedDistricts.includes(district)}
                                onCheckedChange={() => toggleDistrict(district)}
                            >
                                {district}
                            </DropdownMenuCheckboxItem>
                        ))}
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
