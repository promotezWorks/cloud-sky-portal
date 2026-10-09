import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
  className?: string;
}

/**
 * Simple AI Chat Message Component (https://www.simple-ai.dev/)
 * Renders assistant and user bubbles with copy, SoundCN feedback, and streaming cursor.
 */
export function ChatMessage({
  role,
  content,
  isStreaming = false,
  timestamp,
  className,
}: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [playSuccess] = useSound('success', { volume: 0.35 });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl shadow-sm text-xs font-semibold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground border border-border/80"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>

      {/* Message Body */}
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-150",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-card-foreground rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block h-3.5 w-1.5 ml-1 bg-primary animate-pulse align-middle" />
          )}
        </div>

        {/* Timestamp and Actions Footer */}
        <div
          className={cn(
            "mt-1.5 flex items-center justify-between text-[11px] opacity-70 group-hover:opacity-100 transition-opacity",
            isUser ? "text-primary-foreground/80 justify-end" : "text-muted-foreground"
          )}
        >
          {timestamp && <span>{timestamp}</span>}

          {!isUser && (
            <button
              onClick={handleCopy}
              className="ml-auto inline-flex items-center space-x-1 p-1 hover:text-foreground rounded transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
