import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { enhanceText, isAIConfigured } from '../services/geminiService';

interface AIButtonProps {
  originalText: string;
  context: string;
  onEnhanced: (text: string) => void;
  className?: string;
}

export const AIButton: React.FC<AIButtonProps> = ({ originalText, context, onEnhanced, className = "" }) => {
  const [loading, setLoading] = useState(false);

  if (!isAIConfigured()) return null;

  const handleEnhance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!originalText.trim()) return;
    
    setLoading(true);
    try {
      const result = await enhanceText(originalText, context, "Passionate, Deep, Cinematic");
      onEnhanced(result);
    } catch (error) {
      console.error("Enhancement failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnhance}
      disabled={loading || !originalText.trim()}
      type="button"
      className={`text-xs flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors font-medium px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 rounded-full border border-pink-500/20 ${className} disabled:opacity-50`}
      title="Auto-Expand text with AI"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
      {loading ? 'Expanding...' : 'AI Expand & Polish'}
    </button>
  );
};