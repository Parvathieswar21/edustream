import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function AIInsightsWidget({ studentId }: { studentId?: string }) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no student ID is provided, use a hardcoded value 'all' or specific demo ID
    const fetchId = studentId || 'demo-123';
    api.get(`/ai/predict/${fetchId}`)
      .then(res => setInsights(res.data))
      .catch(err => console.error('AI Insights Error:', err))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg animate-pulse w-full">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-indigo-200" />
          <h3 className="font-bold text-lg">EduStream AI Analyzing...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
          <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group w-full mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <Sparkles className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold">EduStream AI Insights</h3>
              <p className="text-indigo-200 text-xs uppercase tracking-widest mt-1 font-bold">Powered by Gemini</p>
            </div>
          </div>
          {insights.atRisk && (
            <div className="bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-red-300" />
              <span className="text-sm font-bold text-red-100">At-Risk Student Detected</span>
            </div>
          )}
        </div>

        <p className="text-lg leading-relaxed text-indigo-50 font-medium mb-6">
          {insights.analysis}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h4 className="flex items-center text-sm font-bold text-indigo-300 mb-3 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 mr-2" /> Needs Attention
            </h4>
            <ul className="space-y-2">
              {insights.weaknesses?.map((w: string, i: number) => (
                <li key={i} className="flex items-center text-indigo-50 text-sm before:content-[''] before:w-1.5 before:h-1.5 before:bg-red-400 before:rounded-full before:mr-2">
                  {w}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner">
            <h4 className="flex items-center text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 mr-2" /> Suggested Actions
            </h4>
            <ul className="space-y-3">
              {insights.suggestions?.map((s: string, i: number) => (
                <li key={i} className="flex text-indigo-50 text-sm leading-tight">
                  <ChevronRight className="w-4 h-4 min-w-[16px] mr-1 text-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
