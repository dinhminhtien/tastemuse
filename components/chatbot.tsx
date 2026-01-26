"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Minimize2 } from "lucide-react"
import Image from "next/image"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là TasteMuse 🤖. Tôi có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hãy hỏi tôi bất cứ điều gì!",
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem("chatbot_show_suggestions")
    return stored ? stored === "true" : true
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const suggestions = [
    "Gợi ý món ăn trưa nhẹ",
    "Món chay ngon ở Ninh Kiều",
    "Quán lẩu cho nhóm 4 người",
    "Ăn tối dưới 100k/người",
    "Món đặc sản Cần Thơ",
  ]

  const scrollToBottom = () => {
    // Tìm viewport của ScrollArea và scroll đến cuối
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMessage = text.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: Date.now() }])
    setIsLoading(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to get response")
      }
      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: Date.now() },
      ])
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

  const formatTime = (t: number) =>
    new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(t))

  return (
    <>
      {/* Chatbot Button - Fixed ở góc dưới bên phải */}
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
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          {msg.timestamp && (
                            <div className={`mt-1 text-[10px] ${msg.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
    </>
  )
}
