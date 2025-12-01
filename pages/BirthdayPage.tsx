
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Check, Copy, Music, Gift, Heart, Star, Sparkles, Briefcase, Plane, Smile, Home, Coffee, Camera, Crown } from 'lucide-react';
import { getPage } from '../services/storageService';
import { BirthdayData, VisualStyle } from '../types';

// Theme Configurations
const THEMES: Record<VisualStyle, {
  bg: string;
  fontHeading: string;
  fontBody: string;
  accent: string;
  text: string;
  cardBg: string;
  effect?: React.ReactNode;
}> = {
  neon: {
    bg: 'bg-[#0a0a0f]',
    fontHeading: 'font-heading',
    fontBody: 'font-sans',
    accent: 'text-[#ff1493]',
    text: 'text-white',
    cardBg: 'bg-black/40 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 transition-colors duration-500',
    effect: (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[60px] opacity-10 top-[10%] left-[10%] animate-float bg-gradient-to-br from-[#ff1493] to-[#ffb6c1]" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-10 top-[50%] right-[10%] animate-float bg-gradient-to-br from-[#ff69b4] to-[#ff1493]" style={{ animationDelay: '5s' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[40px] opacity-20 bottom-[10%] left-[30%] animate-pulse-slow bg-pink-500" />
      </div>
    )
  },
  sakura: {
    bg: 'bg-pink-50',
    fontHeading: 'font-script',
    fontBody: 'font-serif',
    accent: 'text-pink-600',
    text: 'text-gray-800',
    cardBg: 'bg-white/60 backdrop-blur-md border border-pink-200 shadow-sm hover:shadow-pink-200/50 hover:-translate-y-1 transition-all',
    effect: (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute animate-fall text-pink-300/80 text-xl" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            fontSize: `${10 + Math.random() * 20}px`
          }}>🌸</div>
        ))}
      </div>
    )
  },
  cosmic: {
    bg: 'bg-slate-950',
    fontHeading: 'font-mono',
    fontBody: 'font-sans',
    accent: 'text-purple-400',
    text: 'text-slate-100',
    cardBg: 'bg-slate-900/50 backdrop-blur-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    effect: (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse-slow" style={{
            width: Math.random() * 3 + 'px',
            height: Math.random() * 3 + 'px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random(),
            animationDuration: `${2 + Math.random() * 3}s`
          }} />
        ))}
        <div className="absolute w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] top-[-10%] right-[-10%] animate-pulse-slow" />
      </div>
    )
  },
  ocean: {
    bg: 'bg-cyan-950',
    fontHeading: 'font-serif',
    fontBody: 'font-sans',
    accent: 'text-cyan-300',
    text: 'text-cyan-50',
    cardBg: 'bg-cyan-900/30 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    effect: (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-cyan-950 via-transparent to-transparent opacity-80" />
         {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-cyan-400/30 bg-cyan-400/5 animate-rise" style={{
            width: `${10 + Math.random() * 40}px`,
            height: `${10 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }} />
        ))}
      </div>
    )
  },
  sunset: {
    bg: 'bg-gradient-to-br from-orange-600 via-red-600 to-purple-800 animate-gradient-xy bg-[length:400%_400%]',
    fontHeading: 'font-hand',
    fontBody: 'font-sans',
    accent: 'text-orange-200',
    text: 'text-white',
    cardBg: 'bg-white/10 backdrop-blur-lg border border-orange-200/20 shadow-lg',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-300 rounded-full blur-[40px] opacity-60 animate-pulse-slow" />
      </div>
    )
  },
  vintage: {
    bg: 'bg-[#f0e6d2]',
    fontHeading: 'font-serif',
    fontBody: 'font-mono',
    accent: 'text-[#8b4513]',
    text: 'text-[#5c4033]',
    cardBg: 'bg-[#e6dcc3] border border-[#d2c6a8] shadow-inner rotate-[1deg] hover:rotate-0 transition-transform',
    effect: <div className="fixed inset-0 animate-grain opacity-10 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]" />
  },
  forest: {
    bg: 'bg-emerald-950',
    fontHeading: 'font-cinzel',
    fontBody: 'font-sans',
    accent: 'text-emerald-400',
    text: 'text-emerald-50',
    cardBg: 'bg-emerald-900/40 backdrop-blur-md border border-emerald-500/30 hover:bg-emerald-900/50',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-flicker" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px #facc15',
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
      </div>
    )
  },
  glitch: {
    bg: 'bg-black',
    fontHeading: 'font-pixel',
    fontBody: 'font-mono',
    accent: 'text-green-500',
    text: 'text-gray-300',
    cardBg: 'bg-gray-900 border border-green-500/50 hover:animate-shake',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#00ff00_1px,#00ff00_2px)] opacity-5" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/30 animate-fall duration-[0.5s]" />
      </div>
    )
  },
  elegant: {
    bg: 'bg-[#1a1a1a]',
    fontHeading: 'font-serif',
    fontBody: 'font-serif',
    accent: 'text-[#d4af37]',
    text: 'text-gray-200',
    cardBg: 'bg-[#2a2a2a] border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.1)]',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
         {[...Array(30)].map((_, i) => (
           <div key={i} className="absolute w-1 h-1 bg-[#d4af37] rounded-full animate-twinkle shadow-[0_0_4px_#d4af37]" style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 4}s`
           }} />
         ))}
      </div>
    )
  },
  clouds: {
    bg: 'bg-sky-300',
    fontHeading: 'font-hand',
    fontBody: 'font-sans',
    accent: 'text-white',
    text: 'text-sky-900',
    cardBg: 'bg-white/80 backdrop-blur-sm border border-white rounded-3xl shadow-xl hover:scale-[1.02] transition-transform',
    effect: (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 text-white/40 text-9xl animate-float">☁️</div>
        <div className="absolute top-40 right-20 text-white/30 text-8xl animate-float" style={{ animationDelay: '2s' }}>☁️</div>
        <div className="absolute bottom-20 left-1/3 text-white/20 text-[10rem] animate-float" style={{ animationDelay: '5s' }}>☁️</div>
      </div>
    )
  },
  minimal: {
    bg: 'bg-white',
    fontHeading: 'font-sans',
    fontBody: 'font-sans',
    accent: 'text-black',
    text: 'text-gray-900',
    cardBg: 'bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
    effect: <div className="fixed inset-0 bg-gradient-to-tr from-gray-50 to-white pointer-events-none z-0" />
  },
  polaroid: {
    bg: 'bg-gray-100',
    fontHeading: 'font-hand',
    fontBody: 'font-sans',
    accent: 'text-pink-500',
    text: 'text-gray-800',
    cardBg: 'bg-white p-4 shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300 border border-gray-200',
    effect: <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none z-0" />
  },
  midnight: {
    bg: 'bg-slate-900',
    fontHeading: 'font-serif',
    fontBody: 'font-sans',
    accent: 'text-indigo-400',
    text: 'text-slate-300',
    cardBg: 'bg-slate-800/80 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute w-[150px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent animate-shoot opacity-0" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 6}s`
          }} />
        ))}
        {[...Array(50)].map((_, i) => (
          <div key={`star-${i}`} className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle" style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 3}s`
          }} />
        ))}
      </div>
    )
  },
  loveletter: {
    bg: 'bg-[#fff0f5]',
    fontHeading: 'font-script',
    fontBody: 'font-serif',
    accent: 'text-red-500',
    text: 'text-gray-800',
    cardBg: 'bg-white border-2 border-red-100 shadow-[0_0_15px_rgba(255,182,193,0.3)] hover:border-red-200 transition-colors',
    effect: (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="fixed inset-0 border-[20px] border-white/50 z-50 pointer-events-none" />
         {[...Array(15)].map((_, i) => (
           <div key={i} className="absolute text-2xl text-red-300/40 animate-float-up" style={{
             left: `${Math.random() * 100}%`,
             bottom: '-50px',
             animationDelay: `${Math.random() * 5}s`,
             animationDuration: `${5 + Math.random() * 5}s`
           }}>
             {['❤️', '💖', '💌', '💕'][Math.floor(Math.random() * 4)]}
           </div>
         ))}
      </div>
    )
  }
};

