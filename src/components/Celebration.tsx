'use client';
import { generateCelebratoryAnimation } from '@/ai/flows/generate-celebratory-animation';
import { useState, useEffect } from 'react';

export default function Celebration({
  animationType,
}: {
  animationType: 'confetti' | 'cubeSpin';
}) {
  const [animationUri, setAnimationUri] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function getAnimation() {
      try {
        const result = await generateCelebratoryAnimation({ animationType });
        setAnimationUri(result.animationDataUri);
        setVisible(true);
        setTimeout(() => setVisible(false), 4000); // Hide after 4 seconds
      } catch (error) {
        console.error('Failed to generate celebration animation:', error);
      }
    }
    getAnimation();
  }, [animationType]);

  if (!animationUri || !visible) return null;

  // Simple confetti effect with CSS
  const ConfettiPiece = ({ style }: { style: React.CSSProperties }) => (
    <div
      className="absolute w-2 h-4"
      style={{
        ...style,
        animation: `fall ${Math.random() * 2 + 3}s linear infinite`,
      }}
    />
  );

  const colors = ['#00FFFF', '#800080', '#FF00FF', '#FFFFFF'];
  const confetti = Array.from({ length: 100 }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * -100}vh`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      transform: `rotate(${Math.random() * 360}deg)`,
      animationDelay: `${Math.random() * 2}s`,
    };
    return <ConfettiPiece key={i} style={style} />;
  });

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        <style jsx>{`
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                }
            }
        `}</style>
      {confetti}
    </div>
  );
}
