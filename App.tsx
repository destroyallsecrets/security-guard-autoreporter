import React, { useState, useEffect } from 'react';
import ReportBuilder from './components/ReportBuilder';
import AuditTrail from './components/AuditTrail';
import { AuditLogEntry } from './types';
import { ShieldCheck, Map } from 'lucide-react';

const App: React.FC = () => {
  // Simulate database with local storage
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('security_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('security_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const handleSaveReport = (entry: AuditLogEntry) => {
    setAuditLogs(prev => [entry, ...prev]);
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear the shift logs? This cannot be undone.")) {
      setAuditLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">IndySecure <span className="text-indigo-400">Auto-Reporter</span></h1>
              <p className="text-xs text-slate-500 font-mono">NO-AI RUNTIME ENVIRONMENT // V1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
             <div className="flex items-center gap-1">
                <Map className="w-3 h-3" />
                <span>ZONE: INDY-METRO</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span>SYSTEM ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 no-print">
          <h2 className="text-2xl font-bold text-white mb-2">New Incident Report</h2>
          <p className="text-slate-400">Enter field notes below. The deterministic engine will automatically categorize, extract entities, and format the official record.</p>
        </div>

        <ReportBuilder onSave={handleSaveReport} />
        
        <AuditTrail logs={auditLogs} onClear={handleClearLogs} />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-auto py-8 text-center text-slate-600 text-sm no-print">
        <p>&copy; 2024 IndySecure Systems. Authorized Personnel Only.</p>
      </footer>
    </div>
  );
};

export default App;