export const BirthdayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BirthdayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'landing' | 'timeline' | 'wishes' | 'final'>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Refs for cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    if (id) {
      const pageData = getPage(id);
      setData(pageData);
    }
    setLoading(false);
  }, [id]);

  // Cursor Animation Logic
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        setTimeout(() => {
          if (followerRef.current) {
            followerRef.current.style.left = `${e.clientX}px`;
            followerRef.current.style.top = `${e.clientY}px`;
          }
        }, 100);
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('!opacity-100', '!translate-y-0', '!scale-100');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection, data]);

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (activeSection === 'landing') return;
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= documentHeight - 50 && !isTransitioning) {
        if (activeSection === 'timeline') transitionToSection('wishes');
        else if (activeSection === 'wishes') transitionToSection('final');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, isTransitioning]);

  const transitionToSection = (section: 'landing' | 'timeline' | 'wishes' | 'final') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsTransitioning(false);
      if (section === 'final') {
        setTimeout(() => setShowSignature(true), 2000);
      }
    }, 500);
  };

  const startJourney = () => {
    createConfetti();
    setTimeout(() => transitionToSection('timeline'), 1000);
  };

  const createConfetti = () => {
    const colors = ['#ff1493', '#ff69b4', '#ffb6c1', '#ffd700', '#00ff00', '#00ffff'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = '-10px';
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.zIndex = '9999';
      el.style.transition = 'top 3s ease-out, opacity 3s ease-out';
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.top = '110vh';
        el.style.opacity = '0';
      }, 50);
      setTimeout(() => el.remove(), 3000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Helper to get consistent icon based on text content
  const getSmartIcon = (text: string) => {
    const lower = text.toLowerCase();
    
    // Career / Success
    if (lower.includes('ceo') || lower.includes('boss') || lower.includes('career') || lower.includes('business') || lower.includes('job') || lower.includes('work')) return <Crown strokeWidth={1.5} />;
    
    // Music
    if (lower.includes('music') || lower.includes('song') || lower.includes('playlist') || lower.includes('listen') || lower.includes('band')) return <Music strokeWidth={1.5} />;
    
    // Love / Relationship
    if (lower.includes('love') || lower.includes('heart') || lower.includes('together') || lower.includes('couple') || lower.includes('marry') || lower.includes('wife') || lower.includes('husband')) return <Heart strokeWidth={1.5} />;
    
    // Travel
    if (lower.includes('travel') || lower.includes('trip') || lower.includes('fly') || lower.includes('world') || lower.includes('paris') || lower.includes('visit')) return <Plane strokeWidth={1.5} />;
    
    // Happiness / Smile
    if (lower.includes('smile') || lower.includes('happy') || lower.includes('joy') || lower.includes('laugh')) return <Smile strokeWidth={1.5} />;
    
    // Home / Family
    if (lower.includes('home') || lower.includes('family') || lower.includes('house') || lower.includes('kids')) return <Home strokeWidth={1.5} />;
    
    // Food / Drink
    if (lower.includes('coffee') || lower.includes('food') || lower.includes('eat') || lower.includes('dinner')) return <Coffee strokeWidth={1.5} />;

    // Memories
    if (lower.includes('photo') || lower.includes('pic') || lower.includes('memory') || lower.includes('remember')) return <Camera strokeWidth={1.5} />;

    // Dreams / Generic
    if (lower.includes('dream') || lower.includes('wish') || lower.includes('hope')) return <Star strokeWidth={1.5} />;
    
    return <Sparkles strokeWidth={1.5} />;
  };

  if (loading) return <div className="h-screen bg-[#0a0a0f] text-pink-500 flex items-center justify-center">Loading...</div>;
  if (!data) return <div className="h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Page not found</div>;

  // Determine active theme
  const currentTheme = THEMES[data.design.visualStyle] || THEMES.neon;

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} overflow-hidden relative ${currentTheme.fontBody} selection:bg-pink-500 selection:text-white transition-colors duration-1000`}>
      
      {/* Toast Notification */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-gray-900/90 backdrop-blur-xl border border-pink-500/30 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <div className="bg-green-500/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-medium text-sm">Link copied!</span>
        </div>
      </div>

      {/* Floating Share Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
            onClick={copyToClipboard}
            className={`p-3 backdrop-blur-md rounded-full border transition-all hover:scale-110 active:scale-95 group ${currentTheme.text === 'text-white' ? 'bg-black/30 border-white/10 hover:bg-black/50' : 'bg-white/30 border-black/10 hover:bg-white/50'}`}
        >
            {showToast ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className={`w-5 h-5 ${currentTheme.accent}`} />}
        </button>
      </div>

      {/* Cursor */}
      <div ref={cursorRef} className="cursor fixed top-0 left-0 hidden md:block" />
      <div ref={followerRef} className="cursor-follower fixed top-0 left-0 hidden md:block" />

      {/* Background Effect */}
      {currentTheme.effect}

      {/* LANDING SECTION */}
      {activeSection === 'landing' && (
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center p-6 animate-[fadeIn_1s_forwards]">
          <h1 className={`text-5xl md:text-8xl font-extrabold mb-8 animate-glow ${currentTheme.fontHeading} ${currentTheme.accent}`}>
            Happy Birthday<br />{data.basics.recipientName} 🎉
          </h1>
          <p className="text-xl md:text-2xl opacity-80 mb-12 animate-slide-up max-w-2xl">
            {data.basics.nickname ? `To my ${data.basics.nickname}, ` : ''}my favorite person, my everything... 💕
          </p>
          <button 
            onClick={startJourney}
            className={`hover-target group relative px-12 py-4 text-xl font-bold rounded-full overflow-hidden shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 animate-slide-up bg-gradient-to-r from-pink-500 to-rose-500 text-white`}
            style={{ animationDelay: '1s' }}
          >
            <span className="relative z-10">Start Our Journey</span>
          </button>
          
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-70 ${currentTheme.accent}`}>
            <span className="text-2xl">↓</span>
          </div>
        </section>
      )}

      {/* TIMELINE SECTION */}
      {activeSection === 'timeline' && (
        <section className="relative z-10 min-h-screen py-20 px-4 max-w-6xl mx-auto animate-[fadeIn_1s_forwards]">
          <h2 className={`text-4xl md:text-6xl text-center mb-20 font-bold ${currentTheme.fontHeading} ${currentTheme.accent}`}>
            Our Love Story 💖
          </h2>
          
          <div className="space-y-24 pb-32">
            {/* Meeting Story */}
            <div className="animate-on-scroll opacity-0 translate-y-[50px] transition-all duration-1000 flex flex-col md:flex-row gap-12 items-center group">
              <div className={`relative w-full md:w-1/2 h-[300px] rounded-2xl flex items-center justify-center text-6xl hover:scale-105 active:scale-95 hover:rotate-2 transition-transform duration-500 shadow-lg overflow-hidden ${currentTheme.cardBg}`}>
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                <span className="relative z-20">🏫</span>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <h3 className={`text-3xl font-bold mb-4 ${currentTheme.accent}`}>Where It All Began</h3>
                <p className="text-lg opacity-80 leading-relaxed">{data.journey.meetingStory}</p>
              </div>
            </div>

            {/* Memories */}
            {data.memories.map((memory, idx) => (
              <div key={memory.id} className={`animate-on-scroll opacity-0 translate-y-[50px] transition-all duration-1000 flex flex-col md:flex-row gap-12 items-center group ${idx % 2 !== 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className={`relative w-full md:w-1/2 h-[300px] rounded-2xl flex items-center justify-center text-6xl hover:scale-105 active:scale-95 hover:rotate-2 transition-transform duration-500 shadow-lg overflow-hidden ${currentTheme.cardBg}`}>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                  <span className="relative z-20">{['💌', '🚌', '💝', '💋', '💬'][idx % 5]}</span>
                </div>
                <div className="w-full md:w-1/2 text-left">
                  <h3 className={`text-3xl font-bold mb-4 ${currentTheme.accent}`}>
                    {memory.date || `Memory #${idx + 1}`}
                  </h3>
                  <p className="text-lg opacity-80 leading-relaxed mb-4">{memory.description}</p>
                  
                  {/* SPECIAL REVEAL / LIGHT BOX EFFECT */}
                  {memory.importance && (
                      <div className={`mt-6 p-4 rounded-xl border-2 text-center animate-pulse-slow active:scale-95 transition-transform ${currentTheme.accent} ${currentTheme.bg === 'bg-white' ? 'border-pink-200 bg-pink-50' : 'border-white/20 bg-white/5'}`}>
                         <span className="text-xl font-bold">✨ {memory.importance} ✨</span>
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-sm font-bold px-4 py-2 rounded-full backdrop-blur ${currentTheme.text === 'text-white' ? 'bg-white/10' : 'bg-black/10'} ${currentTheme.accent}`}>
            Scroll for Wishes ↓
          </div>
        </section>
      )}

      {/* WISHES SECTION */}
      {activeSection === 'wishes' && (
        <section className="relative z-10 min-h-screen py-20 px-4 max-w-6xl mx-auto animate-[fadeIn_1s_forwards]">
          <h2 className={`text-4xl md:text-6xl text-center mb-16 font-bold ${currentTheme.fontHeading} ${currentTheme.accent}`}>
            What I Wish For You 🌟
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
             {/* Dreams Card */}
             {data.personality.dreams && (
               <div className={`relative overflow-hidden animate-on-scroll opacity-0 scale-90 transition-all duration-700 p-8 rounded-3xl group hover:-translate-y-2 active:scale-95 ${currentTheme.cardBg}`}>
                 <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                 <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform ${currentTheme.accent}`}>
                    {getSmartIcon(data.personality.dreams + ' career boss work')}
                 </div>
                 <h3 className={`text-2xl font-bold mb-4 ${currentTheme.accent}`}>Your Big Dream</h3>
                 <p className="opacity-80 leading-relaxed">{data.personality.dreams}</p>
               </div>
             )}

             {/* Uniqueness Card */}
             {data.personality.uniqueness && (
               <div className={`relative overflow-hidden animate-on-scroll opacity-0 scale-90 transition-all duration-700 delay-100 p-8 rounded-3xl group hover:-translate-y-2 active:scale-95 ${currentTheme.cardBg}`}>
                 <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                 <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform ${currentTheme.accent}`}>
                    <Sparkles strokeWidth={1.5} />
                 </div>
                 <h3 className={`text-2xl font-bold mb-4 ${currentTheme.accent}`}>Uniquely You</h3>
                 <p className="opacity-80 leading-relaxed">{data.personality.uniqueness}</p>
               </div>
             )}

             {/* Custom Wishes */}
             {data.wishes.map((wish, idx) => (
                <div key={wish.id} className={`relative overflow-hidden animate-on-scroll opacity-0 scale-90 transition-all duration-700 p-8 rounded-3xl group hover:-translate-y-2 active:scale-95 ${currentTheme.cardBg}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                  <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform ${currentTheme.accent}`}>
                      {getSmartIcon(wish.content + ' ' + wish.details)}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${currentTheme.accent}`}>{wish.content || 'A Wish For You'}</h3>
                  <p className="opacity-80 leading-relaxed">{wish.details}</p>
                </div>
             ))}
          </div>

          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-sm font-bold px-4 py-2 rounded-full backdrop-blur ${currentTheme.text === 'text-white' ? 'bg-white/10' : 'bg-black/10'} ${currentTheme.accent}`}>
            Scroll for Message ↓
          </div>
        </section>
      )}

      {/* FINAL SECTION */}
      {activeSection === 'final' && (
        <section className="relative z-10 min-h-screen flex items-center justify-center p-6 animate-[fadeIn_1s_forwards]">
          <div className="max-w-3xl text-center">
            <h2 className={`text-4xl md:text-7xl font-bold mb-12 ${currentTheme.fontHeading} ${currentTheme.accent}`}>
              My Everything 💕
            </h2>
            
            <div className="space-y-8 text-xl md:text-2xl leading-relaxed opacity-90 font-light">
              <p className="animate-slide-up">{data.message.main}</p>
            </div>

            {data.message.quote && (
              <div className={`mt-12 p-6 border-l-4 text-left italic animate-slide-up ${currentTheme.cardBg} ${currentTheme.accent}`} style={{ animationDelay: '0.5s', borderColor: 'currentColor' }}>
                "{data.message.quote}"
              </div>
            )}
            
            <div 
              className={`mt-16 text-2xl md:text-3xl font-script transition-opacity duration-1000 ${showSignature ? 'opacity-100' : 'opacity-0'} ${currentTheme.accent}`}
            >
              Love from {data.basics.senderName} 💖
            </div>
            
            {/* Share Button & Link */}
            <div className={`mt-24 flex flex-col items-center gap-6 transition-opacity duration-1000 delay-1000 ${showSignature ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all hover-target"
                >
                    <Share2 className="w-5 h-5" />
                    <span>Share This Page</span>
                </button>
                
                <Link to="/" className="text-sm opacity-60 hover:opacity-100 transition-colors mt-2">
                    Create another birthday page
                </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
