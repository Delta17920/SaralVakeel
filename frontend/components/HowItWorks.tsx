"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { JSX } from "react";

interface HowItWorksProps {
  isDarkMode: boolean;
}

const UploadDocuments = ({ isDarkMode, isComplete }: { isDarkMode: boolean; isComplete: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center relative transition-all duration-500 ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
      {/* Checkmark overlay */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <p className={`font-bold text-2xl mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Upload Documents
      </p>

      <p className={`font-normal text-base ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
        Securely upload contracts, agreements, and legal documents for instant analysis.
        Our platform supports multiple file formats and ensures your documents are encrypted 
        and protected throughout the process.
      </p>
    </div>
  );
};

const AIAnalysis = ({ isDarkMode, isComplete }: { isDarkMode: boolean; isComplete: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center relative transition-all duration-500 ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
      {/* Checkmark overlay */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <p className={`font-bold text-2xl mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        AI Analysis
      </p>

      <p className={`font-normal text-base ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
        Our AI reviews documents for risks, compliance issues, and key clauses automatically.
        Advanced machine learning models identify patterns and potential concerns that might be
        missed in manual reviews.
      </p>
    </div>
  );
};

const GetInsights = ({ isDarkMode, isComplete }: { isDarkMode: boolean; isComplete: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center relative transition-all duration-500 ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
      {/* Checkmark overlay */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <p className={`font-bold text-2xl mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Get Insights
      </p>

      <p className={`font-normal text-base ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
        Receive detailed reports with actionable insights and recommendations.
        Our comprehensive analysis helps you make informed decisions quickly and confidently,
        saving valuable time for your legal team.
      </p>
    </div>
  );
};

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

type Card = {
  id: number;
  content: (isComplete: boolean) => JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

const LayoutGrid = ({ cards, isDarkMode }: { cards: Card[]; isDarkMode: boolean }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [activeCard, setActiveCard] = useState<number>(0);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => {
        const next = (prev + 1) % cards.length;
        
        // Mark the current card as complete before moving to next
        setCompletedCards(prevCompleted => {
          const newCompleted = new Set(prevCompleted);
          newCompleted.add(prev);
          return newCompleted;
        });
        
        // Clear all completed cards when restarting the cycle
        if (next === 0) {
          setTimeout(() => {
            setCompletedCards(new Set());
          }, 1000);
        }
        
        return next;
      });
    }, 2000); // 2 seconds per card

    return () => clearInterval(interval);
  }, [cards.length]);

  const handleOutsideClick = () => {
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => {
        const isActive = activeCard === i;
        const isComplete = completedCards.has(i);
        
        return (
          <div key={i} className={cn(card.className, "")}>
            <motion.div
              className={cn(
                card.className,
                "relative overflow-visible",
                selected?.id === card.id
                  ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg w-[90%] md:w-[60%] z-50 mt-5"
                  : "z-40 rounded-xl h-full w-full"
              )}
              layoutId={`card-${card.id}`}
            >
              {/* Shine effect overlay */}
              {isActive && !isComplete && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none z-50 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      width: '50%',
                      height: '100%',
                    }}
                  />
                </motion.div>
              )}
              
              {/* Subtle border glow when complete */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl pointer-events-none z-30"
                  style={{
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)',
                  }}
                />
              )}
              
              {selected?.id === card.id ? (
                <SelectedCard selected={selected} />
              ) : (
                <div className="h-full w-full">
                  {card.content(isComplete)}
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.5 : 0.3 }}
      />
    </div>
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-4 z-[70]"
      >
        {selected?.content(false)}
      </motion.div>
    </div>
  );
};

export function HowItWorks({ isDarkMode }: HowItWorksProps) {
  const cards: Card[] = [
    {
      id: 1,
      content: (isComplete) => <UploadDocuments isDarkMode={isDarkMode} isComplete={isComplete} />,
      className: "md:col-span-2",
      thumbnail: "",
    },
    {
      id: 2,
      content: (isComplete) => <AIAnalysis isDarkMode={isDarkMode} isComplete={isComplete} />,
      className: "col-span-1",
      thumbnail: "",
    },
    {
      id: 3,
      content: (isComplete) => <GetInsights isDarkMode={isDarkMode} isComplete={isComplete} />,
      className: "col-span-1",
      thumbnail: "",
    },
  ];

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="text-center">
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'} uppercase tracking-wider`}>
            How it works
          </span>
        <h2 className={`text-4xl md:text-4xl font-bold mt-4 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
          We help legal teams analyze documents reliably and efficiently
        </h2>
        <p className={`text-lg ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'} mt-4 max-w-2xl mx-auto`}>
          Upload your legal documents and get AI-powered analysis based on your team&apos;s needs and compliance requirements.
        </p>
      </div>
      </div>
      <div className="h-[500px] w-full overflow-visible">
        <LayoutGrid cards={cards} isDarkMode={isDarkMode} />
      </div>
    </section>
  );
}

// Demo
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0F1117]' : 'bg-white'}`}>
      <div className="p-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>
      <HowItWorks isDarkMode={isDarkMode} />
    </div>
  );
}