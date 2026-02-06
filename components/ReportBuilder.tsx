import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Save, AlertTriangle, Printer, Activity, MapPin, Clock, User, ShieldAlert, Volume2, Square, Mic, MicOff } from 'lucide-react';
import { parseFieldNotes } from '../utils/regexEngine';
import { INCIDENT_TEMPLATES } from '../constants/templates';
import { IncidentCategory, IncidentSeverity, AuditLogEntry } from '../types';

interface ReportBuilderProps {
  onSave: (entry: AuditLogEntry) => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ onSave }) => {
  const [fieldNotes, setFieldNotes] = useState('');
  const [officerId, setOfficerId] = useState('OFF-2024-001');
  const [generatedReport, setGeneratedReport] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<IncidentCategory>(IncidentCategory.GENERAL);
  const [detectedSeverity, setDetectedSeverity] = useState<IncidentSeverity>(IncidentSeverity.LOW);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Deterministic Logic Pipeline
  const processNotes = useCallback((notes: string) => {
    if (!notes) {
      setGeneratedReport("Waiting for input...");
      return;
    }

    const data = parseFieldNotes(notes);
    const template = INCIDENT_TEMPLATES[data.category];
    
    setDetectedCategory(data.category);
    setDetectedSeverity(data.severity);

    // Template Slot Filling
    let report = template.templateString
      .replace('{{time}}', data.time)
      .replace('{{location}}', data.location)
      .replace('{{subject}}', data.subject)
      .replace('{{action}}', `Additional context: "${data.rawText}"`);

    setGeneratedReport(report);
  }, []);

  useEffect(() => {
    // Debounce the processing slightly for performance
    const timer = setTimeout(() => {
      processNotes(fieldNotes);
    }, 300);
    return () => clearTimeout(timer);
  }, [fieldNotes, processNotes]);

  // Stop speaking if report content changes
  useEffect(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [generatedReport]);

  // Cleanup speech/recognition on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser environment. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      // Append new text to existing notes
      setFieldNotes(prev => (prev + ' ' + transcript).replace(/\s\s+/g, ' '));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSave = () => {
    if (!fieldNotes) return;
    
    const newEntry: AuditLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      officerId,
      summary: fieldNotes.substring(0, 50) + (fieldNotes.length > 50 ? '...' : ''),
      category: detectedCategory,
      generatedReport
    };
    
    onSave(newEntry);
    setFieldNotes('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!generatedReport || generatedReport === "Waiting for input...") return;

    const utterance = new SpeechSynthesisUtterance(generatedReport);
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getSeverityColor = (sev: IncidentSeverity) => {
    switch (sev) {
      case IncidentSeverity.CRITICAL: return 'bg-red-500 text-white';
      case IncidentSeverity.HIGH: return 'bg-orange-500 text-white';
      case IncidentSeverity.MEDIUM: return 'bg-yellow-500 text-black';
      case IncidentSeverity.LOW: return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-container">
      {/* Input Section - Hidden on Print */}
      <div className="space-y-6 no-print">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Field Note Entry
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleListening}
                title={isListening ? "Stop Dictation" : "Start Dictation"}
                className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' 
                    : 'bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full">
                 <User className="w-3 h-3" />
                 <input 
                   type="text" 
                   value={officerId} 
                   onChange={(e) => setOfficerId(e.target.value)}
                   className="bg-transparent border-none outline-none w-24 text-center" 
                 />
              </div>
            </div>
          </div>
          
          <textarea
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder="Ex: 14:00 at Gate 10, male subject in red hoodie attempted to bypass bag check. IMPD notified."
            className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed"
          />

          <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
             <span>Deterministic Logic Active</span>
             <span className="flex items-center gap-2">
               {isListening && <span className="text-red-400 animate-pulse font-bold">• REC</span>}
               Regex Engine v1.2.4 (Indy)
             </span>
          </div>
        </div>
      </div>

      {/* Preview Section - Full Width on Print */}
      <div className="space-y-6 print:w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl print:bg-white print:border-none print:shadow-none print:text-black">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:border-gray-200">
            <h2 className="text-xl font-semibold text-slate-100 print:text-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 print:text-black" />
              Generated Report
            </h2>
            
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getSeverityColor(detectedSeverity)} print:border print:border-black print:text-black print:bg-transparent`}>
              {detectedCategory} - {detectedSeverity}
            </div>
          </div>

          <div className="space-y-4">
             {/* Extracted Entities Visualization (No Print) */}
             <div className="grid grid-cols-2 gap-4 mb-6 no-print">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block mb-1">Detected Time</span>
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <Clock className="w-3 h-3" />
                    {parseFieldNotes(fieldNotes).time}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block mb-1">Detected Location</span>
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <MapPin className="w-3 h-3" />
                    {parseFieldNotes(fieldNotes).location}
                  </div>
                </div>
             </div>

             {/* The Report */}
             <div className="bg-slate-100 text-slate-900 p-6 rounded-lg font-serif leading-loose shadow-inner print:bg-white print:p-0 print:shadow-none">
                <p className="mb-4">
                  <strong>OFFICIAL INCIDENT REPORT</strong><br/>
                  <strong>VENUE:</strong> INDIANAPOLIS VENUE SECURE<br/>
                  <strong>OFFICER:</strong> {officerId}<br/>
                  <strong>DATE:</strong> {new Date().toLocaleDateString()}
                </p>
                <hr className="border-slate-300 my-4" />
                <p>
                  {generatedReport}
                </p>
             </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
            <button 
              onClick={handleSave}
              disabled={!fieldNotes}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Commit to Audit Trail
            </button>
            
            <button 
              onClick={handleSpeak}
              disabled={!generatedReport || generatedReport === "Waiting for input..."}
              className={`px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border ${
                isSpeaking 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/50 hover:bg-rose-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop Audio' : 'Read Aloud'}
            </button>

            <button 
              onClick={handlePrint}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;