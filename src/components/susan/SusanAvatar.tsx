
interface SusanAvatarProps {
  state: 'idle' | 'thinking' | 'speaking';
  size?: number;
  style?: React.CSSProperties;
}

export function SusanAvatar({ state, size = 64, style }: SusanAvatarProps) {
  // Use simple CSS animations for the different states
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        position: 'relative',
        ...style 
      }}
      className={`susan-avatar ${state}`}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          opacity: state === 'thinking' ? 0.5 : 0.2,
          filter: 'blur(10px)',
          animation: state === 'thinking' ? 'pulse-glow 1s infinite alternate' : 'none',
          transition: 'all 0.5s ease'
        }} 
      />
      
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 64 64" 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative', 
          zIndex: 1,
          animation: state === 'speaking' ? 'bounce 2s infinite' : 'none'
        }}
      >
        <defs>
          <linearGradient id={`susan-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-secondary)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Robot head */}
        <rect x="12" y="16" width="40" height="36" rx="8" fill={`url(#susan-grad-${size})`} />
        
        {/* Antenna */}
        <line x1="32" y1="16" x2="32" y2="6" stroke={`url(#susan-grad-${size})`} strokeWidth="3" strokeLinecap="round" />
        <circle 
          cx="32" 
          cy="4" 
          r="3" 
          fill="var(--accent-primary)" 
          style={{
            animation: state === 'thinking' ? 'pulse 0.5s infinite alternate' : 'none'
          }}
        />
        
        {/* Eyes */}
        <circle cx="22" cy="32" r="5" fill="var(--bg-primary)" />
        <circle cx="42" cy="32" r="5" fill="var(--bg-primary)" />
        <circle cx="23" cy="31" r="2" fill="#fff" />
        <circle cx="43" cy="31" r="2" fill="#fff" />
        
        {/* Mouth */}
        {state === 'speaking' ? (
          <rect x="24" y="42" width="16" height="6" rx="3" fill="var(--bg-primary)">
            <animate attributeName="height" values="2;8;2" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="44;41;44" dur="0.5s" repeatCount="indefinite" />
          </rect>
        ) : (
          <rect x="24" y="42" width="16" height="3" rx="1.5" fill="var(--bg-primary)" />
        )}
        
        {/* Ears */}
        <rect x="6" y="24" width="6" height="12" rx="3" fill={`url(#susan-grad-${size})`} opacity="0.7" />
        <rect x="52" y="24" width="6" height="12" rx="3" fill={`url(#susan-grad-${size})`} opacity="0.7" />
      </svg>
    </div>
  );
}
