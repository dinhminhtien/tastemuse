"use client"

import { useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Filter,
    RotateCcw,
    Download,
    MoreHorizontal,
    Calendar as CalendarIcon,
    ArrowUpDown
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

interface TransactionListProps {
    payments: any[]
    loading?: boolean
}

export function TransactionList({ payments, loading }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [providerFilter, setProviderFilter] = useState("all")

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.order_code?.toString().includes(searchTerm) ||
            p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== "all") {
            if (statusFilter === "cancelled") {
                matchesStatus = p.status === "cancelled" || p.status === "failed";
            } else {
                matchesStatus = p.status === statusFilter;
            }
        }

        const matchesProvider = providerFilter === "all" || p.provider === providerFilter;
        return matchesSearch && matchesStatus && matchesProvider;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-[#e7f5ef] text-[#00a86b] hover:bg-[#e7f5ef] border-none font-bold px-3 py-1">Đã thanh toán</Badge>;
            case 'pending':
                return <Badge className="bg-[#eff6ff] text-[#3b82f6] hover:bg-[#eff6ff] border-none font-bold px-3 py-1">Chờ thanh toán</Badge>;
            case 'failed':
            case 'cancelled':
                return <Badge className="bg-[#fff1f2] text-[#e11d48] hover:bg-[#fff1f2] border-none font-bold px-3 py-1">Hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    const getProviderName = (provider: string) => {
        switch (provider) {
            case 'payos': return 'PayOS';
            case 'sepay': return 'SePay';
            case 'manual': return 'Thủ công';
            default: return 'TasteMuse';
        }
    }

    const handleExportCSV = () => {
        if (filteredPayments.length === 0) {
            toast.error("Không có dữ liệu để xuất");
            return;
        }

        // CSV Header
        const headers = ["Kênh thanh toán", "Tiền đơn hàng (VND)", "Tiền thanh toán (VND)", "Ngày tạo", "Mã giao dịch", "Mã đơn hàng", "Trạng thái"];

        // CSV Rows
        const rows = filteredPayments.map(p => [
            getProviderName(p.provider),
            p.amount,
            p.status === 'completed' ? p.amount : 0,
            format(new Date(p.created_at), "dd/MM/yyyy HH:mm:ss"),
            p.metadata?.description || `TM${p.order_code || p.id.substring(0, 7)}`.slice(0, 9),
            p.order_code ? `\t${p.order_code}` : (p.transaction_id ? `\t${p.transaction_id}` : 'N/A'),
            p.status === 'completed' ? 'Đã thanh toán' : (p.status === 'pending' ? 'Chờ thanh toán' : 'Hủy')
        ]);

        // Build CSV string
        const csvContent = [
            "\ufeff" + headers.join(","), // UTF-8 BOM for Excel visibility
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Giao_dich_TasteMuse_${format(new Date(), "ddMMyyyy")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Đã xuất file giao dịch thành công");
    };

    return (
        <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm mã đơn hàng, giao dịch..."
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-600">
                        <SelectValue placeholder="Kênh thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả kênh</SelectItem>
                        <SelectItem value="payos">PayOS</SelectItem>
                        <SelectItem value="sepay">SePay</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-600">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="completed">Đã thanh toán</SelectItem>
                        <SelectItem value="pending">Chờ thanh toán</SelectItem>
                        <SelectItem value="cancelled">Hủy</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" className="h-10 rounded-xl font-bold text-slate-600 border-slate-200 bg-slate-50">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Ngày tạo
                </Button>

                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl font-bold text-slate-600"
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setProviderFilter("all");
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Đặt lại
                    </Button>
                    <Button className="h-10 rounded-xl font-bold bg-[#00a86b] hover:bg-[#008f5d] text-white">
                        Lọc
                    </Button>
                    <Button
                        className="h-10 rounded-xl font-bold bg-[#00a86b] hover:bg-[#008f5d] text-white"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất dữ liệu
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="border rounded-2xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-bold text-slate-500 py-4">Kênh thanh toán</TableHead>
                            <TableHead className="font-bold text-slate-500">Tiền đơn hàng</TableHead>
                            <TableHead className="font-bold text-slate-500">Tiền thanh toán</TableHead>
                            <TableHead className="font-bold text-slate-500">Ngày tạo</TableHead>
                            <TableHead className="font-bold text-slate-500">Mô tả</TableHead>
                            <TableHead className="font-bold text-slate-500">Mã đơn hàng</TableHead>
                            <TableHead className="font-bold text-slate-500">Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((p) => (
                                <TableRow key={p.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-orange-600">TM</span>
                                            </div>
                                            <span className="font-bold text-slate-700">{getProviderName(p.provider)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">
                                        {formatCurrency(p.amount)}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">
                                        {p.status === 'completed' ? formatCurrency(p.amount) : '0 ₫'}
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-medium">
                                        {format(new Date(p.created_at), "dd-MM-yyyy HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <code className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold text-slate-600">
                                            {p.metadata?.description || `TM${p.order_code || p.id.substring(0, 7)}`.slice(0, 9)}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-bold font-mono text-xs">
                                        {p.order_code || p.transaction_id || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(p.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center text-slate-400 font-medium italic">
                                    {loading ? "Đang tải dữ liệu..." : "Không tìm thấy giao dịch nào"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between px-2 pt-2 text-sm font-bold text-slate-500">
                <div>
                    Hiển thị 1 - {filteredPayments.length} trong {payments.length} kết quả
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled className="rounded-lg h-8 w-8 p-0">
                        &lt;
                    </Button>
                    <Button variant="outline" size="sm" disabled className="rounded-lg h-8 w-8 p-0">
                        &gt;
                    </Button>
                </div>
            </div>
        </div>
    )
}
