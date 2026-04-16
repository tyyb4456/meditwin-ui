import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px 6px 8px',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        outline: 'none',
        boxShadow: isDark
          ? '0 0 0 1px rgba(124,120,166,0.3), 0 2px 8px rgba(0,0,0,0.4)'
          : '0 0 0 1px rgba(61,58,92,0.1), 0 2px 8px rgba(61,58,92,0.08)',
        minWidth: '72px',
        justifyContent: 'center',
      }}
    >
      {/* Animated icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDark ? 'rgba(124,120,166,0.2)' : 'rgba(61,58,92,0.08)',
          transition: 'background 0.3s ease',
          flexShrink: 0,
        }}
      >
        {isDark ? (
          <Sun
            size={12}
            strokeWidth={2.5}
            style={{
              color: 'var(--color-accent)',
              animation: 'spin-in 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ) : (
          <Moon
            size={12}
            strokeWidth={2.5}
            style={{
              color: 'var(--color-accent)',
              animation: 'spin-in 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}
      </span>

      {/* Label */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          transition: 'color 0.3s ease',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        {isDark ? 'Light' : 'Dark'}
      </span>

      <style>{`
        @keyframes spin-in {
          from { transform: rotate(-90deg) scale(0.6); opacity: 0; }
          to   { transform: rotate(0deg) scale(1);   opacity: 1; }
        }
        #theme-toggle-btn:hover {
          border-color: var(--color-accent) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15) !important;
        }
        #theme-toggle-btn:active {
          transform: scale(0.96) translateY(0px);
        }
      `}</style>
    </button>
  );
}