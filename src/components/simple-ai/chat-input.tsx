import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, Paperclip, Mic, StopCircle, Sparkles } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  className?: string;
  modelName?: string;
}

/**
 * Simple AI Chat Input Component (https://www.simple-ai.dev/)
 * Multi-action AI prompt box with auto-expanding textarea, attachments, model indicator, and SoundCN audio.
 */
export function ChatInput({
  placeholder = "Ask an AI agent anything...",
  onSubmit,
  isLoading = false,
  onStop,
  className,
  modelName = "Gemini 3.8",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [playClick] = useSound('click');
  const [playPop] = useSound('pop');

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isLoading) {
      playClick();
      onStop?.();
      return;
    }

    if (!value.trim()) return;

    playPop();
    onSubmit?.(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-lg transition-all duration-200 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
    >
      {/* Top Model Badge Pill */}
      <div className="flex items-center justify-between px-4 pt-3 text-xs text-muted-foreground">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-secondary/80 px-2.5 py-0.5 font-medium text-foreground/80 border border-border/50">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>{modelName}</span>
        </div>
        <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
          Shift + Enter for new line
        </span>
      </div>

      {/* Auto-expanding Input Area */}
      <div className="px-4 py-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-44 min-h-[38px] leading-relaxed"
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => playClick()}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => playClick()}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!isLoading && !value.trim()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 shadow-sm",
            isLoading
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : value.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
          )}
          title={isLoading ? "Stop generation" : "Send message"}
        >
          {isLoading ? (
            <StopCircle className="h-4 w-4 animate-pulse" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
