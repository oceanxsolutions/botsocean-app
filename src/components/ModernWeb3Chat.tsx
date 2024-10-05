"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageSquare, Send, Settings, Bot, User, Menu, PlusCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const models = [
  { id: "qwen2:0.5b", name: "qwen2:0.5b" },
]

export default function ModernWeb3Chat() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [balance, setBalance] = useState("0.00")
  const [chatId, setChatId] = useState()
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello! How can I assist you today?", sender: "bot" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState(models[0].name)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  const connectWallet = () => {
    setIsWalletConnected(true)
    setBalance("1.23") // Simulated balance
  }

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, content: inputMessage, sender: "user" }])
      setInputMessage("")

      const newChatData = {
        user_id: '111111',
        chat_id: chatId,
        model: selectedModel,
        prompt: inputMessage
      }

      try {
        const response = await fetch('http://localhost:3001/prompt/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newChatData),
        });

        if (!response.ok) {
          throw new Error('Failed to create new chat');
        }

        const data = await response.json();
        const content = data.response;
        console.log(content);
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, content: content, sender: "assistant" },
        ])
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  const createNewChat = async () => {
    setMessages([{ id: 1, content: "Hello! How can I assist you today?", sender: "bot" }])

    const newChatData = {
      user_id: '111111', // replace with the actual user ID
      model: selectedModel,      // replace with the actual model type
    };

    try {
      const response = await fetch('http://localhost:3001/prompt/newChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChatData),
      });

      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }

      const data = await response.json();
      setChatId(data.chat_id)
      console.log(data); // New chat created successfully
    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    const scrollArea = document.querySelector('.scroll-area')
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat history sidebar */}
      {isSidebarVisible && (
        <div className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Chat History</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarVisible(false)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate">{message.content}</span>
                </div>
              </div>
            ))}
          </ScrollArea>

          {/* Wallet connection / Settings */}
          <div className="border-t border-gray-200 p-4">
            {isWalletConnected ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-2">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Model Selection</h3>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Wallet Actions</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => alert("Deposit functionality")} className="flex-1">
                            Deposit
                          </Button>
                          <Button variant="outline" onClick={() => alert("Withdraw functionality")} className="flex-1">
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                  <p className="text-sm mb-1">
                    <span className="font-semibold text-gray-600">Balance:</span>{" "}
                    <span className="font-bold text-gray-800">{balance} ETH</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-600">Model:</span>{" "}
                    <span className="font-bold text-gray-800">{models.find(m => m.id === selectedModel)?.name}</span>
                  </p>
                </div>
              </>
            ) : (
              <Button onClick={connectWallet} className="w-full">Connect Wallet</Button>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isSidebarVisible && (
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarVisible(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={createNewChat}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </header>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4 scroll-area">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-sm rounded-lg p-4 ${message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                    }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="font-semibold">{message.sender === "user" ? "You" : "AI"}</span>
                  </div>
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        {/* Message input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}