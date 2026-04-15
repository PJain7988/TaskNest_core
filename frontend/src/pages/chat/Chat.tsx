import { useState, useEffect } from 'react'
import { Send, Paperclip, Smile, Plus, Search, X, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

const initialConversations = [
  { id: 1, name: 'General', unread: 2, lastMessage: 'Hey team!' },
  { id: 2, name: 'Project Alpha', unread: 0, lastMessage: 'Meeting at 3 PM' },
  { id: 3, name: 'Design Team', unread: 5, lastMessage: 'Final designs attached' },
]

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [messageInput, setMessageInput] = useState('')
  const [conversations, setConversations] = useState(initialConversations)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  
  const { data: teamMembers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.getUsers()
      return data.data
    }
  })
  
  const [messages, setMessages] = useState([
    { id: 1, author: 'Alex Rivera', content: 'Hey team! How are we doing today?', timestamp: '10:30 AM', isOwn: false },
    { id: 2, author: 'You', content: 'All good! Working on the dashboard updates', timestamp: '10:32 AM', isOwn: true },
    { id: 3, author: 'Jane Smith', content: 'I just pushed the new designs to the repo', timestamp: '10:35 AM', isOwn: false },
    { id: 4, author: 'You', content: 'Great! I\'ll review them after lunch', timestamp: '10:36 AM', isOwn: true },
  ])

  useEffect(() => {
    if (location.state?.recipient) {
      const recipient = location.state.recipient
      // Check if conversation exists
      const existing = conversations.find(c => c.name === recipient.name)
      if (existing) {
        setSelectedConversation(existing.id)
      } else {
        const newConv = {
          id: conversations.length + 1,
          name: recipient.name,
          unread: 0,
          lastMessage: 'Starting a new conversation...'
        }
        setConversations([newConv, ...conversations])
        setSelectedConversation(newConv.id)
      }
    }
  }, [location.state])

  const startNewChat = (recipient: any) => {
    const existing = conversations.find(c => c.name === recipient.name)
    if (existing) {
      setSelectedConversation(existing.id)
    } else {
      const newConv = {
        id: conversations.length + 1,
        name: recipient.name,
        unread: 0,
        lastMessage: 'Starting a new conversation...'
      }
      setConversations([newConv, ...conversations])
      setSelectedConversation(newConv.id)
    }
    setIsNewChatModalOpen(false)
  }

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          author: 'You',
          content: messageInput,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
        },
      ])
      setMessageInput('')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1 card p-4 flex flex-col overflow-hidden">
        <div className="flex-between mb-4">
          <h2 className="font-bold text-secondary-900 dark:text-white">Messages</h2>
          <button 
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="input-base pl-10 text-sm py-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full text-left p-4 rounded-2xl transition-smooth relative group ${
                selectedConversation === conv.id
                  ? 'bg-primary text-white shadow-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-gray-300'
              }`}
            >
              <div className="flex-between mb-1">
                <p className="font-bold truncate pr-4">{conv.name}</p>
                {conv.unread > 0 && (
                  <span className="bg-danger text-white text-[10px] font-black rounded-full px-1.5 py-0.5">
                    {conv.unread}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${selectedConversation === conv.id ? 'text-white/70' : 'text-gray-500 font-medium'}`}>
                {conv.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex-between bg-white/50 dark:bg-secondary-800/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex-center text-white font-bold">
              {conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-secondary-900 dark:text-white">
                {conversations.find(c => c.id === selectedConversation)?.name}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider">ONLINE</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-xl transition-smooth">
              <Plus className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-secondary-900/10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!msg.isOwn && <p className="text-[10px] font-bold text-gray-500 ml-1 mb-1">{msg.author}</p>}
                <div className={`rounded-2xl px-4 py-3 shadow-soft ${
                  msg.isOwn 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1 opacity-60 px-1">
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-100 dark:border-secondary-700 bg-white/50 dark:bg-secondary-800/50 backdrop-blur-md">
          <div className="flex gap-4">
            <button className="p-3 bg-gray-100 dark:bg-secondary-700 rounded-2xl hover:bg-primary/10 hover:text-primary transition-smooth">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message here..."
              className="input-base flex-1 py-3"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 bg-primary text-white hover:bg-primary-700 rounded-2xl shadow-primary transition-smooth"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl animate-scale-in w-full max-w-md">
            <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex-between">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">New Message</h2>
                <p className="text-sm text-gray-500">Select a team member to start a conversation</p>
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
