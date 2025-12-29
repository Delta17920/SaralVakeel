"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { JSX } from "react";

interface HowItWorksProps {
  isDarkMode: boolean;
}

const StepCard = ({
  isDarkMode,
  isComplete,
  title,
  description,
  iconPath
}: {
  isDarkMode: boolean;
  isComplete: boolean;
  title: string;
  description: string;
  iconPath: string;
}) => {
  return (
    <div
      className={`p-8 rounded-3xl h-full flex flex-col justify-center relative transition-all duration-500 border ${isDarkMode
        ? 'bg-gradient-to-br from-[#1A1C20]/90 to-[#222B53]/40 border-[#4FC4C4]/20'
        : 'bg-white border-[#E2E2E8] shadow-xl shadow-[#2F3C7E]/5'
        }`}
    >
      {/* Checkmark overlay */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center z-10 ${isDarkMode ? 'bg-[#4FC4C4] text-[#1A1C20]' : 'bg-[#2F3C7E] text-white'
            }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#4FC4C4]/10 text-[#4FC4C4]' : 'bg-[#2F3C7E]/10 text-[#2F3C7E]'
        }`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>

      <p className={`font-bold text-2xl mb-4 ${isDarkMode ? 'text-white' : 'text-[#1C1F26]'}`}>
        {title}
      </p>

      <p className={`font-normal text-base leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#5F6B7C]'}`}>
        {description}
      </p>
    </div>
  );
};

const STEPS_DATA = [
  {
    id: 1,
    title: "Upload Documents",
    description: "Securely upload contracts, agreements, and legal documents for instant analysis. Our platform supports multiple file formats and ensures your documents are encrypted.",
    iconPath: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "Our AI reviews documents for risks, compliance issues, and key clauses automatically. Advanced machine learning models identify patterns and potential concerns.",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 3,
    title: "Get Insights",
    description: "Receive detailed reports with actionable insights and recommendations. Comprehensive analysis that helps you make informed decisions quickly.",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    className: "md:col-span-1 lg:col-span-1",
  }
];

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

type Card = {
  id: number;
  content: (isComplete: boolean) => JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

const LayoutGrid = ({ cards }: { cards: Card[]; isDarkMode?: boolean }) => {

  const [activeCard, setActiveCard] = useState<number>(0);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const intervalDuration = isMobile ? 4000 : 2000; // Slower on mobile

    const interval = setInterval(() => {
      setActiveCard((prev) => {
        const next = (prev + 1) % cards.length;
        setCompletedCards(prevCompleted => {
          const newCompleted = new Set(prevCompleted);
          newCompleted.add(prev);
          return newCompleted;
        });
        if (next === 0) {
          setTimeout(() => {
            setCompletedCards(new Set());
          }, 1000);
        }
        return next;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="w-full h-full p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => {
        const isActive = activeCard === i;
        const isComplete = completedCards.has(i);

        return (
          <div key={i} className={cn(card.className, "")}>
            <motion.div
              className={cn(
                card.className,
                "relative overflow-visible z-40 rounded-xl h-full w-full"
              )}
              layoutId={`card-${card.id}`}
            >
              {isActive && !isComplete && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none z-50 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      width: '50%',
                      height: '100%',
                    }}
                  />
                </motion.div>
              )}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl pointer-events-none z-30"
                  style={{ boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)' }}
                />
              )}
              <div className="h-full w-full">
                {card.content(isComplete)}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export function HowItWorks({ isDarkMode }: HowItWorksProps) {
  const cards: Card[] = STEPS_DATA.map(step => ({
    id: step.id,
    content: (isComplete) => <StepCard
      isDarkMode={isDarkMode}
      isComplete={isComplete}
      title={step.title}
      description={step.description}
      iconPath={step.iconPath}
    />,
    className: step.className,
    thumbnail: "",
  }));

  return (
    <section className={`w-full py-20 lg:py-32 relative overflow-hidden ${isDarkMode ? 'bg-[#0B0D10]' : 'bg-[#FAFAF9]'}`}>
      {/* Background gradients similar to Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${isDarkMode ? 'rgba(79, 196, 196, 0.05)' : 'rgba(47, 60, 126, 0.03)'} 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 ${isDarkMode
              ? 'bg-[#4FC4C4]/10 text-[#4FC4C4] border border-[#4FC4C4]/20'
              : 'bg-[#2F3C7E]/5 text-[#2F3C7E] border border-[#2F3C7E]/10'
              }`}
          >
            PROCESS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1C1F26]'}`}
          >
            Simple, powerful{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-[#4FC4C4] to-[#2F3C7E]' : 'from-[#2F3C7E] to-[#4FC4C4]'}`}>
              workflow
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#5F6B7C]'}`}
          >
            Upload your legal documents and let our AI handle the complexity.
            Get actionable insights in minutes, not days.
          </motion.p>
        </div>
      </div>

      <div className="h-auto w-full relative z-10">
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