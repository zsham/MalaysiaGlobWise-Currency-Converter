
import React from 'react';
import { ConversionResult } from '../types';

interface HistoryTableProps {
  history: ConversionResult[];
  onRestore: (item: ConversionResult) => void;
  onClear: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onRestore, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">Conversion History</h3>
          <p className="text-xs text-slate-500">Click any row to re-convert</p>
        </div>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-rose-400 font-semibold transition-colors uppercase tracking-wider"
        >
          Clear History
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-[0.15em]">
              <th className="px-6 py-4 font-bold">Route</th>
              <th className="px-6 py-4 font-bold">Input</th>
              <th className="px-6 py-4 font-bold text-right">Output</th>
              <th className="px-6 py-4 font-bold text-right">Rate</th>
              <th className="px-6 py-4 font-bold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {history.map((item, idx) => (
              <tr 
                key={idx} 
                onClick={() => onRestore(item)}
                className="group hover:bg-slate-800/80 cursor-pointer transition-all active:bg-slate-800"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{item.from}</span>
                    <svg className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="text-sm font-bold text-slate-200">{item.to}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {item.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-black text-indigo-400 text-right">
                  {item.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-[11px] text-slate-500 font-mono text-right tracking-tight">
                  {item.rate.toFixed(4)}
                </td>
                <td className="px-6 py-4 text-[11px] text-slate-500 text-right">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
