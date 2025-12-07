"use client";
import React from "react";
import { LayoutGrid } from "./LayoutGrid";

interface HowItWorksProps {
  isDarkMode: boolean;
}

const UploadDocuments = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
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

const AIAnalysis = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
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

const GetInsights = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div
      className={`p-6 rounded-xl h-full flex flex-col justify-center ${
        isDarkMode ? 'bg-[#1C1F26]' : 'bg-slate-100 shadow-md'
      }`}
    >
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


export function HowItWorks({ isDarkMode }: HowItWorksProps) {
  const cards = [
    {
      id: 1,
      content: <UploadDocuments isDarkMode={isDarkMode} />,
      className: "md:col-span-2",
      thumbnail: "",
    },
    {
      id: 2,
      content: <AIAnalysis isDarkMode={isDarkMode} />,
      className: "col-span-1",
      thumbnail: "",
    },
    {
      id: 3,
      content: <GetInsights isDarkMode={isDarkMode} />,
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
        <h2 className={`text-4xl md:text-4xl font-bold mt-4 ${isDarkMode ? 'text-[#ECEDEE]' : 'text-[#1C1F26]'}'}`}>
          We help legal teams analyze documents reliably and efficiently
        </h2>
        <p className={`text-lg ${isDarkMode ? 'text-[#B4B7BD]' : 'text-[#4E535E]'} mt-4 max-w-2xl mx-auto`}>
          Upload your legal documents and get AI-powered analysis based on your team&apos;s needs and compliance requirements.
        </p>
      </div>
      </div>
      <div className="h-[500px] w-full overflow-visible">
        <LayoutGrid cards={cards} />
      </div>
    </section>
  );
}