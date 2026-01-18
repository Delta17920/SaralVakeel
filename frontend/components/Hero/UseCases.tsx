"use client";
import React from "react";
import { Carousel, Card } from "../ui/apple-cards-carousel";

interface UseCasesProps {
  isDarkMode: boolean;
}

const DummyContent = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className={`${isDarkMode ? 'bg-[#1A1C20] border-[#2B2E35]' : 'bg-white border-[#E2E2E8]'} p-8 md:p-14 rounded-3xl border shadow-xl`}>
      <p className={`${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#5F6B7C]'} text-base md:text-xl font-sans max-w-3xl mx-auto leading-relaxed`}>
        <span className={`font-bold ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
          Streamline your legal workflow with AI-powered analysis.
        </span>{" "}
        Our platform helps legal teams review documents faster, identify risks automatically,
        and ensure compliance with industry standards. From contract review to risk assessment,
        we&apos;ve got you covered.
      </p>
    </div>
  );
};

export function UseCases({ isDarkMode }: UseCasesProps) {
  const data = [
    {
      category: "Contract Analysis",
      title: "Quick Review",
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2940&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
    {
      category: "Risk Management",
      title: "Risk Detection",
      src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
    {
      category: "Efficiency",
      title: "Batch Processing",
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2969&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
    {
      category: "Compliance",
      title: "Compliance Check",
      src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2942&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
    {
      category: "Document Management",
      title: "Smart Organization",
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2940&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
    {
      category: "Team Collaboration",
      title: "Collaborative Review",
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop",
      content: <DummyContent isDarkMode={isDarkMode} />,
    },
  ];

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section className={`w-full py-20 lg:py-32 relative overflow-hidden ${isDarkMode ? 'bg-[#0B0D10]' : 'bg-[#FAFAF9]'}`}>
      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 ${isDarkMode
              ? 'bg-[#4FC4C4]/10 text-[#4FC4C4] border border-[#4FC4C4]/20'
              : 'bg-[#2F3C7E]/5 text-[#2F3C7E] border border-[#2F3C7E]/10'
              }`}
          >
            USE CASES
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold mt-4 tracking-tight ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
            We make the complex <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-[#4FC4C4] to-[#2F3C7E]' : 'from-[#2F3C7E] to-[#4FC4C4]'}`}>simple</span>
          </h2>
          <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#5F6B7C]'} mt-6 max-w-2xl mx-auto`}>
            Making legal document analysis accessible and efficient for modern legal teams.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <Carousel items={cards} />
      </div>
    </section>
  );
}