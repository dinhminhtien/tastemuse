"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    Search, 
    Download, 
    User, 
    Mail, 
    Calendar, 
    Zap,
    MoreHorizontal,
    ShieldCheck
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface UserItem {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    created_at: string
    last_sign_in_at?: string
    is_premium: boolean
    plan_name: string
    total_actions: number
    status: string
}

export function UserList() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/admin/users", {
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            })

            const data = await res.json()
            if (data.success) {
                setUsers(data.users)
            } else {
                toast.error("Không thể tải danh sách người dùng")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleExport = () => {
        if (filteredUsers.length === 0) return;
        
        const headers = ["Email", "Họ tên", "Gói", "Hoạt động", "Ngày đăng ký", "Lần đăng nhập cuối"];
        const rows = filteredUsers.map(u => [
            u.email,
            u.full_name,
            u.plan_name,
            u.total_actions,
            format(new Date(u.created_at), "dd/MM/yyyy"),
            u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "dd/MM/yyyy HH:mm") : "N/A"
        ]);

        const csvContent = "\ufeff" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Danh_sach_nguoi_dung_${format(new Date(), "ddMMyyyy")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Đã xuất danh sách người dùng");
    }

    return (
        <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Tìm kiếm email, tên người dùng..." 
                        className="pl-10 h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleExport}
                        className="h-12 rounded-2xl font-bold border-2"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất CSV
                    </Button>
                </div>
            </div>

            <div className="border-2 border-slate-50 rounded-4xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Người dùng</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Gói Premium</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Hoạt động</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Đăng ký ngày</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">Đang tải danh sách người dùng...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <TableRow key={u.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={u.avatar_url} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {u.full_name?.substring(0, 1)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{u.full_name}</span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {u.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.is_premium ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 font-bold px-3 py-1 rounded-full uppercase text-[10px] flex items-center w-fit gap-1">
                                                <ShieldCheck className="w-3 h-3" />
                                                {u.plan_name}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-3 py-1 rounded-full uppercase text-[10px] w-fit">
                                                Free
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${Math.min(100, (u.total_actions / 100) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-600">{u.total_actions}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-600">{format(new Date(u.created_at), "dd/MM/yyyy")}</span>
                                            {u.last_sign_in_at && (
                                                <span className="text-[10px] text-slate-400 italic">Online: {format(new Date(u.last_sign_in_at), "dd/MM HH:mm")}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 text-slate-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-slate-400">Không tìm thấy người dùng nào</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between pt-2">
                <p className="text-xs font-bold text-slate-400 px-4 italic">
                    Hiển thị {filteredUsers.length} trên tổng số {users.length} người dùng
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="rounded-xl h-9">Trước</Button>
                    <Button variant="outline" size="sm" disabled className="rounded-xl h-9">Sau</Button>
                </div>
            </div>
        </div>
    )
}
