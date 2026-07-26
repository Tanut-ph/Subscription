import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthPoint } from "../lib/analytics";
import { formatMoney } from "../lib/money";

export default function SpendChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#94a3b8" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          tickFormatter={(v) => formatMoney(v as number).replace(/\.00$/, "")}
        />
        <Tooltip
          formatter={(v) => [formatMoney(v as number), "Spend"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 13,
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
          }}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#spendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
