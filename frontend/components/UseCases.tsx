"use client";
import React from "react";
import { Carousel, Card } from "./ui/apple-cards-carousel";

interface UseCasesProps {
  isDarkMode: boolean;
}

const DummyContent = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className={`${isDarkMode ? 'bg-[#1A1C20]' : 'bg-white'} p-8 md:p-14 rounded-3xl`}>
      <p className={`${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'} text-base md:text-xl font-sans max-w-3xl mx-auto leading-relaxed`}>
        <span className={`font-bold ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
          Streamline your legal workflow with AI-powered analysis.
        </span>{" "}
        Our platform helps legal teams review documents faster, identify risks automatically, 
        and ensure compliance with industry standards. From contract review to risk assessment, 
        we&aposve got you covered.
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
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="text-center">
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#4FC4C4]' : 'text-[#2F3C7E]'} uppercase tracking-wider`}>
            Use Cases
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}`}>
            We make the complex simple
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'} mt-4 max-w-2xl mx-auto`}>
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