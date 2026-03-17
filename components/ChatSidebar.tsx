"use client";

import { useChatSidebar } from "./ChatContext";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send } from "lucide-react";

const transport = new TextStreamChatTransport({
  api: "/api/chat",
});

/** Typing animation component — reveals text character by character */
function TypingText({
  text,
  speed = 18,
  onUpdate,
}: {
  text: string;
  speed?: number;
  onUpdate?: () => void;
}) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    // If the full text changed (new characters streamed in), keep catching up
    if (text === prevTextRef.current) return;

    const oldLen = prevTextRef.current.length;
    prevTextRef.current = text;

    // If text got shorter (new message), reset
    if (text.length < oldLen) {
      setDisplayedCount(0);
    }
  }, [text]);

  useEffect(() => {
    if (displayedCount >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedCount((prev) => {
        // Reveal a few characters at a time for longer texts
        const step = text.length > 200 ? 3 : 1;
        return Math.min(prev + step, text.length);
      });
      onUpdate?.();
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedCount, text, speed, onUpdate]);

  return (
    <>
      {text.slice(0, displayedCount)}
      {displayedCount < text.length && (
        <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      )}
    </>
  );
}

export function ChatSidebar() {
  const { isOpen, setIsOpen } = useChatSidebar();
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col sm:rounded-l-2xl overflow-hidden transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            🤖 AI Twin
          </h2>
          <p className="text-xs text-muted-foreground">
            Ask me anything about my portfolio!
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm max-w-[250px] text-muted-foreground">
              Hey! I&apos;m the AI twin. Ask me anything about my work,
              skills, or experience!
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[300px]">
              {[
                "Tell me about yourself",
                "What are your skills?",
                "Do you have any experience?",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={async () => {
                    setInput("");
                    await sendMessage({ text: q });
                  }}
                  className="text-left text-xs bg-muted hover:bg-muted/80 border border-border rounded-xl px-3 py-2.5 transition-colors text-foreground cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            // Extract text content from UIMessage parts
            const textContent =
              m.parts
                ?.filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("") ?? "";

            const isLastAssistant =
              m.role === "assistant" &&
              idx === messages.length - 1;

            return (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm border border-border"
                  }`}
                >
                  {m.role === "assistant" && isLastAssistant ? (
                    <TypingText
                      text={textContent}
                      speed={35}
                      onUpdate={scrollToBottom}
                    />
                  ) : (
                    textContent
                  )}
                </div>
              </div>
            );
          })
        )}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm border border-border px-4 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-muted border border-border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 pr-12 text-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
