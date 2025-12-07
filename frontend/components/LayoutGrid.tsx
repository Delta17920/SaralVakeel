"use client";
import React, { useState } from "react";
import { JSX } from "react";
import { motion } from "motion/react";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);

  const handleOutsideClick = () => {
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
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
            {selected?.id === card.id ? (
              <SelectedCard selected={selected} />
            ) : (
              <div className="h-full w-full">
                {card.content}
              </div>
            )}
          </motion.div>
        </div>
      ))}
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
        {selected?.content}
      </motion.div>
    </div>
  );
};
// Demo usage
const DemoCard = ({ title, color }: { title: string; color: string }) => (
  <div className={`w-full h-full ${color} flex items-center justify-center text-white text-2xl font-bold`}>
    {title}
  </div>
);

export default function App() {
  const cards = [
    {
      id: 1,
      content: <DemoCard title="Card 1" color="bg-blue-500" />,
      className: "md:col-span-1",
      thumbnail: "",
    },
    {
      id: 2,
      content: <DemoCard title="Card 2" color="bg-purple-500" />,
      className: "md:col-span-1",
      thumbnail: "",
    },
    {
      id: 3,
      content: <DemoCard title="Card 3" color="bg-green-500" />,
      className: "md:col-span-1",
      thumbnail: "",
    },
    {
      id: 4,
      content: <DemoCard title="Card 4" color="bg-orange-500" />,
      className: "md:col-span-1",
      thumbnail: "",
    },
  ];

  return (
    <div className="h-screen w-full bg-gray-900">
      <LayoutGrid cards={cards} />
    </div>
  );
}