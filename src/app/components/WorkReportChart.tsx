"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Invoices: 21, Revenue: 2400 },
  { name: 'Feb', Invoices: 25, Revenue: 2210 },
  { name: 'Mar', Invoices: 32, Revenue: 2290 },
  { name: 'Apr', Invoices: 30, Revenue: 2000 },
  { name: 'May', Invoices: 41, Revenue: 2181 },
  { name: 'Jun', Invoices: 45, Revenue: 2500 },
  { name: 'Jul', Invoices: 38, Revenue: 2100 },
];

export default function WorkReportChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5, right: 20, left: -10, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#374151' }}
        />
        <Legend wrapperStyle={{ color: '#374151' }} />
        <Line type="monotone" dataKey="Revenue" stroke="#335fb3" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Invoices" stroke="#a7c7f3" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
} 