import type { SusanMessage } from '../../types';
import { formatRelativeTime } from '../../utils/dates';
import { SusanAvatar } from './SusanAvatar';

interface ChatBubbleProps {
  message: SusanMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // Basic markdown parsing for links and bold text
  const parseContent = (text: string) => {
    // This is a simple parser, for a real app consider marked or react-markdown
    let parsed = text;
    // Replace **bold** with <strong>bold</strong>
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace markdown links with actual links
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary)">$1</a>');
    // Replace newlines with <br />
    parsed = parsed.replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

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
