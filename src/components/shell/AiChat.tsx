import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Sparkles, X, Send, RotateCcw, ChevronDown } from "lucide-react";
import { buildSystemPrompt } from "@/lib/aiContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
const MODEL = "claude-haiku-4-5-20251001";
const NAV_REGEX = /\[navigate:(\/[^\]]*)\]/;

const SUGGESTIONS = [
  "How many residents are in memory care?",
  "Which leads need follow-ups?",
  "Show me weight loss alerts",
  "Take me to eMAR",
  "What medications is Beverly Stone on?",
  "Summarize today's med pass",
];

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function getTimestamp() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    if (!API_KEY) {
      setError("VITE_ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.");
      return;
    }

    setError(null);
    setInput("");

    const userMsg: Message = { role: "user", content, timestamp: getTimestamp() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "", timestamp: getTimestamp() };
    setMessages([...history, assistantMsg]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-client-side-keys": "true",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          stream: true,
          system: buildSystemPrompt(),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              fullContent += parsed.delta.text;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { ...prev[prev.length - 1], content: fullContent },
              ]);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Process navigation command after stream completes
      const navMatch = fullContent.match(NAV_REGEX);
      if (navMatch) {
        const path = navMatch[1];
        const cleaned = fullContent.replace(NAV_REGEX, "").trimEnd();
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], content: cleaned },
        ]);
        setTimeout(() => navigate({ to: path as "/" }), 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], content: `Error: ${msg}` },
      ]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          open
            ? "bg-muted text-muted-foreground scale-90"
            : "bg-[#8B5CF6] text-white hover:scale-105 hover:shadow-xl",
        )}
        aria-label="Open AI assistant"
      >
        {open ? <ChevronDown size={20} /> : <Sparkles size={20} />}
      </button>

      {/* Chat panel */}
      <div className={cn(
        "fixed bottom-22 right-6 z-50 w-[400px] rounded-xl border border-border bg-card shadow-2xl flex flex-col transition-all duration-200 origin-bottom-right",
        open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
      )}
        style={{ maxHeight: "560px", bottom: open ? "88px" : "80px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0">
          <div className="size-7 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center">
            <Sparkles size={13} className="text-[#8B5CF6]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Haven AI</div>
            <div className="text-[10px] text-muted-foreground">Ask anything about your community</div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center pt-2">
                I know everything in Haven OS — residents, meds, leads, dining, billing. Ask me anything.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {msg.role === "assistant" && (
                <div className="size-6 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={10} className="text-[#8B5CF6]" />
                </div>
              )}
              <div className={cn("max-w-[82%] space-y-0.5", msg.role === "user" ? "items-end flex flex-col" : "")}>
                <div className={cn(
                  "rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-[#8B5CF6] text-white rounded-tr-sm"
                    : "bg-muted/40 text-foreground rounded-tl-sm border border-border/60",
                )}>
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "")}
                </div>
                <div className="text-[9px] text-muted-foreground px-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {error && (
            <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-[#8B5CF6]/40 focus-within:border-[#8B5CF6]/50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent text-xs resize-none focus:outline-none max-h-24 leading-relaxed"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="size-6 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0 mb-0.5"
            >
              <Send size={11} />
            </button>
          </div>
          <div className="text-[9px] text-muted-foreground/50 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </>
  );
}
