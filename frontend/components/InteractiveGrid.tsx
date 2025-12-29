'use client';

import React, { useEffect, useRef } from 'react';

interface InteractiveGridProps {
    isDarkMode: boolean;
}

export default function InteractiveGrid({ isDarkMode }: InteractiveGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const gridRef = useRef<Map<string, number>>(new Map()); // Store active cells and their alpha

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        const gridSize = 40; // Size of grid squares

        const init = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Grid Lines
            ctx.beginPath();
            ctx.strokeStyle = isDarkMode ? 'rgba(79, 196, 196, 0.05)' : 'rgba(47, 60, 126, 0.08)';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }

            // Horizontal lines
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // Handle Interactions
            // Determine active cell from mouse position
            if (mouseRef.current.x >= 0 && mouseRef.current.y >= 0) {
                const col = Math.floor(mouseRef.current.x / gridSize);
                const row = Math.floor(mouseRef.current.y / gridSize);



                // Random shapes config
                const shapes = [
                    // Cross
                    [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 }],
                    // Square
                    [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: 1, r: 1 }],
                    // L-shape
                    [{ c: 0, r: 0 }, { c: 0, r: -1 }, { c: 0, r: 1 }, { c: 1, r: 1 }],
                    // Diagonal
                    [{ c: 0, r: 0 }, { c: 1, r: 1 }, { c: -1, r: -1 }],
                    // Glider-ish
                    [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: -1, r: 1 }, { c: -1, r: -1 }],
                    // Random scattering
                    [{ c: 0, r: 0 }, { c: 1, r: -1 }, { c: -1, r: 1 }, { c: 0, r: 2 }]
                ];

                // Use position as seed for stable random selection
                const seed = Math.abs((col * 123 + row * 456) ^ 789);
                const shapeIndex = seed % shapes.length;
                const activeShape = shapes[shapeIndex];

                activeShape.forEach(({ c, r }) => {
                    const offsetCol = col + c;
                    const offsetRow = row + r;
                    const key = `${offsetCol},${offsetRow}`;

                    // Main cell gets higher opacity, others lower
                    const isMain = c === 0 && r === 0;
                    const targetAlpha = isMain ? (isDarkMode ? 0.3 : 0.2) : (isDarkMode ? 0.15 : 0.1);

                    // Update if new or currently fainter
                    if (!gridRef.current.has(key) || (gridRef.current.get(key) || 0) < targetAlpha) {
                        gridRef.current.set(key, targetAlpha);
                    }
                });
            }

            // Draw and decay active cells
            gridRef.current.forEach((alpha, key) => {
                const [col, row] = key.split(',').map(Number);
                const x = col * gridSize;
                const y = row * gridSize;

                ctx.fillStyle = isDarkMode
                    ? `rgba(79, 196, 196, ${alpha})`
                    : `rgba(47, 60, 126, ${alpha})`;

                ctx.fillRect(x, y, gridSize, gridSize);

                // Decay alpha
                const newAlpha = alpha - 0.02; // Fade speed
                if (newAlpha <= 0) {
                    gridRef.current.delete(key);
                } else {
                    gridRef.current.set(key, newAlpha);
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
    );
}
