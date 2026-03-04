"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Minimize2, LogIn } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { UsageIndicator } from "@/components/usage-indicator"
import { UpgradeModal } from "@/components/upgrade-modal"
import { supabase } from "@/lib/supabase"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

interface UsageInfo {
  used: number
  limit: number
  remaining: number
  isPremium: boolean
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!",
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem("chatbot_show_suggestions")
    return stored ? stored === "true" : true
  })

  // Freemium state
  const [usage, setUsage] = useState<UsageInfo>({ used: 0, limit: 10, remaining: 10, isPremium: false })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [guestQueryCount, setGuestQueryCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0
    return parseInt(window.localStorage.getItem("guest_query_count") || "0", 10)
  })
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const suggestions = [
    "📍Tìm quán ngon gần Ninh Kiều",
    "🍜Gợi ý món ăn trưa",
    "🍲Quán lẩu cho nhóm 4 người",
    "💸Ăn tối dưới 100k/người",
  ]

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          })
        }
      }
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    window.localStorage.setItem("chatbot_show_suggestions", String(showSuggestions))
  }, [showSuggestions])

  useEffect(() => {
    const openHandler = () => {
      setIsOpen(true)
      setIsMinimized(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    window.addEventListener("open-chatbot", openHandler as EventListener)
    return () => {
      window.removeEventListener("open-chatbot", openHandler as EventListener)
    }
  }, [])

  // Fetch usage on open
  useEffect(() => {
    if (isOpen) {
      fetchUsage()
    }
  }, [isOpen])

  async function fetchUsage() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch("/api/usage", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsage({
          used: data.ai_chat?.used || 0,
          limit: data.ai_chat?.limit || 10,
          remaining: data.ai_chat?.remaining || 10,
          isPremium: data.isPremium || false,
        })
      }
    } catch (e) {
      // Silently fail — usage indicator just won't update
    }
  }

  async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMessage = text.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: Date.now() }])
    setIsLoading(true)

    try {
      const token = await getAuthToken()

      // Guest user limit: 1 query then prompt login
      if (!token) {
        if (guestQueryCount >= 1) {
          setShowLoginPrompt(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "🔒 Bạn cần đăng nhập để tiếp tục sử dụng TasteMuse AI. Đăng nhập miễn phí để có 10 lượt hỏi AI mỗi ngày!",
              timestamp: Date.now(),
            },
          ])
          setIsLoading(false)
          return
        }
        const newCount = guestQueryCount + 1
        setGuestQueryCount(newCount)
        window.localStorage.setItem("guest_query_count", String(newCount))
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      })

      if (response.status === 403) {
        const data = await response.json()
        if (data.code === "GUEST_LIMIT_EXCEEDED" || data.requireLogin) {
          setShowLoginPrompt(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.error || "🔒 Bạn cần đăng nhập để tiếp tục sử dụng.",
              timestamp: Date.now(),
            },
          ])
          setIsLoading(false)
          return
        }
        if (data.code === "USAGE_LIMIT_EXCEEDED" || data.upgrade) {
          setUsage((prev) => ({
            ...prev,
            used: data.usage?.used || prev.limit,
            remaining: 0,
          }))
          setShowUpgradeModal(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "✨ " + data.error,
              timestamp: Date.now(),
            },
          ])
          setIsLoading(false)
          return
        }
      }

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: Date.now() },
      ])

      // Update local usage count
      if (token) {
        setUsage((prev) => ({
          ...prev,
          used: prev.used + 1,
          remaining: prev.limit === -1 ? -1 : Math.max(0, prev.remaining - 1),
        }))
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    await sendMessage(input)
  }

  const handleSuggestionClick = async (text: string) => {
    setInput(text)
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        window.location.href = "/login"
        return
      }
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (e) {
      console.error("Upgrade error:", e)
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleStartTrial = async () => {
    setUpgradeLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        window.location.href = "/login"
        return
      }
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trial: true }),
      })
      const data = await res.json()
      if (data.success) {
        setUsage({ used: 0, limit: -1, remaining: -1, isPremium: true })
        setShowUpgradeModal(false)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "🎉 Chúc mừng! Bạn đã kích hoạt dùng thử Premium 3 ngày. Hãy tận hưởng AI không giới hạn nhé! ✨",
            timestamp: Date.now(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Không thể kích hoạt dùng thử.",
            timestamp: Date.now(),
          },
        ])
      }
    } catch (e) {
      console.error("Trial error:", e)
    } finally {
      setUpgradeLoading(false)
    }
  }

  const formatTime = (t: number) =>
    new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(t))

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce hover:animate-none"
          aria-label="Mở chatbot"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="TasteMuse Mascot"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[380px] md:w-[420px] bg-card border border-border rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="TasteMuse Mascot"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">TasteMuse AI</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                  {isMinimized ? "Đang chờ bạn..." : "Đang trực tuyến"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Usage Indicator */}
              {!isMinimized && (
                <UsageIndicator
                  used={usage.used}
                  limit={usage.limit}
                  isPremium={usage.isPremium}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsMinimized(!isMinimized)
                  if (!isMinimized) {
                    setTimeout(() => inputRef.current?.focus(), 100)
                  }
                }}
                aria-label={isMinimized ? "Mở rộng" : "Thu nhỏ"}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng chatbot"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                  <div className="p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                            }`}
                        >
                          <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown
                              components={{
                                p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0 leading-relaxed text-sm">{children}</p>,
                                a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-bold bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full transition-all text-xs border border-primary/20 my-1"
                                  >
                                    {children}
                                  </a>
                                ),
                                strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-foreground">{children}</strong>,
                                ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc ml-4 mb-3 space-y-2">{children}</ul>,
                                ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal ml-4 mb-3 space-y-2">{children}</ol>,
                                li: ({ children }: { children?: React.ReactNode }) => <li className="text-sm leading-relaxed">{children}</li>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          {msg.timestamp && (
                            <div className={`mt-1 text-[10px] ${msg.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Login prompt for guests */}
                    {showLoginPrompt && (
                      <div className="flex justify-center">
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 text-center space-y-3">
                          <p className="text-sm font-medium">🔐 Đăng nhập để tiếp tục</p>
                          <p className="text-xs text-muted-foreground">Đăng nhập miễn phí để nhận 10 lượt hỏi AI mỗi ngày</p>
                          <Button
                            onClick={() => window.location.href = "/login"}
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Đăng nhập với Google
                          </Button>
                        </div>
                      </div>
                    )}

                    {showSuggestions && !messages.some((m) => m.role === "user") && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-muted-foreground">Gợi ý nhanh</div>
                          <button
                            onClick={() => setShowSuggestions(false)}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                            aria-label="Ẩn gợi ý"
                          >
                            Ẩn gợi ý
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSuggestionClick(s)}
                              disabled={isLoading}
                              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {!showSuggestions && !messages.some((m) => m.role === "user") && (
                      <div className="pt-2">
                        <button
                          onClick={() => setShowSuggestions(true)}
                          className="text-[11px] text-muted-foreground hover:text-foreground"
                          aria-label="Hiện gợi ý"
                        >
                          Hiện gợi ý
                        </button>
                      </div>
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        usageInfo={{ used: usage.used, limit: usage.limit }}
        onUpgrade={handleUpgrade}
        onStartTrial={handleStartTrial}
        isLoading={upgradeLoading}
      />
    </>
  )
}