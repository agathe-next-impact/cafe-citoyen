"use client";
import React, { useEffect, useRef, useState } from "react";

// Images des balles à placer sur la corde
const BALL_IMAGES = [
  "/images/fichier-201-404x-1.png",
  "/images/fichier-202-404x-2.png",
  "/images/fichier-203-404x-2.png",
  "/images/fichier-204-404x-3.png",
  "/images/fichier-205-404x-4.png",
];

function quadBezier(t: number, p0: number, p1: number, p2: number) {
  return (
    (1 - t) * (1 - t) * p0 +
    2 * (1 - t) * t * p1 +
    t * t * p2
  );
}

function decodeHtmlEntities(str: string) {
  if (!str) return "";
  return str.replace(/&#([0-9]{1,3});/gi, (match, numStr) =>
    String.fromCharCode(parseInt(numStr, 10))
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
};

export default function PageHeader({ title, subtitle, backgroundImage, backgroundAlt }: PageHeaderProps) {
  // Animation state
  const [anim, setAnim] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let running = true;
    const animate = () => {
      setAnim((a) => a + 0.003);
      if (running) requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Création de 3 lignes de balles
  const lines = [
    // Ligne 1 (haute) - alternance normale avec 3 balles
    {
      Y1: 80, Y2: 40, Y3: 100,
      yOffset: -40,
      tList: [0.20, 0.50, 0.80],
      baseY: [20, 25, 18],
      radius: [15, 20, 12],
      phase: [0, 0.8, 1.5],
      colorPattern: [0, 1, 2] // 3 balles
    },
    // Ligne 2 (milieu) - alternance inversée avec 5 balles
    {
      Y1: 120, Y2: 60, Y3: 140,
      yOffset: 0,
      tList: [0.10, 0.22, 0.41, 0.65, 0.87],
      baseY: [30, 36, 24, 72, 28],
      radius: [18, 24, 14, 20, 16],
      phase: [0, 0.7, 1.2, 2.1, 2.8],
      colorPattern: [4, 3, 2, 1, 0] // 5 balles inversées
    },
    // Ligne 3 (basse) - alternance décalée avec 4 balles
    {
      Y1: 160, Y2: 100, Y3: 180,
      yOffset: 40,
      tList: [0.15, 0.35, 0.55, 0.85],
      baseY: [40, 45, 35, 55],
      radius: [20, 26, 16, 22],
      phase: [0.5, 1.2, 1.8, 2.6],
      colorPattern: [2, 3, 4, 0] // 4 balles décalées
    }
  ];

  // Calcul des positions pour chaque ligne
  const allBallPositions = lines.map(line => {
    return line.tList.map(t => {
      let x, y;
      if (t <= 0.5) {
        const localT = t / 0.5;
        x = 0 + (960 - 0) * t * 2;
        y = quadBezier(localT, 80 + line.yOffset, line.Y1, line.Y2);
      } else {
        const localT = (t - 0.5) / 0.5;
        x = 960 + (1920 - 960) * (t - 0.5) * 2;
        const ctrl = (line.Y1 + line.Y2) / 2;
        y = quadBezier(localT, line.Y2, ctrl, line.Y3);
      }
      return { x, y: y + line.yOffset };
    });
  });

  return (
    <section className="relative min-h-50 flex items-center overflow-visible bg-white">
      {/* Ligne courbe SVG en arrière-plan */}
      <div className="pointer-events-none absolute left-2/5 w-full mt-20 z-0">
        {/* 3 lignes de balles animées */}
        {lines.map((line, lineIndex) => (
          allBallPositions[lineIndex].map((ballPos, ballIndex) => {
            // theta varie de pi à 0 pour un demi-cercle bas
            const theta = Math.PI + Math.sin(anim + line.phase[ballIndex]) * Math.PI;
            const xOffset = Math.cos(theta) * line.radius[ballIndex];
            const yOffset = Math.sin(theta) * line.radius[ballIndex] + line.baseY[ballIndex];
            return (
              <img
                key={`line-${lineIndex}-ball-${ballIndex}`}
                src={BALL_IMAGES[line.colorPattern[ballIndex]]}
                alt="balle décorative"
                style={{
                  position: 'absolute',
                  left: `calc(${(ballPos.x / 1920) * 100}% - 24px + ${xOffset}px)`,
                  top: `${ballPos.y - 240 + yOffset}px`,
                  width: 48,
                  height: 48,
                  pointerEvents: 'none',
                  zIndex: 2,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15)) drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                }}
              />
            );
          })
        )).flat()}
      </div>
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-balance mb-4 text-black">
              {decodeHtmlEntities(title)}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-pretty max-w-2xl text-muted-foreground">
                {decodeHtmlEntities(subtitle)}
              </p>
            )}
          </div>
          {backgroundImage && (
            <div className="shrink-0 relative bg-white">
              <div
                className="relative w-64 h-56 md:w-56 md:h-64 lg:w-64 lg:h-72 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt={backgroundAlt || title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
