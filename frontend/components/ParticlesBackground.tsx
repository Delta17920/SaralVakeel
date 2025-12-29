'use client';
import React, { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
    isDarkMode: boolean;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

export default function ParticlesBackground({ isDarkMode }: ParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        // Configuration
        const particleCountMobile = 30; // Reduced count for mobile
        const particleCountDesktop = 80;
        const connectionDistance = 150;
        const mouseDistance = 200;
        const particleSpeed = 0.5;

        // Colors - Increased opacity for better visibility
        const colorDot = isDarkMode ? 'rgba(79, 196, 196, 0.8)' : 'rgba(47, 60, 126, 0.8)';
        const colorLine = isDarkMode ? 'rgba(79, 196, 196, 0.3)' : 'rgba(47, 60, 126, 0.25)';

        const init = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            // Responsive particle count
            const isMobile = width < 768;
            const count = isMobile ? particleCountMobile : particleCountDesktop;

            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * particleSpeed,
                    vy: (Math.random() - 0.5) * particleSpeed,
                    size: Math.random() * 2 + 2, // Sizes 2-4
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach((p, i) => {
                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = colorDot;
                ctx.fill();

                // Connect to other particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = colorLine;
                        ctx.lineWidth = 1 - dist / connectionDistance;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = colorLine;
                    ctx.lineWidth = 1 - dist / mouseDistance; // Fades out as it gets further
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.stroke();

                    // Slight attraction to mouse (optional, for fun physics)
                    // p.vx -= dx * 0.0003;
                    // p.vy -= dy * 0.0003;
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
        }

        window.addEventListener('resize', handleResize);
        // Ideally we attach mouse listeners to the container or window if the canvas is covered
        // Since this is background, other elements might block mouse events on canvas.
        // So we'll attach to window for smoother "global" feeling on the hero section.
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
            style={{ opacity: 0.8 }}
        />
    );
}
