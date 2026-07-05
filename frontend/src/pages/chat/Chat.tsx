import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Plus, Search, X, Users } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { io as socketIO } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'https://tasknest-core.onrender.com'

const initialConversations = [
  { id: '1', name: '📢 General Channel', unread: 0, lastMessage: 'Welcome to the collaborative space!' },
  { id: '2', name: '🎨 Design Sync', unread: 0, lastMessage: 'Final mockups attached' },
  { id: '3', name: '🚀 Engineering Room', unread: 0, lastMessage: 'Sprint 2 planning complete' },
]

export default function Chat() {
  const location = useLocation()
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState('1')
  const [messageInput, setMessageInput] = useState('')
  const [conversations, setConversations] = useState(initialConversations)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [socket, setSocket] = useState<any>(null)
  
  // Real-time typing indicators
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: teamMembers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.getUsers()
      return data.data
    }
  })
  
  const [messages, setMessages] = useState<any[]>([
    { id: '1', roomId: '1', author: 'Jane Cooper', content: 'Welcome to our workspace! Let\'s collaborate here.', timestamp: '10:30 AM', isOwn: false },
    { id: '2', roomId: '1', author: 'Guy Hawkins', content: 'Excited to be building TaskNest!', timestamp: '10:32 AM', isOwn: false },
    { id: '3', roomId: '2', author: 'Esther Howard', content: 'Figma links have been shared in Design tab.', timestamp: '11:05 AM', isOwn: false },
  ])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Setup Socket Connection
  useEffect(() => {
    const newSocket = socketIO(SOCKET_URL)
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Handle Room and Message Events
  useEffect(() => {
    if (!socket) return

    const roomId = selectedConversation.toString()
    socket.emit('join-room', roomId)

    socket.on('receive-message', (data: any) => {
      if (data.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev
          const msgObj = {
            ...data,
            isOwn: data.authorId === user?.id
          }
          return [...prev, msgObj]
        })
      }
    })

    socket.on('typing', (data: any) => {
      if (data.roomId === roomId && data.userId !== user?.id) {
        setTypingUser(data.userName)
        setIsTyping(true)
      }
    })

    return () => {
      socket.off('receive-message')
      socket.off('typing')
    }
  }, [socket, selectedConversation, user])

  // Clear typing after pause
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isTyping, messageInput])

  // Direct message navigate logic
  useEffect(() => {
    if (location.state?.recipient) {
      const recipient = location.state.recipient
      const existing = conversations.find(c => c.name.includes(recipient.name))
      if (existing) {
        setSelectedConversation(existing.id)
      } else {
        const newConv = {
          id: (conversations.length + 1).toString(),
          name: `💬 Chat with ${recipient.name}`,
          unread: 0,
          lastMessage: 'Let\'s start talking!'
        }
        setConversations([newConv, ...conversations])
        setSelectedConversation(newConv.id)
      }
    }
  }, [location.state])

  const startNewChat = (recipient: any) => {
    const existing = conversations.find(c => c.name.includes(recipient.name))
    if (existing) {
      setSelectedConversation(existing.id)
    } else {
      const newConv = {
        id: (conversations.length + 1).toString(),
        name: `💬 Chat with ${recipient.name}`,
        unread: 0,
        lastMessage: 'Let\'s start talking!'
      }
      setConversations([newConv, ...conversations])
      setSelectedConversation(newConv.id)
    }
    setIsNewChatModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    if (socket) {
      socket.emit('typing', {
        roomId: selectedConversation.toString(),
        userId: user?.id,
        userName: user?.name || 'Someone'
      })
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && socket) {
      const msgData = {
        id: Date.now().toString(),
        roomId: selectedConversation.toString(),
        author: user?.name || 'You',
        authorId: user?.id,
        content: messageInput,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      socket.emit('send-message', msgData)
      setMessages((prev) => [...prev, { ...msgData, isOwn: true }])
      setMessageInput('')
      setIsTyping(false)
    }
  }

  // Active room messages
  const activeRoomMessages = messages.filter((m) => m.roomId === selectedConversation)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1 card p-5 flex flex-col overflow-hidden bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50">
        <div className="flex-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Workspace Chat</h2>
            <p className="text-xs text-gray-500 font-medium">Real-time team collaboration</p>
          </div>
          <button 
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search channels..." 
            className="input-base pl-10 text-sm py-2.5"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {conversations.map((conv) => {
            const isSelected = selectedConversation === conv.id
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative group ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                    : 'hover:bg-gray-100/70 dark:hover:bg-secondary-700/50 text-secondary-900 dark:text-gray-300'
                }`}
              >
                <div className="flex-between mb-1.5">
                  <p className="font-bold truncate pr-3 text-sm">{conv.name}</p>
                </div>
                <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 card flex flex-col overflow-hidden bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-secondary-700/50 flex-between bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-primary flex-center text-white font-extrabold shadow-sm">
              {conversations.find(c => c.id === selectedConversation)?.name.charAt(2) || '📢'}
            </div>
            <div>
              <h2 className="font-bold text-secondary-900 dark:text-white">
                {conversations.find(c => c.id === selectedConversation)?.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">REAL-TIME SOCKET</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/20 dark:bg-secondary-900/10 custom-scrollbar">
          {activeRoomMessages.length > 0 ? (
            activeRoomMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!msg.isOwn && <p className="text-[10px] font-bold text-gray-500 ml-1 mb-1">{msg.author}</p>}
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.isOwn 
                      ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' 
                      : 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-secondary-600/30'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-[9px] font-black text-gray-400 mt-1 opacity-60 px-1 uppercase tracking-wider">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex-center flex-col text-gray-400/80">
              <Users className="w-12 h-12 mb-3 opacity-30 animate-pulse text-primary" />
              <p className="text-sm font-bold">No messages in this room yet</p>
              <p className="text-xs mt-1">Send a message to start real-time discussion!</p>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-gray-500 ml-1 mb-0.5">{typingUser}</p>
                <div className="bg-white dark:bg-secondary-700 rounded-2xl px-4 py-3 rounded-tl-none border border-gray-100 dark:border-secondary-600/30 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-100 dark:border-secondary-700/50 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md">
          <div className="flex gap-4">
            <button className="p-3 bg-gray-100 dark:bg-secondary-700 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your collaborative message here..."
              className="input-base flex-1 py-3 text-sm focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="p-3 bg-primary text-white hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl animate-scale-in w-full max-w-md border border-gray-100 dark:border-secondary-700/50">
            <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex-between">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Direct Message</h2>
                <p className="text-sm text-gray-500">Start talking with team members</p>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-xl text-gray-400 transition-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="input-base pl-10 text-sm py-2"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((member: any) => (
                    <button
                      key={member._id}
                      onClick={() => startNewChat(member)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-secondary-700 transition-smooth text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex-center text-white font-bold shrink-0">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                      <span className="text-xs font-medium capitalize px-2 py-1 bg-primary/10 text-primary rounded-lg shrink-0">
                        {member.role}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No team members found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
