import React, { useEffect, useState } from 'react';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const createSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 10 + Math.random() * 8,
          size: 2 + Math.random() * 5,
          opacity: 0.3 + Math.random() * 0.7,
          swayAmount: 50 + Math.random() * 150,
          swayDuration: 3 + Math.random() * 4,
        });
      }
      setSnowflakes(flakes);
    };

    createSnowflakes();
  }, []);

  return (
    <>
      <style>{`
        @keyframes snowfallAnim {
          0% {
            top: -10vh;
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }

        @keyframes swayAnim {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(var(--sway));
          }
        }

        .snowflake-item {
          position: fixed;
          top: -10vh;
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(255,255,255,0.9));
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(0,0,0,0.05);
          pointer-events: none;
          z-index: 5;
          will-change: transform;
          opacity: var(--opacity);
        }

        .snowflake-item-animated {
          animation: snowfallAnim var(--duration)s linear var(--delay)s infinite, swayAnim var(--sway-duration)s ease-in-out var(--delay)s infinite;
        }
      `}</style>

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake-item snowflake-item-animated"
          style={{
            '--size': `${flake.size}px`,
            '--delay': `${flake.delay}s`,
            '--duration': `${flake.duration}s`,
            '--opacity': flake.opacity,
            '--sway': `${flake.swayAmount}px`,
            '--sway-duration': `${flake.swayDuration}s`,
            left: `${flake.left}%`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};

export default Snowfall;
