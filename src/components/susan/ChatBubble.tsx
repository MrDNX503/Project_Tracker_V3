import type { SusanMessage } from '../../types';
import { formatRelativeTime } from '../../utils/dates';
import { SusanAvatar } from './SusanAvatar';

interface ChatBubbleProps {
  message: SusanMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // SAFE markdown-lite parser: builds React elements instead of raw HTML
  // (never use dangerouslySetInnerHTML with model/user content — XSS).
  const parseInline = (text: string, keyBase: string) => {
    const nodes: React.ReactNode[] = [];
    // Tokenize **bold** and [label](url)
    const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let k = 0;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) nodes.push(text.slice(last, match.index));
      if (match[1] !== undefined) {
        nodes.push(<strong key={`${keyBase}-b${k++}`}>{match[1]}</strong>);
      } else {
        const url = match[3];
        // Only allow http/https links (blocks javascript:, data:, etc.)
        if (/^https?:\/\//i.test(url)) {
          nodes.push(
            <a key={`${keyBase}-a${k++}`} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
              {match[2]}
            </a>
          );
        } else {
          nodes.push(match[2]);
        }
      }
      last = re.lastIndex;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
  };

  const parseContent = (text: string) => (
    <div>
      {text.split('\n').map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {parseInline(line, `l${i}`)}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-end',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '80%'
    }}>
      {!isUser && (
        <SusanAvatar state="idle" size={32} />
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          borderBottomRightRadius: isUser ? '4px' : '16px',
          borderBottomLeftRadius: !isUser ? '4px' : '16px',
          backgroundColor: isUser ? 'var(--accent-primary)' : 'var(--bg-primary)',
          color: isUser ? '#000' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border-default)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lineHeight: 1.5,
          fontSize: '0.95rem'
        }}>
          {parseContent(message.content)}
        </div>
        
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
