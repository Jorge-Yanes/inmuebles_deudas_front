"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import PropertyCard from "@/components/property-card" // Assuming this component is styled or will adapt
import { Send, MessageSquareText, Bot, User, Loader2, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils" // Assuming you have a cn utility

// Types
interface ChatMessage {
  sender: "user" | "bot"
  text: string
}

type Asset = any // Replace with your actual Asset type

const ChatbotPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [propertyResults, setPropertyResults] = useState<Asset[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A slight delay to ensure the DOM has updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages])

  const handleSend = async () => {
    if (input.trim() === "" || loading) return

    const userMessage = input.trim()
    setMessages((prevMessages) => [...prevMessages, { sender: "user", text: userMessage }])
    setInput("")
    setLoading(true)
    setPropertyResults([])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.conversationalResponse) {
        setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: data.conversationalResponse }])
      } else if (data.error) {
        setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: `Error: ${data.error}` }])
      }

      if (data.propertyResults && Array.isArray(data.propertyResults)) {
        setPropertyResults(data.propertyResults)
      }
    } catch (error) {
      console.error("Error fetching from API:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Lo siento, ocurrió un error al procesar tu solicitud." },
      ])
      setPropertyResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevent newline on Enter
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
      {/* Optional Header */}
      <header className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto flex items-center justify-center">
          <MessageSquareText className="h-6 w-6 mr-2 text-sky-600" />
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Asistente Inmobiliario</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4">
        {/* Chat Panel */}
        <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn("flex items-end space-x-2", msg.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.sender === "bot" && <Bot className="h-6 w-6 text-sky-600 dark:text-sky-500 flex-shrink-0" />}
                  <div
                    className={cn(
                      "p-3 rounded-xl max-w-[80%] break-words",
                      msg.sender === "user"
                        ? "bg-sky-500 text-white rounded-br-none"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none",
                    )}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-0" {...props} />, // Remove default margin from p
                        // Add more custom renderers if needed
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  {msg.sender === "user" && (
                    <User className="h-6 w-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.sender === "user" && (
                <div className="flex items-end space-x-2 justify-start">
                  <Bot className="h-6 w-6 text-sky-600 dark:text-sky-500 flex-shrink-0" />
                  <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus-visible:ring-sky-500"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || input.trim() === ""}
                className="bg-sky-500 hover:bg-sky-600 text-white"
                size="icon"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Property Results Panel */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg hidden md:block">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
            Resultados de Propiedades
          </h2>
          {loading && propertyResults.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Buscando propiedades...</p>
            </div>
          )}
          {!loading &&
            propertyResults.length === 0 &&
            messages.length > 0 && ( // Only show if there was an interaction
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <SearchX className="h-12 w-12 mb-3 text-slate-400" />
                <p className="text-center">No se encontraron propiedades que coincidan con tu búsqueda.</p>
              </div>
            )}
          {!loading &&
            propertyResults.length === 0 &&
            messages.length === 0 && ( // Initial state
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <MessageSquareText className="h-12 w-12 mb-3 text-slate-400" />
                <p className="text-center">Los resultados de las propiedades aparecerán aquí.</p>
              </div>
            )}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4">
            {" "}
            {/* Adjusted for better vertical fit */}
            {propertyResults.map((asset, index) => (
              <PropertyCard key={index} property={asset} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage
