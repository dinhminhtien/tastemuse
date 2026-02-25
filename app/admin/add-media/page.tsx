"use client"

import { useState, useEffect, useRef } from "react"
import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ImagePlus, Store as RestaurantIcon, UtensilsCrossed, CheckCircle2, Loader2, Sparkles } from "lucide-react"

interface Entity {
    id: string
    name: string
    restaurants?: {
        name: string
    }
    restaurant_media?: { id: string }[]
    dish_media?: { id: string }[]
}

export default function AddMediaPage() {
    const [type, setType] = useState<"restaurant" | "dish">("restaurant")
    const [entities, setEntities] = useState<Entity[]>([])
    const [selectedId, setSelectedId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null)

    // Refs to avoid closure staleness in the async callback
    const selectedIdRef = useRef(selectedId)
    const typeRef = useRef(type)

    useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
    useEffect(() => { typeRef.current = type }, [type])

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dkqaygsqc"
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"

    useEffect(() => {
        fetchEntities()
    }, [type])

    const fetchEntities = async () => {
        setLoading(true)
        try {
            const endpoint = type === "restaurant" ? "/api/restaurants" : "/api/dishes"
            const res = await fetch(endpoint)
            const result = await res.json()
            if (result.success) {
                setEntities(result.data || [])
            } else {
                toast.error(`Lỗi khi tải danh sách ${type === "restaurant" ? "nhà hàng" : "món ăn"}`)
            }
        } catch (error) {
            toast.error("Lỗi kết nối server")
        } finally {
            setLoading(false)
        }
    }

    const handleUploadSuccess = async (result: any) => {
        console.log(">>> Cloudinary Event triggered:", result.event)
        console.log(">>> Cloudinary Full Result Data:", result)

        if (result.event !== "success") {
            console.log("Cloudinary notification: event is not success, ignoring.")
            return
        }

        setUploading(true)

        const info = result.info
        const mediaUrl = typeof info === 'object' ? (info?.secure_url || info?.url) : null

        const currentId = selectedIdRef.current
        const currentType = typeRef.current

        console.log(">>> Extracted Media URL:", mediaUrl)
        console.log(">>> Current Selection (from refs):", { currentType, currentId })

        if (!mediaUrl) {
            toast.error("Không tìm thấy URL hình ảnh từ Cloudinary")
            setUploading(false)
            return
        }

        if (!currentId) {
            toast.error("Vui lòng chọn đối tượng (Nhà hàng/Món ăn) trước khi tải hình")
            console.error("Critical: currentId is missing during upload success")
            setUploading(false)
            return
        }

        setLastUploadedUrl(mediaUrl)

        try {
            const apiPayload = {
                type: currentType,
                id: currentId,
                media_url: mediaUrl,
                media_type: "image",
                is_primary: currentType === "dish",
                is_cover: currentType === "restaurant",
            }

            console.log(">>> Sending to API /api/media/upload:", apiPayload)

            const res = await fetch("/api/media/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(apiPayload),
            })

            console.log(">>> API Http Status:", res.status)
            const data = await res.json()
            console.log(">>> API Json Response:", data)

            if (data.success) {
                toast.success("Đã thêm hình ảnh thành công!", {
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                })

                // Sync local state
                setEntities(prev => prev.map(entity => {
                    if (entity.id === currentId) {
                        if (currentType === "restaurant") {
                            return {
                                ...entity,
                                restaurant_media: [...(entity.restaurant_media || []), { id: data.data.id }]
                            }
                        } else {
                            return {
                                ...entity,
                                dish_media: [...(entity.dish_media || []), { id: data.data.id }]
                            }
                        }
                    }
                    return entity
                }))
            } else {
                console.error(">>> Database Insert Refused:", data)
                const errorMsg = data.details?.message || data.error || "Lỗi không xác định"
                toast.error(`Lỗi từ server: ${errorMsg}`, {
                    description: data.details?.hint || data.details?.details || ""
                })
            }
        } catch (error) {
            console.error(">>> Fetch Exception:", error)
            toast.error("Lỗi kết nối khi lưu hình ảnh")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-24 px-4 min-h-screen">
            <Card className="border-2 shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden card-glow">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary via-secondary to-accent" />

                <CardHeader className="space-y-1 pb-8">
                    <CardTitle className="text-4xl font-black gradient-text flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ImagePlus className="w-10 h-10 text-primary" />
                        </div>
                        Thêm hình ảnh
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-muted-foreground/80">
                        Tải hình ảnh lên Cloudinary và gán cho nhà hàng hoặc món ăn.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    {lastUploadedUrl && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl animate-fade-slide-up group">
                            <img
                                src={lastUploadedUrl}
                                alt="Last uploaded"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <div className="flex items-center gap-2 text-white font-bold text-lg">
                                    <div className="bg-green-500 rounded-full p-1">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    Tải lên thành công!
                                </div>
                                <p className="text-white/70 text-sm truncate mt-1">{lastUploadedUrl}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="type" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Loại đối tượng</Label>
                            <Select value={type} onValueChange={(v: "restaurant" | "dish") => {
                                setType(v)
                                setSelectedId("")
                            }}>
                                <SelectTrigger id="type" className="h-14 text-base border-2 focus:ring-primary/20 transition-all rounded-xl">
                                    <SelectValue placeholder="Chọn loại" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-2">
                                    <SelectItem value="restaurant" className="text-base py-4 hover:bg-primary/5 cursor-pointer">
                                        <div className="flex items-center gap-3 font-semibold">
                                            <RestaurantIcon className="w-5 h-5 text-primary" />
                                            Nhà hàng
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dish" className="text-base py-4 hover:bg-orange-50 cursor-pointer">
                                        <div className="flex items-center gap-3 font-semibold">
                                            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                                            Món ăn
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="entity" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {type === "restaurant" ? "Chọn Nhà hàng" : "Chọn Món ăn"}
                            </Label>
                            <Select
                                value={selectedId}
                                onValueChange={setSelectedId}
                                disabled={loading}
                            >
                                <SelectTrigger id="entity" className="h-14 text-base border-2 focus:ring-primary/20 transition-all rounded-xl">
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            Đang tải danh sách...
                                        </div>
                                    ) : (
                                        <SelectValue placeholder={`Tìm chọn ${type === "restaurant" ? "nhà hàng" : "món ăn"}`} />
                                    )}
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-2 max-h-80">
                                    {entities.length > 0 ? (
                                        entities.map((entity) => {
                                            const mediaCount = type === "restaurant"
                                                ? (entity.restaurant_media?.length || 0)
                                                : (entity.dish_media?.length || 0);

                                            return (
                                                <SelectItem key={entity.id} value={entity.id} className="text-base py-3 font-medium">
                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                            <span className="leading-tight whitespace-normal wrap-break-word">{entity.name}</span>
                                                            {type === "dish" && entity.restaurants && (
                                                                <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                                                                    <RestaurantIcon className="w-3 h-3" />
                                                                    {entity.restaurants.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {mediaCount === 0 ? (
                                                            <span className="shrink-0 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-red-200">
                                                                Chưa có hình
                                                            </span>
                                                        ) : (
                                                            <span className="shrink-0 bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-green-200 flex items-center gap-1">
                                                                {mediaCount} ảnh
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                                            <Sparkles className="w-8 h-8 opacity-20" />
                                            Không tìm thấy dữ liệu
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <CldUploadWidget
                            uploadPreset={uploadPreset}
                            onSuccess={handleUploadSuccess}
                            onUpload={handleUploadSuccess}
                            options={{
                                sources: ["local", "url", "camera"],
                                multiple: false,
                                cropping: true,
                                folder: `tastemuse/${type}s`,
                                clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                                styles: {
                                    palette: {
                                        window: "#FFFFFF",
                                        windowBorder: "#90A0B3",
                                        tabIcon: "#D1602F",
                                        menuIcons: "#5A616A",
                                        textDark: "#000000",
                                        textLight: "#FFFFFF",
                                        link: "#D1602F",
                                        action: "#EFA638",
                                        inactiveTabIcon: "#0E2F5A",
                                        error: "#F44235",
                                        inProgress: "#D1602F",
                                        complete: "#20B832",
                                        sourceBg: "#E4EBF1"
                                    }
                                }
                            }}
                        >
                            {({ open }) => (
                                <Button
                                    onClick={() => open()}
                                    disabled={!selectedId || uploading}
                                    className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-7 w-7 animate-spin" />
                                            Đang xử lý dữ liệu...
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus className="h-7 w-7" />
                                            TẢI HÌNH LÊN CLOUDINARY
                                        </>
                                    )}
                                </Button>
                            )}
                        </CldUploadWidget>
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-4 border-t border-dashed border-muted-foreground/30">
                        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Tự động lưu vào thư mục:
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-mono">
                                tastemuse/{type}s
                            </span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
