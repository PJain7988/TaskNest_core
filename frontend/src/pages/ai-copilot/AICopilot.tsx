import { useState } from 'react'
import { Sparkles, BrainCircuit, MessageSquare, Send, CheckSquare, Plus, ArrowRight, CheckCircle2, ChevronRight, Activity, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'

interface AISuggestedTask {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in-progress' | 'review' | 'done'
  tags: string[]
  estimatedHours: number
}

export default function AICopilot() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'chat' | 'diagnostic' | 'blueprint'>('chat')
  
  // State for Chat
  const [chatMessage, setChatMessage] = useState('')
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: `Hello ${user?.name}! I am your **TaskNest Gemini Copilot**. 🚀\n\nI am hooked directly into your workspace MongoDB database to analyze timelines, suggest task outlines, and identify bottlenecks.\n\nHow can I help you accelerate your project today? Try asking:\n* *"Give me a workspace overview status"* \n* *"Check active critical bottlenecks"*`, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ])
  const [chatLoading, setChatLoading] = useState(false)

  // State for Project Diagnostic
  const [selectedDiagnosticProjectId, setSelectedDiagnosticProjectId] = useState('')
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null)
  const [diagnosticLoading, setDiagnosticLoading] = useState(false)

  // State for Task Blueprint
  const [selectedBlueprintProjectId, setSelectedBlueprintProjectId] = useState('')
  const [blueprintPrompt, setBlueprintPrompt] = useState('')
  const [blueprintedTasks, setBlueprintedTasks] = useState<AISuggestedTask[]>([])
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [addedTasksIndices, setAddedTasksIndices] = useState<number[]>([])

  // Fetch projects list
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.getProjects()
      return data.data
    }
  })

  // Mutation to create single tasks
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    }
  })

  // Handle AI Chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || chatLoading) return

    const userText = chatMessage
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Append user message
    setChatLog(prev => [...prev, { sender: 'user', text: userText, time: timeNow }])
    setChatMessage('')
    setChatLoading(true)

    try {
      const { data } = await api.chatCopilot({ message: userText })
      if (data.success) {
        setChatLog(prev => [...prev, { 
          sender: 'ai', 
          text: data.data.reply, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }])
      }
    } catch (err: any) {
      setChatLog(prev => [...prev, { 
        sender: 'ai', 
        text: '❌ **System Error:** Failed to establish backend LLM connection. Please verify server integrity.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  // Handle Diagnostic Report Generation
  const handleGenerateReport = async () => {
    if (!selectedDiagnosticProjectId) {
      toast({ title: 'Error', description: 'Please select a project to analyze', variant: 'destructive' })
      return
    }

    setDiagnosticLoading(true)
    setDiagnosticReport(null)

    try {
      const { data } = await api.summarizeProject(selectedDiagnosticProjectId)
      if (data.success) {
        setDiagnosticReport(data.data.summary)
        toast({ title: 'Advisory Summary Ready', description: 'Workspace health diagnosis is complete.' })
      }
    } catch (err: any) {
      toast({ title: 'Analysis Failed', description: 'Could not summarize project.', variant: 'destructive' })
    } finally {
      setDiagnosticLoading(false)
    }
  }

  // Handle Task Blueprint Generator
  const handleGenerateBlueprint = async () => {
    if (!blueprintPrompt.trim()) {
      toast({ title: 'Error', description: 'Please define what you want to build.', variant: 'destructive' })
      return
    }

    setBlueprintLoading(true)
    setBlueprintedTasks([])
    setAddedTasksIndices([])

    try {
      const { data } = await api.generateTasks({
        prompt: blueprintPrompt,
        projectId: selectedBlueprintProjectId || undefined
      })
      if (data.success) {
        setBlueprintedTasks(data.data.tasks)
        toast({ title: 'Blueprint Synced', description: 'Generated custom tasks successfully.' })
      }
    } catch (err: any) {
      toast({ title: 'Blueprint Failed', description: 'Could not generate blueprint tasks.', variant: 'destructive' })
    } finally {
      setBlueprintLoading(false)
    }
  }

  // Handle Importing single generated task into DB
  const handleImportTask = async (task: AISuggestedTask, index: number) => {
    if (!selectedBlueprintProjectId) {
      toast({ title: 'Project Required', description: 'Please select a target Project before importing tasks.', variant: 'destructive' })
      return
    }

    try {
      await createTaskMutation.mutateAsync({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        project: selectedBlueprintProjectId,
        estimatedHours: task.estimatedHours,
        tags: task.tags
      })
      setAddedTasksIndices(prev => [...prev, index])
      toast({ title: 'Task Imported', description: `"${task.title}" added to board.` })
    } catch (err: any) {
      toast({ title: 'Import Failed', description: 'Could not write task to MongoDB.', variant: 'destructive' })
    }
  }

  // Handle Importing all suggested tasks at once
  const handleImportAllTasks = async () => {
    if (!selectedBlueprintProjectId) {
      toast({ title: 'Project Required', description: 'Please select a target Project before importing tasks.', variant: 'destructive' })
      return
    }

    const unaddedTasks = blueprintedTasks.filter((_, idx) => !addedTasksIndices.includes(idx))
    if (unaddedTasks.length === 0) return

    let importedCount = 0
    for (let i = 0; i < blueprintedTasks.length; i++) {
      if (addedTasksIndices.includes(i)) continue
      const task = blueprintedTasks[i]
      try {
        await createTaskMutation.mutateAsync({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          project: selectedBlueprintProjectId,
          estimatedHours: task.estimatedHours,
          tags: task.tags
        })
        setAddedTasksIndices(prev => [...prev, i])
        importedCount++
      } catch (err) {
        console.error(err)
      }
    }

    toast({ title: 'All Tasks Imported', description: `Successfully added ${importedCount} task(s) to project.` })
  }

  const formatMarkdown = (text: string) => {
    // Basic Markdown formatting helper for a gorgeous diagnostic view
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('###')) {
        return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-secondary-900 dark:text-white border-b pb-1 border-gray-100 dark:border-secondary-700">{line.replace('###', '')}</h3>
      }
      if (line.startsWith('####')) {
        return <h4 key={idx} className="text-md font-semibold mt-4 mb-2 text-primary flex items-center gap-2"><Activity className="w-4 h-4" />{line.replace('####', '')}</h4>
      }
      if (line.startsWith('**')) {
        return <p key={idx} className="text-md font-semibold text-secondary-800 dark:text-gray-100 my-2">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('* ⚠️')) {
        return <div key={idx} className="flex gap-2 p-3 my-2 bg-danger-light/10 text-danger-dark border border-danger-light/20 rounded-xl"><AlertCircle className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">{line.replace('* ⚠️', '')}</span></div>
      }
      if (line.startsWith('* ✅')) {
        return <div key={idx} className="flex gap-2 p-3 my-2 bg-success-light/10 text-success-dark border border-success-light/20 rounded-xl"><CheckCircle2 className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">{line.replace('* ✅', '')}</span></div>
      }
      if (line.startsWith('*')) {
        return <li key={idx} className="ml-4 list-disc text-sm text-gray-600 dark:text-gray-300 py-1">{line.replace('*', '')}</li>
      }
      if (/^\d+\./.test(line)) {
        return <div key={idx} className="flex gap-3 pl-2 py-1.5 items-start text-sm text-gray-700 dark:text-gray-200"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{line.replace(/^\d+\./, '')}</span></div>
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="my-6 border-gray-200 dark:border-secondary-700" />
      }
      return <p key={idx} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed my-1">{line}</p>
    })
  }

  const priorityBadgeColor = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-red-500/10 text-red-600 border border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      default: return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex-center text-white shadow-primary animate-float">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">AI Copilot</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Smart LLM-powered project analysis and task generator</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-100 dark:bg-secondary-800/80 rounded-2xl max-w-2xl border border-gray-200/50 dark:border-secondary-700/50">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'chat' ? 'bg-white dark:bg-secondary-700 text-primary shadow-medium' : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Work Chat
        </button>
        <button 
          onClick={() => setActiveTab('diagnostic')}
          className={`flex-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'diagnostic' ? 'bg-white dark:bg-secondary-700 text-primary shadow-medium' : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'}`}
        >
          <BrainCircuit className="w-4 h-4" />
          Project Diagnostic
        </button>
        <button 
          onClick={() => setActiveTab('blueprint')}
          className={`flex-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'blueprint' ? 'bg-white dark:bg-secondary-700 text-primary shadow-medium' : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'}`}
        >
          <CheckSquare className="w-4 h-4" />
          Task Blueprint
        </button>
      </div>

      {/* ACTIVE TABS SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 card p-8 min-h-[600px] flex flex-col justify-between">
          {activeTab === 'chat' && (
            <>
              {/* Chat Log */}
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {chatLog.map((log, idx) => (
                  <div key={idx} className={`flex gap-4 ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {log.sender === 'ai' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex-center text-white shrink-0 shadow-soft">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed border ${
                      log.sender === 'user' 
                        ? 'bg-primary text-white border-transparent shadow-primary rounded-tr-none' 
                        : 'bg-gray-50 dark:bg-secondary-800 text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-secondary-700/50 rounded-tl-none'
                    }`}>
                      <div className="prose dark:prose-invert">
                        {formatMarkdown(log.text)}
                      </div>
                      <span className={`block text-[10px] text-right mt-2 ${log.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        {log.time}
                      </span>
                    </div>
                    {log.sender === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 flex-center shrink-0 font-bold text-sm shadow-soft overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-primary flex-center text-white shrink-0 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-50 dark:bg-secondary-800 border border-gray-200/50 dark:border-secondary-700/50 rounded-2xl rounded-tl-none p-4 w-28 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="mt-8 flex gap-3">
                <input 
                  type="text"
                  placeholder="Ask Gemini Workspace Copilot anything (e.g. 'Overview stats', 'Bottlenecks')..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="input-base py-3"
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim() || chatLoading}
                  className="p-4 bg-primary text-white rounded-xl hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all shadow-primary disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="p-5 bg-gradient-to-r from-primary/10 to-indigo-500/5 dark:from-primary/20 dark:to-indigo-500/10 border border-primary/10 rounded-2xl">
                <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  Workspace Executive Advisory Diagnostic
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Select a project, and the AI will build a thorough health advisory diagnosing bottleneck items and scope recommendations.</p>
              </div>

              {/* Selection & Trigger */}
              <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
                <div className="w-full">
                  <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">Select Project</label>
                  <select 
                    value={selectedDiagnosticProjectId}
                    onChange={(e) => setSelectedDiagnosticProjectId(e.target.value)}
                    className="input-base py-3"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedDiagnosticProjectId || diagnosticLoading}
                  className="w-full sm:w-auto shrink-0 sm:mt-5 py-3.5 px-6 btn-primary shadow-primary flex items-center justify-center gap-2"
                >
                  {diagnosticLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Diagnosing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>

              {/* Advisory Output */}
              <div className="flex-1 mt-6 border border-dashed border-gray-200 dark:border-secondary-700 rounded-2xl p-6 bg-gray-50/50 dark:bg-secondary-800/20 overflow-y-auto max-h-[450px]">
                {diagnosticReport ? (
                  <div className="animate-fade-in text-gray-700 dark:text-gray-200">
                    {formatMarkdown(diagnosticReport)}
                  </div>
                ) : (
                  <div className="h-full flex-center flex-col py-24 text-gray-400 text-center gap-3">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-secondary-600 animate-pulse" />
                    <div>
                      <p className="font-bold">Awaiting Advisory Diagnosis</p>
                      <p className="text-xs max-w-sm mt-1">Select a workspace above and generate an executive report to see deep-dives here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="p-5 bg-gradient-to-r from-primary/10 to-indigo-500/5 dark:from-primary/20 dark:to-indigo-500/10 border border-primary/10 rounded-2xl">
                <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 mb-1">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  Sprint Feature Blueprint Planner
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Describe a feature, select your project, and the AI will brainstorm the perfect technical task list. You can import them directly into MDB with one click!</p>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">Target Project</label>
                  <select 
                    value={selectedBlueprintProjectId}
                    onChange={(e) => setSelectedBlueprintProjectId(e.target.value)}
                    className="input-base"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 block mb-1.5">What are we building?</label>
                  <input 
                    type="text"
                    placeholder="e.g. JWT Auth flow, Stripe checkout, dark mode system"
                    value={blueprintPrompt}
                    onChange={(e) => setBlueprintPrompt(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateBlueprint}
                disabled={!blueprintPrompt.trim() || blueprintLoading}
                className="w-full py-3.5 btn-primary shadow-primary flex items-center justify-center gap-2 mt-2"
              >
                {blueprintLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Formulating blueprint tasks...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" />
                    Brainstorm Blueprint Checklist
                  </>
                )}
              </button>

              {/* Tasks blueprint output */}
              <div className="flex-1 mt-6 border border-dashed border-gray-200 dark:border-secondary-700 rounded-2xl p-6 bg-gray-50/50 dark:bg-secondary-800/20 overflow-y-auto max-h-[400px]">
                {blueprintedTasks.length > 0 ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex-between pb-3 border-b border-gray-200 dark:border-secondary-700 mb-2">
                      <h4 className="font-bold text-sm text-gray-500">SUGGESTED CHECKLIST OUTLINE ({blueprintedTasks.length} Tasks)</h4>
                      <button 
                        onClick={handleImportAllTasks}
                        className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                        disabled={!selectedBlueprintProjectId}
                      >
                        <Plus className="w-4 h-4" />
                        Import All to Workspace
                      </button>
                    </div>

                    {blueprintedTasks.map((task, index) => {
                      const isAdded = addedTasksIndices.includes(index)
                      return (
                        <div key={index} className="p-4 bg-white dark:bg-secondary-800 border border-gray-200/60 dark:border-secondary-700/60 rounded-2xl flex items-start gap-4 hover:shadow-soft transition-all group">
                          <div className={`w-8 h-8 rounded-lg ${isAdded ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary'} flex-center shrink-0`}>
                            {isAdded ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 items-center mb-1.5">
                              <h5 className="font-bold text-sm text-secondary-900 dark:text-white truncate">{task.title}</h5>
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${priorityBadgeColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">({task.estimatedHours} hrs)</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{task.description}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {task.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-bold bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleImportTask(task, index)}
                            disabled={isAdded || !selectedBlueprintProjectId}
                            className={`shrink-0 p-2 rounded-xl border flex items-center justify-center transition-all ${
                              isAdded 
                                ? 'bg-success/10 text-success border-success/20 cursor-default' 
                                : 'hover:bg-primary/10 text-gray-400 hover:text-primary border-gray-200 dark:border-secondary-700 hover:scale-105 active:scale-95 disabled:opacity-50'
                            }`}
                          >
                            {isAdded ? 'Imported' : <Plus className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-full flex-center flex-col py-24 text-gray-400 text-center gap-3">
                    <CheckSquare className="w-12 h-12 text-gray-300 dark:text-secondary-600 animate-pulse" />
                    <div>
                      <p className="font-bold">Awaiting Technical Blueprint</p>
                      <p className="text-xs max-w-sm mt-1">Specify your feature criteria, select a target project, and click Brainstorm above.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Sidebar Stats Info Panels */}
        <div className="space-y-6">
          
          {/* Smart Prompt Sandbox */}
          <div className="card p-6 bg-gradient-to-br from-primary-900 to-indigo-950 text-white border-transparent">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              Quick Prompts Sandbox
            </h3>
            <p className="text-xs text-white/70 leading-normal mb-5">Click any suggested query below to fill the prompt queue and auto-engage the AI Copilot.</p>
            
            <div className="space-y-2.5">
              {[
                { label: 'Analyze active bottleneck alerts', tab: 'chat', text: 'Check active critical bottlenecks' },
                { label: 'Synthesize JWT login blueprint', tab: 'blueprint', text: 'Design secure user JWT Auth logic' },
                { label: 'Formulate UI dark-mode outline', tab: 'blueprint', text: 'Setup premium dark and light theme styles' },
                { label: 'Fetch a global database status', tab: 'chat', text: 'Give me a workspace overview status' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(p.tab as any)
                    if (p.tab === 'chat') {
                      setChatMessage(p.text)
                    } else {
                      setBlueprintPrompt(p.text)
                    }
                    toast({ title: 'Prompt Filled', description: `Switched to ${p.tab} tab.` })
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <span>{p.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Model Diagnostic Stats */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest">Workspace Model Status</h3>
            <div className="space-y-3.5">
              <div className="flex-between items-center pb-2 border-b border-gray-100 dark:border-secondary-700/50">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Underlying Model:</span>
                <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md">Gemini Pro 1.5</span>
              </div>
              <div className="flex-between items-center pb-2 border-b border-gray-100 dark:border-secondary-700/50">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Database Integration:</span>
                <span className="text-xs font-bold text-success bg-success/15 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" />
                  MongoDB (Live)
                </span>
              </div>
              <div className="flex-between items-center pb-2 border-b border-gray-100 dark:border-secondary-700/50">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Socket.IO State:</span>
                <span className="text-xs font-bold text-success bg-success/15 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" />
                  Synced
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
