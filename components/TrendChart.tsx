
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: { date: string; rate: number }[];
  from: string;
  to: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, from, to }) => {
  return (
    <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-800/50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="mb-8 relative z-10">
        <h3 className="text-xl font-black text-slate-100 tracking-tight">{from} <span className="text-slate-500">to</span> {to} <span className="text-indigo-400">Trend</span></h3>
        <p className="text-sm text-slate-500 font-medium">Market movement over the last 7 days</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              domain={['auto', 'auto']}
              tickFormatter={(val) => val.toFixed(2)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '16px', 
                border: '1px solid #1e293b', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                padding: '12px'
              }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorRate)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
