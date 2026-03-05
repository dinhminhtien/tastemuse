"use client"

import { useState, useEffect } from "react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Search,
    Edit,
    UtensilsCrossed,
    Store as RestaurantIcon,
    Loader2,
    Save,
    X,
    Plus,
    RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import type { Restaurant, Dish } from "@/lib/supabase"

type EntityType = "restaurant" | "dish"

export default function ManageDataPage() {
    const [activeTab, setActiveTab] = useState<EntityType>("restaurant")
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [dishes, setDishes] = useState<(Dish & { restaurants?: { name: string } })[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Edit Modal State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingEntity, setEditingEntity] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            const endpoint = activeTab === "restaurant" ? "/api/restaurants" : "/api/dishes"
            const res = await fetch(endpoint)
            const result = await res.json()
            if (result.success) {
                if (activeTab === "restaurant") {
                    setRestaurants(result.data || [])
                } else {
                    setDishes(result.data || [])
                }
            } else {
                toast.error(`Lỗi khi tải danh sách: ${result.error}`)
            }
        } catch (error) {
            toast.error("Lỗi kết nối server")
        } finally {
            setLoading(false)
        }
    }

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredDishes = dishes.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.restaurants?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleEdit = (entity: any) => {
        setEditingEntity({ ...entity })
        setIsEditDialogOpen(true)
    }

    const handleSave = async () => {
        if (!editingEntity) return
        setIsSaving(true)
        try {
            const endpoint = activeTab === "restaurant"
                ? `/api/restaurants/${editingEntity.id}`
                : `/api/dishes/${editingEntity.id}`

            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingEntity)
            })

            const result = await res.json()
            if (result.success) {
                toast.success("Cập nhật thành công!")
                setIsEditDialogOpen(false)
                fetchData() // Refresh list
            } else {
                toast.error(`Lỗi: ${result.error}`)
            }
        } catch (error) {
            toast.error("Lỗi kết nối server")
        } finally {
            setIsSaving(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setEditingEntity((prev: any) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="container mx-auto py-24 px-4 min-h-screen space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black gradient-text tracking-tight">Quản lý dữ liệu</h1>
                    <p className="text-muted-foreground font-medium text-lg">Cập nhật thông tin Nhà hàng và Món ăn trong hệ thống.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchData}
                        disabled={loading}
                        className="rounded-xl border-2 hover:bg-primary/5 transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder={`Tìm ${activeTab === "restaurant" ? "nhà hàng" : "món ăn"}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 w-full md:w-80 border-2 rounded-xl focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="restaurant" onValueChange={(v) => setActiveTab(v as EntityType)} className="space-y-6">
                <TabsList className="bg-card/60 backdrop-blur-md border-2 p-1 rounded-2xl h-16 w-full md:w-auto overflow-hidden">
                    <TabsTrigger value="restaurant" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold text-base h-full">
                        <RestaurantIcon className="w-5 h-5 mr-3" />
                        Nhà hàng
                    </TabsTrigger>
                    <TabsTrigger value="dish" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold text-base h-full">
                        <UtensilsCrossed className="w-5 h-5 mr-3" />
                        Món ăn
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="restaurant" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-2 shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden card-glow">
                        <CardHeader className="bg-primary/5 border-b-2">
                            <CardTitle>Danh sách Nhà hàng</CardTitle>
                            <CardDescription>Tìm thấy {filteredRestaurants.length} nhà hàng.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b-2">
                                            <TableHead className="font-bold uppercase tracking-wider pl-6">Tên nhà hàng</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider">Địa chỉ</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-center">Quận</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-center">Mô tả</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-center">Giá</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-center">Trạng thái</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-right pr-6">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                                                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                                        <p className="font-bold text-lg">Đang tải dữ liệu...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredRestaurants.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Search className="w-12 h-12 text-muted-foreground/30" />
                                                        <p className="font-bold text-lg text-muted-foreground italic truncate">Không tìm thấy nhà hàng nào khớp với tìm kiếm.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRestaurants.map((r) => (
                                                <TableRow key={r.id} className="hover:bg-primary/5 transition-colors group">
                                                    <TableCell className="font-bold text-base pl-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span>{r.name}</span>
                                                            <span className="text-xs text-muted-foreground font-normal mt-0.5">{r.slug}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs">
                                                        <p className="text-sm font-medium line-clamp-2">{r.address}, {r.ward}, {r.district ? r.district + ', ' : ''}{r.city}</p>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {r.district ? (
                                                            <Badge className="bg-green-500 rounded-md">Có</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="rounded-md">Thiếu</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {r.description && r.description !== "Quán ăn địa phương" ? (
                                                            <Badge className="bg-green-500 rounded-md">Xong</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="rounded-md">Thiếu</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center whitespace-nowrap">
                                                        {r.min_price && r.max_price ? (
                                                            <span className="text-sm font-medium">{r.min_price / 1000}k - {r.max_price / 1000}k</span>
                                                        ) : (
                                                            <Badge variant="secondary" className="rounded-md">Thiếu</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={r.is_active ? "default" : "destructive"} className={`rounded-lg shadow-sm border-2 ${r.is_active ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                                            {r.is_active ? "Đang hoạt động" : "Ngừng HĐ"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(r)}
                                                            className="rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm font-bold"
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Sửa
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dish" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-2 shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden card-glow">
                        <CardHeader className="bg-orange-500/5 border-b-2">
                            <CardTitle>Danh sách Món ăn</CardTitle>
                            <CardDescription>Tìm thấy {filteredDishes.length} món ăn.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b-2">
                                            <TableHead className="font-bold uppercase tracking-wider pl-6">Món ăn</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider">Nhà hàng</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-center">Đặc trưng</TableHead>
                                            <TableHead className="font-bold uppercase tracking-wider text-right pr-6">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                                                        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                                                        <p className="font-bold text-lg">Đang tải dữ liệu...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredDishes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Search className="w-12 h-12 text-muted-foreground/30" />
                                                        <p className="font-bold text-lg text-muted-foreground italic truncate">Không tìm thấy món ăn nào khớp với tìm kiếm.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDishes.map((d) => (
                                                <TableRow key={d.id} className="hover:bg-orange-500/5 transition-colors group">
                                                    <TableCell className="font-bold text-base pl-6 py-5">
                                                        {d.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <RestaurantIcon className="w-4 h-4 text-muted-foreground" />
                                                            {d.restaurants?.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {d.is_signature ? (
                                                            <Badge className="bg-orange-500 text-white rounded-lg shadow-sm border-0 uppercase tracking-tighter font-black">
                                                                ⭐ Signature
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground/40 text-sm">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(d)}
                                                            className="rounded-lg border-2 hover:bg-orange-500 hover:text-white transition-all shadow-sm font-bold"
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Sửa
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl border-2 rounded-2xl shadow-2xl p-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary via-secondary to-accent" />

                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-3xl font-black gradient-text">
                            {activeTab === "restaurant" ? "Cập nhật Nhà hàng" : "Cập nhật Món ăn"}
                        </DialogTitle>
                        <DialogDescription className="text-base font-semibold text-muted-foreground">
                            Chỉnh sửa thông tin chi tiết. Thay đổi sẽ được cập nhật vào database và đồng bộ RAG.
                        </DialogDescription>
                    </DialogHeader>

                    {editingEntity && (
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tên {activeTab === "restaurant" ? "nhà hàng" : "món ăn"}</Label>
                                    <Input
                                        value={editingEntity.name || ""}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="h-12 border-2 rounded-xl focus:ring-primary/20 text-lg font-bold"
                                    />
                                </div>

                                {activeTab === "restaurant" ? (
                                    <>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ (Số nhà & Đường)</Label>
                                            <Input
                                                value={editingEntity.address || ""}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Phường/Xã</Label>
                                            <Input
                                                value={editingEntity.ward || ""}
                                                onChange={(e) => handleInputChange("ward", e.target.value)}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quận/Huyện</Label>
                                            <Input
                                                value={editingEntity.district || ""}
                                                onChange={(e) => handleInputChange("district", e.target.value)}
                                                className="h-12 border-2 rounded-xl shadow-inner-white"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thành phố</Label>
                                            <Input
                                                value={editingEntity.city || ""}
                                                onChange={(e) => handleInputChange("city", e.target.value)}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</Label>
                                            <Input
                                                value={editingEntity.phone || ""}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mô tả</Label>
                                            <Textarea
                                                value={editingEntity.description || ""}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                className="min-h-24 border-2 rounded-xl resize-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Giá tối thiểu</Label>
                                            <Input
                                                type="number"
                                                value={editingEntity.min_price || 0}
                                                onChange={(e) => handleInputChange("min_price", parseInt(e.target.value))}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Giá tối đa</Label>
                                            <Input
                                                type="number"
                                                value={editingEntity.max_price || 0}
                                                onChange={(e) => handleInputChange("max_price", parseInt(e.target.value))}
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-3 pt-4">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={editingEntity.is_active}
                                                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                                                className="w-5 h-5 accent-primary"
                                            />
                                            <Label htmlFor="is_active" className="text-lg font-bold cursor-pointer">Đang hoạt động</Label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nhà hàng</Label>
                                            <div className="p-4 bg-muted/30 rounded-xl border-2 italic font-medium flex items-center gap-2">
                                                <RestaurantIcon className="w-5 h-5 text-muted-foreground" />
                                                {editingEntity.restaurants?.name}
                                                <span className="text-xs font-normal text-muted-foreground">(Không thể thay đổi nhà hàng ở đây)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 pt-4">
                                            <input
                                                type="checkbox"
                                                id="is_signature"
                                                checked={editingEntity.is_signature}
                                                onChange={(e) => handleInputChange("is_signature", e.target.checked)}
                                                className="w-5 h-5 accent-orange-500"
                                            />
                                            <Label htmlFor="is_signature" className="text-lg font-bold cursor-pointer flex items-center gap-2">
                                                ⭐ Món đặc trưng (Signature)
                                            </Label>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-8 pt-4 bg-muted/10 border-t-2 gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="h-12 px-6 rounded-xl font-bold hover:bg-muted"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`h-12 px-8 rounded-xl font-black shadow-lg transition-all hover:-translate-y-1 ${activeTab === 'dish' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            LƯU THAY ĐỔI
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
