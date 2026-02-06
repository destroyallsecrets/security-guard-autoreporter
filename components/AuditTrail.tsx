import React from 'react';
import { AuditLogEntry, IncidentSeverity } from '../types';
import { ClipboardList, Trash2 } from 'lucide-react';

interface AuditTrailProps {
  logs: AuditLogEntry[];
  onClear: () => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ logs, onClear }) => {
  return (
    <div className="mt-12 no-print">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          Shift Audit Trail
        </h3>
        {logs.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear Log
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">
            No incidents recorded this shift.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 font-medium">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Officer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Summary</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4">{log.officerId}</td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-300">{log.summary}</td>
                    <td className="p-4">
                      <span className="text-emerald-400 text-xs font-bold">COMMITTED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;