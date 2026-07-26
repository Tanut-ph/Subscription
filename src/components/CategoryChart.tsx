import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySlice } from "../lib/analytics";
import { categoryColor } from "../data/services";
import { formatMoney } from "../lib/money";

export default function CategoryChart({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.category} fill={categoryColor(d.category)} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatMoney(v as number)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-slate-400">Monthly</span>
          <span className="text-lg font-bold text-slate-900">
            {formatMoney(total).replace(/\.00$/, "")}
          </span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {data.map((d) => (
          <li key={d.category} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: categoryColor(d.category) }}
              />
              {d.category}
            </span>
            <span className="font-medium text-slate-900">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
