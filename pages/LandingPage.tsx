
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Heart, Gift, ArrowRight, CheckCircle2, Sparkles, Star, History, X, Clock } from 'lucide-react';
import { BirthdayData, INITIAL_DATA, Memory, Wish } from '../types';
import { saveDraft, getDraft, savePage, getHistory, deletePage } from '../services/storageService';
import { ChatInterface } from '../components/ChatInterface';
import { polishManualData } from '../services/geminiService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BirthdayData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [mode, setMode] = useState<'chat' | 'manual'>('chat'); // Default to chat
  
  // History Modal State
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<BirthdayData[]>([]);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setData(draft);
    }
    setLoading(false);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSaving(true);
      saveDraft(data);
      setTimeout(() => setSaving(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, [data]);

  const handleChatComplete = (generatedData: BirthdayData) => {
    setData(generatedData);
    const pageId = savePage(generatedData);
    navigate(`/view/${pageId}`);
  };

  const handleBasicChange = (field: keyof typeof data.basics, value: string) => {
    setData(prev => ({ ...prev, basics: { ...prev.basics, [field]: value } }));
  };

  const handleNestedChange = (section: keyof BirthdayData, field: string, value: string) => {
    // @ts-ignore
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const addMemory = () => {
    if (data.memories.length >= 8) return;
    const newMemory: Memory = {
      id: crypto.randomUUID(),
      description: '',
      date: '',
      location: '',
      importance: '',
      details: ''
    };
    setData(prev => ({ ...prev, memories: [...prev.memories, newMemory] }));
  };

  const removeMemory = (id: string) => {
    setData(prev => ({ ...prev, memories: prev.memories.filter(m => m.id !== id) }));
  };

  const updateMemory = (id: string, field: keyof Memory, value: string) => {
    setData(prev => ({
      ...prev,
      memories: prev.memories.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const addWish = () => {
    if (data.wishes.length >= 8) return;
    const newWish: Wish = {
      id: crypto.randomUUID(),
      content: '',
      importance: '',
      details: ''
    };
    setData(prev => ({ ...prev, wishes: [...prev.wishes, newWish] }));
  };
  
  const removeWish = (id: string) => {
    setData(prev => ({ ...prev, wishes: prev.wishes.filter(w => w.id !== id) }));
  };

  const updateWish = (id: string, field: keyof Wish, value: string) => {
    setData(prev => ({
      ...prev,
      wishes: prev.wishes.map(w => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.basics.recipientName || !data.basics.senderName) {
      alert("Please fill in the required names.");
      return;
    }
    
    setIsPolishing(true);
    
    try {
        // Automatically polish the data using AI
        const polishedData = await polishManualData(data);
        const pageId = savePage(polishedData);
        navigate(`/view/${pageId}`);
    } catch (err) {
        console.error("Polishing failed", err);
        // Fallback to saving raw data if AI fails
        const pageId = savePage(data);
        navigate(`/view/${pageId}`);
    } finally {
        setIsPolishing(false);
    }
  };
  
  // History Logic
  const openHistory = () => {
    const items = getHistory();
    setHistoryItems(items);
    setShowHistory(true);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-500 bg-[#0a0a0f]">Loading...</div>;

  const calculateProgress = () => {
    let score = 0;
    if (data.basics.recipientName) score += 10;
    if (data.memories.length > 0) score += 20;
    if (data.personality.interests || data.personality.uniqueness) score += 10;
    if (data.journey.meetingStory) score += 10;
    if (data.message.main) score += 30;
    return Math.min(100, score);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0a0a0f] text-gray-200 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header / Progress */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md shadow-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="text-pink-500 w-6 h-6" />
            <h1 className="font-heading font-bold text-white hidden sm:block">Birthday Maker</h1>
          </div>
          
          {mode === 'manual' && (
              <div className="flex-1 mx-6 hidden md:block">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Story Completion</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-500 shadow-[0_0_10px_#ff1493]"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>
          )}

          <div className="flex items-center gap-3">
             <button
               onClick={openHistory}
               className="p-2 text-gray-400 hover:text-pink-400 hover:bg-white/5 rounded-full transition-colors"
               title="View History"
             >
               <History className="w-5 h-5" />
             </button>
             
             <div className="h-6 w-px bg-white/10 mx-1"></div>

             <button 
                onClick={() => setMode(mode === 'chat' ? 'manual' : 'chat')}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-pink-500/30 hover:bg-pink-500/10 transition-colors text-pink-300"
             >
                {mode === 'chat' ? 'Manual Form' : 'AI Chat'}
             </button>
             {mode === 'manual' && (
                <div className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
                    {saving ? 'Saving...' : 'Auto-saved'} <CheckCircle2 className="w-3 h-3 text-green-500" />
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl shadow-pink-500/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-pink-500" />
                        Previous Creations
                    </h3>
                    <button 
                        onClick={() => setShowHistory(false)} 
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                   {historyItems.length > 0 ? (
                       historyItems.map((item) => (
                          <div 
                             key={item.id} 
                             onClick={() => navigate(`/view/${item.id}`)} 
                             className="cursor-pointer bg-white/5 p-4 rounded-xl border border-transparent hover:border-pink-500/30 hover:bg-white/10 transition-all flex justify-between items-center group relative overflow-hidden"
                          >
                             <div className="relative z-10">
                                <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">
                                    {item.basics.recipientName || "Untitled Page"}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded capitalize">{item.design.visualStyle}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown Date'}
                                    </span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2 relative z-10">
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                                <button 
                                    onClick={(e) => deleteHistoryItem(item.id, e)} 
                                    className="p-2 hover:bg-red-500/20 rounded-full text-gray-500 hover:text-red-400 transition-colors ml-2"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             
                             {/* Hover Effect Background */}
                             <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                       ))
                   ) : (
                       <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-black/20">
                           <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                           <p>No history yet.</p>
                           <p className="text-xs opacity-60 mt-1">Create your first page to see it here!</p>
                       </div>
                   )}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-heading font-bold text-white mb-2 animate-pulse-slow">Create Your Love Story 💖</h2>
          <p className="text-gray-400">
            {mode === 'chat' ? "Chat with our AI to build your website instantly." : "Fill in the details, and our AI will polish it into a masterpiece."}
          </p>
        </div>

        {mode === 'chat' ? (
            <ChatInterface onComplete={handleChatComplete} />
        ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-[fadeIn_0.5s_ease]">
            {/* Section A: Basics */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                        <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-white">The Basics</h3>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Birthday Person *</label>
                    <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    value={data.basics.recipientName}
                    onChange={(e) => handleBasicChange('recipientName', e.target.value)}
                    placeholder="e.g. Swikriti"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Your Name *</label>
                    <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    value={data.basics.senderName}
                    onChange={(e) => handleBasicChange('senderName', e.target.value)}
                    placeholder="e.g. Kshitiz"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Relationship</label>
                    <select 
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    value={data.basics.relationship}
                    onChange={(e) => handleBasicChange('relationship', e.target.value as any)}
                    >
                    <option value="partner">Partner / Spouse</option>
                    <option value="friend">Best Friend</option>
                    <option value="sibling">Sibling</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nickname (Optional)</label>
                    <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    value={data.basics.nickname}
                    onChange={(e) => handleBasicChange('nickname', e.target.value)}
                    placeholder="e.g. My Gurll"
                    />
                </div>
                </div>
            </section>

            {/* Section B: Memories Timeline */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <span className="font-bold text-lg">M</span>
                    </div>
                    <div>
                    <h3 className="text-xl font-heading font-semibold text-white">Our Timeline</h3>
                    <p className="text-xs text-gray-400">We will polish your short notes into beautiful stories.</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={addMemory}
                    disabled={data.memories.length >= 8}
                    className="text-sm px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors flex items-center gap-1 shadow-lg shadow-pink-500/20"
                >
                    <Plus className="w-4 h-4" /> Add Memory
                </button>
                </div>

                <div className="space-y-6">
                {data.memories.map((memory, index) => (
                    <div key={memory.id} className="p-4 border border-white/10 rounded-xl bg-black/20 hover:border-pink-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-pink-400">Timeline Event #{index + 1}</h4>
                        <button 
                        type="button" 
                        onClick={() => removeMemory(memory.id)}
                        className="text-red-400 hover:text-red-500 transition-colors"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-xs text-gray-500 mb-1 block">Title / Date</label>
                            <input 
                                type="text"
                                placeholder="e.g. Class 6 - The Beginning"
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white text-sm focus:border-pink-500 outline-none"
                                value={memory.date}
                                onChange={(e) => updateMemory(memory.id, 'date', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">Location</label>
                            <input 
                                type="text"
                                placeholder="e.g. Kalika Secondary School"
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white text-sm focus:border-pink-500 outline-none"
                                value={memory.location}
                                onChange={(e) => updateMemory(memory.id, 'location', e.target.value)}
                            />
                        </div>
                        </div>
                        <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs text-gray-500">What happened?</label>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white text-sm focus:border-pink-500 outline-none min-h-[100px] leading-relaxed"
                            rows={3}
                            value={memory.description}
                            onChange={(e) => updateMemory(memory.id, 'description', e.target.value)}
                            placeholder="Just write the basics, AI will make it romantic..."
                        />
                        </div>
                    </div>
                    </div>
                ))}
                {data.memories.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border-dashed border border-white/10">
                    No memories added yet.
                    </div>
                )}
                </div>
            </section>

            {/* Section: Wishes & Dreams */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Star className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-white">Wishes & Dreams</h3>
                </div>
                
                <div className="space-y-6">
                    <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">What is their biggest dream?</label>
                    </div>
                    <textarea
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 outline-none transition-all"
                        rows={3}
                        value={data.personality.dreams}
                        onChange={(e) => handleNestedChange('personality', 'dreams', e.target.value)}
                        placeholder="e.g. To become a CEO of her own company..."
                    />
                    </div>
                    <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">What makes them unique?</label>
                    </div>
                    <textarea
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 outline-none transition-all"
                        rows={3}
                        value={data.personality.uniqueness}
                        onChange={(e) => handleNestedChange('personality', 'uniqueness', e.target.value)}
                        placeholder="Your eyes, your smile, the way you laugh..."
                    />
                    </div>
                    <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">How did you meet?</label>
                    </div>
                    <textarea
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 outline-none transition-all"
                        rows={3}
                        value={data.journey.meetingStory}
                        onChange={(e) => handleNestedChange('journey', 'meetingStory', e.target.value)}
                        placeholder="In class 6..."
                    />
                    </div>
                </div>

                {/* Dynamic Wishes */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-pink-400">More Wishes / Promises</h4>
                        <button 
                        type="button"
                        onClick={addWish}
                        disabled={data.wishes.length >= 8}
                        className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                        >
                        + Add Wish
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {data.wishes.map((wish, i) => (
                        <div key={wish.id} className="p-3 border border-white/10 rounded-lg bg-black/20">
                            <div className="flex justify-between items-center mb-2">
                            <input
                                className="bg-transparent text-pink-400 font-bold text-sm focus:outline-none w-full"
                                placeholder="Wish Title (e.g. Happiness)"
                                value={wish.content}
                                onChange={(e) => updateWish(wish.id, 'content', e.target.value)}
                            />
                            <button onClick={() => removeWish(wish.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="relative">
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white text-sm focus:border-pink-500 outline-none min-h-[80px]"
                                    placeholder="Description..."
                                    rows={3}
                                    value={wish.details}
                                    onChange={(e) => updateWish(wish.id, 'details', e.target.value)}
                                />
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section: Final Message */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-500/50 shadow-[0_0_20px_rgba(255,20,147,0.1)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/40">
                    <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-white">Final Love Note</h3>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Your Main Message *</label>
                    </div>
                    <textarea
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all min-h-[200px] leading-relaxed"
                    value={data.message.main}
                    onChange={(e) => handleNestedChange('message', 'main', e.target.value)}
                    placeholder="Swikriti, you came into my life in class 6..."
                    />
                </div>
            </section>

            {/* Submit */}
            <div className="pt-4 pb-12">
                <button 
                type="submit"
                disabled={isPolishing}
                className="w-full py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.01] transition-all font-heading font-bold text-xl flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isPolishing ? (
                    <>
                        <Sparkles className="w-6 h-6 animate-spin" /> 
                        Polishing & Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-6 h-6 animate-pulse" /> 
                        Generate Birthday Page
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
                </button>
                <p className="text-center text-gray-500 text-sm mt-4">
                We'll magically improve your text, add emojis, and create a stunning site ✨
                </p>
            </div>

            </form>
        )}
      </div>
    </div>
  );
};
