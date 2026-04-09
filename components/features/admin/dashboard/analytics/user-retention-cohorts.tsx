import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export function UserRetentionCohorts({ stats }: { stats: any }) {
    if (!stats || !stats.cohortData) return null;

    const { cohortData } = stats;

    // A simple color scale from red/orange (low retention) to green (high retention)
    const getColor = (value: number) => {
        if (value === 0) return "bg-slate-100 text-slate-400";
        if (value < 20) return "bg-orange-100 text-orange-800";
        if (value < 40) return "bg-yellow-100 text-yellow-800";
        if (value < 60) return "bg-green-100 text-green-800";
        if (value < 80) return "bg-emerald-200 text-emerald-900";
        return "bg-emerald-400 text-emerald-950 font-bold";
    }

    return (
        <Card className="col-span-1 md:col-span-2 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            User Retention Cohort (Phân tích giữ chân)
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                            Phần trăm user tiếp tục sử dụng app sau N tuần kể từ lúc đăng ký.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Cohort</th>
                            <th className="px-4 py-3 text-center">Week 1</th>
                            <th className="px-4 py-3 text-center">Week 2</th>
                            <th className="px-4 py-3 text-center">Week 3</th>
                            <th className="px-4 py-3 text-center">Week 4</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cohortData.map((row: any, i: number) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                                    {row.cohort}
                                </td>
                                <td className="p-1">
                                    <div className={`w-full py-2 flex items-center justify-center rounded-md ${getColor(row.W1)}`}>
                                        {row.W1 > 0 ? `${row.W1}%` : '-'}
                                    </div>
                                </td>
                                <td className="p-1">
                                    <div className={`w-full py-2 flex items-center justify-center rounded-md ${getColor(row.W2)}`}>
                                        {row.W2 > 0 ? `${row.W2}%` : '-'}
                                    </div>
                                </td>
                                <td className="p-1">
                                    <div className={`w-full py-2 flex items-center justify-center rounded-md ${getColor(row.W3)}`}>
                                        {row.W3 > 0 ? `${row.W3}%` : '-'}
                                    </div>
                                </td>
                                <td className="p-1">
                                    <div className={`w-full py-2 flex items-center justify-center rounded-md ${getColor(row.W4)}`}>
                                        {row.W4 > 0 ? `${row.W4}%` : '-'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}
