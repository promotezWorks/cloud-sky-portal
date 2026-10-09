import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface EvilChartDataPoint {
  date: string;
  views: number;
  revenue: number;
  conversion: number;
}

const DEFAULT_DATA: EvilChartDataPoint[] = [
  { date: 'Jan', views: 4200, revenue: 2400, conversion: 1800 },
  { date: 'Feb', views: 5600, revenue: 3200, conversion: 2200 },
  { date: 'Mar', views: 7100, revenue: 4800, conversion: 3400 },
  { date: 'Apr', views: 6400, revenue: 4100, conversion: 2900 },
  { date: 'May', views: 8900, revenue: 6300, conversion: 4600 },
  { date: 'Jun', views: 11200, revenue: 8400, conversion: 5900 },
  { date: 'Jul', views: 13500, revenue: 9900, conversion: 7100 },
];

interface EvilComposedChartProps {
  data?: EvilChartDataPoint[];
  className?: string;
  title?: string;
  description?: string;
}

/**
 * EvilCharts Composed Chart Component
 * Inspired by https://evilcharts.com/docs/recharts/composed-chart/static
 * Combines Area, Bar, and Line series with custom gradients, sleek grid styling, and tooltips.
 */
export function EvilComposedChart({
  data = DEFAULT_DATA,
  className,
  title = "Performance Analytics",
  description = "Composed Bar, Area, and Line view powered by EvilCharts & Recharts",
}: EvilComposedChartProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl',
        className
      )}
    >
      <div className="mb-6 flex flex-col space-y-1">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="evilAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="evilBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
              opacity={0.5}
            />

            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-xl border border-border bg-popover/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-medium text-foreground capitalize">{entry.name}:</span>
                        <span className="font-bold text-foreground">
                          {Number(entry.value).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {/* Glowing Area underlay */}
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              fill="url(#evilAreaGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
            />

            {/* Vibrant Stylized Bars */}
            <Bar
              dataKey="conversion"
              name="Conversions"
              barSize={20}
              radius={[6, 6, 0, 0]}
              fill="url(#evilBarGradient)"
            />

            {/* Accent Line overlay */}
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
          <span>Views (Area)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]" />
          <span>Conversions (Bar)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
          <span>Revenue (Line)</span>
        </div>
      </div>
    </div>
  );
}

export default EvilComposedChart;
