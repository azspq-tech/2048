import { useEffect, useState } from 'react';

interface ComboIndicatorProps {
  combo: number;
}

export function ComboIndicator({ combo }: ComboIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (combo >= 2) {
      setVisible(true);
      setKey(k => k + 1);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [combo]);

  if (!visible) return null;

  return (
    <div
      key={key}
      className="animate-combo-flash rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-4 py-1.5 text-center backdrop-blur-sm"
    >
      <span className="text-amber-300 font-bold text-sm">
        🔥 {combo}x Combo!
      </span>
    </div>
  );
}
