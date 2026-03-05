"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  X, Send, Minimize2, LogIn, Plus, MessageSquare, Trash2,
  PanelLeftClose, PanelLeftOpen, Pencil, Check, Clock,
} from "lucide-react"
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

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
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

  // Chat history state
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
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

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch usage on open
  useEffect(() => {
    if (isOpen) {
      fetchUsage()
    }
  }, [isOpen])

  // Focus edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

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
      // Silently fail
    }
  }

  async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  // ===================== Chat History Functions =====================

  const fetchConversations = useCallback(async () => {
    try {
      const token = await getAuthToken()
      if (!token) return

      setLoadingConversations(true)
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.error("Error fetching conversations:", e)
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  // Load conversations when history panel opens
  useEffect(() => {
    if (showHistory && isLoggedIn) {
      fetchConversations()
    }
  }, [showHistory, isLoggedIn, fetchConversations])

  const createNewConversation = async () => {
    try {
      const token = await getAuthToken()
      if (!token) return

      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        const data = await res.json()
        setActiveConversationId(data.conversation.id)
        setMessages([
          {
            role: "assistant",
            content: "Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!",
          },
        ])
        setShowHistory(false)
        fetchConversations()
      }
    } catch (e) {
      console.error("Error creating conversation:", e)
    }
  }

  const loadConversation = async (convId: string) => {
    try {
      const token = await getAuthToken()
      if (!token) return

      const res = await fetch(`/api/chat/conversations?id=${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setActiveConversationId(convId)
        const loadedMessages: Message[] = data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
        }))

        if (loadedMessages.length === 0) {
          loadedMessages.unshift({
            role: "assistant",
            content: "Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!",
          })
        }

        setMessages(loadedMessages)
        setShowHistory(false)
      }
    } catch (e) {
      console.error("Error loading conversation:", e)
    }
  }

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const token = await getAuthToken()
      if (!token) return

      await fetch(`/api/chat/conversations?id=${convId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (activeConversationId === convId) {
        startNewChat()
      }
      fetchConversations()
    } catch (e) {
      console.error("Error deleting conversation:", e)
    }
  }

  const handleRenameConversation = async (convId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }
    try {
      const token = await getAuthToken()
      if (!token) return

      await fetch("/api/chat/conversations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: convId, title: editTitle.trim() }),
      })

      setEditingId(null)
      fetchConversations()
    } catch (e) {
      console.error("Error renaming conversation:", e)
    }
  }

  const startNewChat = () => {
    setActiveConversationId(null)
    setMessages([
      {
        role: "assistant",
        content: "Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!",
      },
    ])
    setShowHistory(false)
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString("vi-VN")
  }

  // ===================== Send Message =====================

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

      // Auto-create conversation for logged-in users if none active
      let currentConvId = activeConversationId
      if (token && !currentConvId) {
        try {
          const res = await fetch("/api/chat/conversations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: userMessage.slice(0, 80) }),
          })
          if (res.ok) {
            const data = await res.json()
            currentConvId = data.conversation.id
            setActiveConversationId(currentConvId)
          }
        } catch (e) {
          console.error("Auto-create conversation error:", e)
        }
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
          conversationId: currentConvId,
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

      // Update local usage count & refresh conversations list
      if (token) {
        setUsage((prev) => ({
          ...prev,
          used: prev.used + 1,
          remaining: prev.limit === -1 ? -1 : Math.max(0, prev.remaining - 1),
        }))
        // Refresh sidebar to show updated title
        fetchConversations()
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

  // ===================== Render =====================

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-20 md:h-20 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce hover:animate-none"
          aria-label="Mở chatbot"
        >
          <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
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
          className={`fixed z-50 bg-card border border-border shadow-2xl flex transition-all duration-300 ${isMinimized
            ? "bottom-4 right-4 md:bottom-6 md:right-6 h-14 md:h-16 w-[280px] md:w-[420px] rounded-lg"
            : "inset-0 md:inset-auto md:bottom-6 md:right-6 md:rounded-lg md:h-[600px]"
            } ${!isMinimized && showHistory
              ? "md:w-[720px]"
              : !isMinimized
                ? "md:w-[420px]"
                : ""
            }`}
        >
          {/* History Sidebar - full overlay on mobile, side panel on desktop */}
          {!isMinimized && showHistory && (
            <div className="absolute inset-0 z-10 md:relative md:inset-auto md:z-auto md:w-[280px] border-r border-border flex flex-col bg-card md:bg-muted/30">
              {/* Sidebar Header */}
              <div className="p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:pt-3 border-b border-border flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Lịch sử trò chuyện
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-7 md:w-7"
                  onClick={() => setShowHistory(false)}
                  aria-label="Đóng lịch sử"
                >
                  <X className="h-4 w-4 md:hidden" />
                  <PanelLeftClose className="h-3.5 w-3.5 hidden md:block" />
                </Button>
              </div>

              {/* New Chat Button */}
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs h-10 md:h-9 border-dashed hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => {
                    startNewChat()
                    if (isLoggedIn) createNewConversation()
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Cuộc trò chuyện mới
                </Button>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                <div className="px-2 pb-2 space-y-0.5">
                  {!isLoggedIn && (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Đăng nhập để lưu lịch sử trò chuyện
                      </p>
                      <Button
                        onClick={() => window.location.href = "/login"}
                        size="sm"
                        variant="outline"
                        className="text-xs h-9"
                      >
                        <LogIn className="h-3 w-3 mr-1.5" />
                        Đăng nhập
                      </Button>
                    </div>
                  )}

                  {loadingConversations && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  {isLoggedIn && !loadingConversations && conversations.length === 0 && (
                    <div className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Chưa có cuộc trò chuyện nào
                      </p>
                    </div>
                  )}

                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative rounded-md cursor-pointer transition-all duration-150 ${activeConversationId === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/60 active:bg-muted/80 border border-transparent"
                        }`}
                      onClick={() => {
                        if (editingId !== conv.id) loadConversation(conv.id)
                      }}
                    >
                      <div className="px-3 py-3 md:py-2.5">
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              ref={editInputRef}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameConversation(conv.id)
                                if (e.key === "Escape") setEditingId(null)
                              }}
                              className="flex-1 text-sm md:text-xs bg-background border border-border rounded px-2 py-1.5 md:py-1 outline-none focus:border-primary/50"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRenameConversation(conv.id)
                              }}
                              className="p-1.5 md:p-1 hover:text-primary"
                            >
                              <Check className="h-4 w-4 md:h-3 md:w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5 md:gap-2">
                              <MessageSquare className="h-4 w-4 md:h-3.5 md:w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-xs font-medium truncate leading-tight">
                                  {conv.title}
                                </p>
                                <p className="text-[11px] md:text-[10px] text-muted-foreground mt-0.5">
                                  {formatRelativeTime(conv.updated_at)}
                                </p>
                              </div>
                            </div>

                            {/* Action buttons - always visible on mobile, hover on desktop */}
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex md:hidden md:group-hover:flex items-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingId(conv.id)
                                  setEditTitle(conv.title)
                                }}
                                className="p-2 md:p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Đổi tên"
                              >
                                <Pencil className="h-3.5 w-3.5 md:h-3 md:w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                className="p-2 md:p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                aria-label="Xóa"
                              >
                                <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 md:p-4 pt-[max(0.625rem,env(safe-area-inset-top))] md:pt-4 border-b border-border bg-primary/5">
              <div className="flex flex-1 items-center gap-2 md:gap-3 min-w-0 pr-2">
                {/* History toggle button */}
                {!isMinimized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 md:h-8 md:w-8 shrink-0"
                    onClick={() => setShowHistory(!showHistory)}
                    aria-label={showHistory ? "Ẩn lịch sử" : "Lịch sử trò chuyện"}
                  >
                    {showHistory ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeftOpen className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="TasteMuse Mascot"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-semibold text-foreground text-sm md:text-base truncate">TasteMuse AI</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" aria-hidden />
                    <span className="truncate">{isMinimized ? "Đang chờ bạn..." : "Đang trực tuyến"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 md:gap-2 shrink-0">
                {/* New chat button */}
                {!isMinimized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 md:h-8 md:w-8 shrink-0"
                    onClick={() => {
                      startNewChat()
                      if (isLoggedIn) createNewConversation()
                    }}
                    aria-label="Cuộc trò chuyện mới"
                    title="Cuộc trò chuyện mới"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {/* Usage Indicator - Show on both but adapt size */}
                {!isMinimized && (
                  <div className="shrink-0 scale-90 md:scale-100 origin-right">
                    <UsageIndicator
                      used={usage.used}
                      limit={usage.limit}
                      isPremium={usage.isPremium}
                    />
                  </div>
                )}
                {/* Minimize - only on desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:h-8 md:w-8 hidden md:inline-flex"
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
                  className="h-9 w-9 md:h-8 md:w-8"
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
                    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[88%] md:max-w-[80%] rounded-lg px-3 py-2 md:px-4 ${msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                              }`}
                          >
                            <div className="text-sm prose prose-sm dark:prose-invert max-w-none wrap-break-word">
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
                          <div className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 text-center space-y-3">
                            <p className="text-sm font-medium">🔐 Đăng nhập để tiếp tục</p>
                            <p className="text-xs text-muted-foreground">Đăng nhập miễn phí để nhận 10 lượt hỏi AI mỗi ngày</p>
                            <Button
                              onClick={() => window.location.href = "/login"}
                              size="sm"
                              className="bg-linear-to-r from-amber-500 to-orange-500 text-white"
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
                                className="text-xs px-3 py-2 md:py-1.5 rounded-full border border-border hover:bg-muted active:bg-muted/80 transition"
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
                <div className="p-3 md:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập câu hỏi của bạn..."
                      disabled={isLoading}
                      className="flex-1 h-10 md:h-9 text-base md:text-sm"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="shrink-0 h-10 w-10 md:h-9 md:w-9"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
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