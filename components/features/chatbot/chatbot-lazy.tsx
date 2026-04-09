"use client"

import dynamic from "next/dynamic"

const Chatbot = dynamic(
    () => import("@/components/features/chatbot/chatbot").then(m => ({ default: m.Chatbot })),
    { ssr: false }
)

export function ChatbotLazy() {
    return <Chatbot />
}
