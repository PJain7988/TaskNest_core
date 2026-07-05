import React, { useState } from 'react'
import {
  Brain,
  Cpu,
  Share2,
  Scale,
  Activity,
  Sprout,
  Package,
  Home,
  Truck,
  Heart,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Loader2,
  Check,
  Info,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface ProjectItem {
  id: string
  name: string
  focus: string
  icon: any
  color: string
  description: string
  inputs: {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'select' | 'slider' | 'multiselect'
    placeholder?: string
    defaultValue?: any
    min?: number
    max?: number
    options?: { label: string; value: any }[]
  }[]
}

const projectsList: ProjectItem[] = [
  {
    id: 'social_media',
    name: 'Social Media Analyzer',
    focus: 'Ethical Profiling & Risk',
    icon: Share2,
    color: 'from-blue-500 to-indigo-600',
    description: 'Ethically parses public social feeds (X, Reddit, LinkedIn) to run BERT-based reputation scoring and sentiment risk analysis.',
    inputs: [
      { name: 'handle', label: 'Social Media Handle', type: 'text', placeholder: 'e.g. @elonmusk or @john_developer', defaultValue: '@tech_pioneer' },
      {
        name: 'platforms',
        label: 'Source Platforms',
        type: 'multiselect',
        defaultValue: ['Twitter/X', 'Reddit'],
        options: [
          { label: 'Twitter/X', value: 'Twitter/X' },
          { label: 'Reddit', value: 'Reddit' },
          { label: 'LinkedIn', value: 'LinkedIn' }
        ]
      }
    ]
  },
  {
    id: 'court_order',
    name: 'Court Order Extraction',
    focus: 'Legal NLP Summarizer',
    icon: Scale,
    color: 'from-amber-600 to-red-700',
    description: 'Utilizes advanced NLP text summarization and token-matching to isolate lawsuit entities, case numbers, disputes, and judicial decisions.',
    inputs: [
      {
        name: 'documentText',
        label: 'Court Order Document Text',
        type: 'textarea',
        placeholder: 'Paste raw court order text here...',
        defaultValue: 'In the District Court of California, State of California vs. ACME Development Corp. Case No: CV-2026-88. The court, having reviewed the petition by Plaintiff, finds that Defendant did willfully violate Section 4 of the commercial tenancy agreement by failing to restore facilities post-occupancy. It is hereby ordered that Defendant shall pay compensatory damages of $150,000 to the Plaintiff by July 2026. IT IS SO ORDERED. Judge Elizabeth Vance.'
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare Analytics',
    focus: 'Condition Risk Predictor',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    description: 'Enters patient parameters to calculate risk probabilities for acute diagnoses with explainable clinical breakdowns.',
    inputs: [
      { name: 'age', label: 'Patient Age', type: 'number', defaultValue: 45 },
      {
        name: 'gender',
        label: 'Patient Gender',
        type: 'select',
        defaultValue: 'Female',
        options: [
          { label: 'Female', value: 'Female' },
          { label: 'Male', value: 'Male' },
          { label: 'Other', value: 'Other' }
        ]
      },
      { name: 'symptoms', label: 'Presenting Symptoms', type: 'textarea', placeholder: 'e.g. sharp chest tightness radiating to shoulder, slight breathlessness', defaultValue: 'Substernal chest tightness after mild exertion, radiating to the left shoulder blade, relieved with rest. Accompanied by mild diaphoresis.' },
      { name: 'history', label: 'Clinical History', type: 'text', placeholder: 'e.g. none, diabetes, hypertension', defaultValue: 'Hypertension controlled with lisinopril, hypercholesterolemia.' }
    ]
  },
  {
    id: 'farming',
    name: 'Sustainable Farming AI',
    focus: 'Agro-Soil Optimization',
    icon: Sprout,
    color: 'from-green-600 to-emerald-700',
    description: 'Ingests N-P-K mineral content and local climatic forecasts to recommend crop matching, smart watering schedules, and nitrogen optimization.',
    inputs: [
      { name: 'pH', label: 'Soil pH level', type: 'slider', min: 4.0, max: 9.0, defaultValue: 5.5 },
      { name: 'n', label: 'Nitrogen (N) Content (mg/kg)', type: 'number', defaultValue: 65 },
      { name: 'p', label: 'Phosphorus (P) Content (mg/kg)', type: 'number', defaultValue: 35 },
      { name: 'k', label: 'Potassium (K) Content (mg/kg)', type: 'number', defaultValue: 40 },
      {
        name: 'weather',
        label: 'Weather Forecast',
        type: 'select',
        defaultValue: 'Dry & Hot',
        options: [
          { label: 'Dry & Hot', value: 'Dry & Hot' },
          { label: 'Sunny & Mild', value: 'Sunny & Mild' },
          { label: 'Rainy & Humid', value: 'Rainy & Humid' },
          { label: 'Cool & Overcast', value: 'Cool & Overcast' }
        ]
      },
      { name: 'region', label: 'Geographical Region', type: 'text', defaultValue: 'Central Valley' }
    ]
  },
  {
    id: 'retail',
    name: 'Retail Inventory Agent',
    focus: 'Multi-Agent Forecast',
    icon: Package,
    color: 'from-fuchsia-500 to-pink-600',
    description: 'Simulates a collaborative AI Agent conference (Demand Agent, Restock Agent, Finance Agent) to forecast product volumes and auto-schedule restocking orders.',
    inputs: [
      {
        name: 'productCategory',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'Electronics',
        options: [
          { label: 'Electronics (Microchips)', value: 'Electronics' },
          { label: 'Apparel (Winter Coats)', value: 'Apparel' },
          { label: 'Home Appliances', value: 'Home Appliances' },
          { label: 'Perishable Groceries', value: 'Groceries' }
        ]
      },
      { name: 'currentStock', label: 'Current Inventory Stock', type: 'number', defaultValue: 120 },
      { name: 'monthlySales', label: 'Average Monthly Sales Velocity', type: 'number', defaultValue: 80 }
    ]
  },
  {
    id: 'interior',
    name: 'AR/VR Interior Planner',
    focus: '3D Room Design Prompt',
    icon: Home,
    color: 'from-violet-600 to-indigo-700',
    description: 'Formulates complex 3D interior blueprints, smart zoning flows, hex color palettes, and AI image prompts based on dimensions and styles.',
    inputs: [
      {
        name: 'roomType',
        label: 'Room Space Type',
        type: 'select',
        defaultValue: 'Living Room',
        options: [
          { label: 'Living Room', value: 'Living Room' },
          { label: 'Master Bedroom', value: 'Master Bedroom' },
          { label: 'Creative Home Office', value: 'Home Office' },
          { label: 'Modern Kitchen Studio', value: 'Kitchen' }
        ]
      },
      { name: 'size', label: 'Floor Space Area (sq ft)', type: 'number', defaultValue: 320 },
      {
        name: 'theme',
        label: 'Styling Aesthetic Theme',
        type: 'select',
        defaultValue: 'Bohemian Eclectic',
        options: [
          { label: 'Modern Minimalist', value: 'Modern Minimalist' },
          { label: 'Bohemian Eclectic', value: 'Bohemian Eclectic' },
          { label: 'Industrial Chic Loft', value: 'Industrial Chic' },
          { label: 'Warm Scandinavian', value: 'Warm Scandinavian' }
        ]
      }
    ]
  },
  {
    id: 'supply_chain',
    name: 'Decentralized Supply Chain',
    focus: 'Blockchain Logistics Tracking',
    icon: Truck,
    color: 'from-cyan-500 to-blue-600',
    description: 'Generates secure cryptographic transaction hashes, smart contracts, and real-time chain-of-custody milestones for logistics tracking.',
    inputs: [
      { name: 'productId', label: 'Global Cargo ID', type: 'text', defaultValue: 'SHIELD-VAX-77' },
      { name: 'origin', label: 'Point of Origin Dispatch', type: 'text', defaultValue: 'Zurich Pharmaceutical Complex' },
      { name: 'destination', label: 'Final Destination Depot', type: 'text', defaultValue: 'Tokyo Central Logistics hub' },
      { name: 'nodes', label: 'Mid-route Transit Hubs (comma split)', type: 'text', defaultValue: 'Rotterdam Terminal, Singapore Oceanic Gate' }
    ]
  },
  {
    id: 'maternal',
    name: 'Maternal Health Monitor',
    focus: 'Wearable Clinical Analytics',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    description: 'Monitors gestational metrics and active maternal vitals to flag pre-eclampsia and gestational risk alerts in real-time.',
    inputs: [
      { name: 'gestationalAge', label: 'Gestational Age (weeks)', type: 'number', defaultValue: 28 },
      { name: 'systolicBP', label: 'Systolic Blood Pressure (mmHg)', type: 'number', defaultValue: 145 },
      { name: 'diastolicBP', label: 'Diastolic Blood Pressure (mmHg)', type: 'number', defaultValue: 95 },
      { name: 'heartRate', label: 'Wearable Heart Rate (bpm)', type: 'number', defaultValue: 96 },
      { name: 'oxygen', label: 'Blood Oxygen (SPO2 %)', type: 'slider', min: 80, max: 100, defaultValue: 94 }
    ]
  },
  {
    id: 'pothole',
    name: 'Pothole & Hazard System',
    focus: 'Smart Civic Integration',
    icon: AlertTriangle,
    color: 'from-yellow-600 to-amber-700',
    description: 'Simulates civil road hazard audits and automatically creates fully tracked repair Tasks in the TaskNest Project Management system!',
    inputs: [
      {
        name: 'damageType',
        label: 'Hazard Infrastructure Type',
        type: 'select',
        defaultValue: 'Deep Pavement Pothole',
        options: [
          { label: 'Deep Pavement Pothole', value: 'Deep Pavement Pothole' },
          { label: 'Major Structural Asphalt Crack', value: 'Major Structural Asphalt Crack' },
          { label: 'Sunken Curb Water Dam', value: 'Sunken Curb Water Dam' },
          { label: 'Roadways Debris & Blockage', value: 'Roadways Debris & Blockage' }
        ]
      },
      { name: 'latitude', label: 'GPS Latitude Coordinate', type: 'number', defaultValue: 34.0522 },
      { name: 'longitude', label: 'GPS Longitude Coordinate', type: 'number', defaultValue: -118.2437 },
      { name: 'reporter', label: 'Reporting Field Inspector', type: 'text', defaultValue: 'Inspector Marcus Reed' }
    ]
  },
  {
    id: 'sign_language',
    name: 'Sign Language Translator',
    focus: 'ASL CNN-Gesture Parsing',
    icon: MessageSquare,
    color: 'from-teal-500 to-emerald-600',
    description: 'Translates spatial gestures and hand motion descriptors into written English with context-aware syntax correction.',
    inputs: [
      {
        name: 'gestureType',
        label: 'Tracked Gesture Motion',
        type: 'select',
        defaultValue: 'Open palm touch chin and sweep outward (Thank You)',
        options: [
          { label: 'Open palm touch chin and sweep outward (Thank You)', value: 'Open palm touch chin and sweep outward (Thank You)' },
          { label: 'Wave hand from side-to-side (Greeting/Hello)', value: 'Wave hand from side-to-side (Greeting/Hello)' },
          { label: 'Clenched fist on chest moving in circles (Sorry)', value: 'Clenched fist on chest moving in circles (Sorry)' },
          { label: 'Index and middle fingers crossed moving down (Rules/Protocol)', value: 'Index and middle fingers crossed moving down (Rules/Protocol)' }
        ]
      },
      {
        name: 'speed',
        label: 'Motion Capture Frame Rate',
        type: 'select',
        defaultValue: '60 FPS Ultra-Capture',
        options: [
          { label: '60 FPS Ultra-Capture', value: '60 FPS Ultra-Capture' },
          { label: '30 FPS Standard Speed', value: '30 FPS Standard Speed' },
          { label: 'Slow Motion Neural Sync', value: 'Slow Motion Neural Sync' }
        ]
      }
    ]
  }
]

export default function AISuite() {
  const [activeProject, setActiveProject] = useState<ProjectItem>(projectsList[0])
  const [formParams, setFormParams] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    projectsList[0].inputs.forEach((inp) => {
      initial[inp.name] = inp.defaultValue
    })
    return initial
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleProjectSelect = (proj: ProjectItem) => {
    setActiveProject(proj)
    setResult(null)
    const initial: Record<string, any> = {}
    proj.inputs.forEach((inp) => {
      initial[inp.name] = inp.defaultValue
    })
    setFormParams(initial)
  }

  const handleInputChange = (name: string, value: any) => {
    setFormParams((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMultiSelectToggle = (name: string, optionValue: any) => {
    const current = formParams[name] || []
    let updated
    if (current.includes(optionValue)) {
      updated = current.filter((v: any) => v !== optionValue)
    } else {
      updated = [...current, optionValue]
    }
    handleInputChange(name, updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await api.executeAISuite({
        projectKey: activeProject.id,
        params: formParams
      })

      if (res.data?.success) {
        setResult(res.data.data)
        toast({
          title: 'AI Analysis Complete',
          description: `Successfully analyzed parameters for ${activeProject.name}.`,
          duration: 3000
        })

        // Civic integrations alerts
        if (activeProject.id === 'pothole' && res.data.data?.taskScheduled) {
          toast({
            title: 'MERN Integration Active',
            description: `Auto-scheduled civic task: "${res.data.data.taskScheduled.taskTitle}" in the MERN project: "Civic Infrastructure Maintenance".`,
            duration: 6000
          })
        }
        if (activeProject.id === 'retail' && res.data.data?.taskScheduled) {
          toast({
            title: 'MERN Restock Alert',
            description: `Inventory shortage flagged! Created task: "${res.data.data.taskScheduled.taskTitle}" inside "Retail Supply Optimization" project.`,
            duration: 6000
          })
        }
      } else {
        throw new Error(res.data?.message || 'Failed to process AI request')
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Execution Failed',
        description: err.response?.data?.message || err.message || 'AI request timed out.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Sub-renderer for specific project outputs
  const renderResultDetails = () => {
    if (!result) return null

    switch (activeProject.id) {
      case 'social_media':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-white/50 block mb-1">Reputation Score</span>
                <span className="text-3xl font-extrabold text-indigo-400">{result.reputationScore}/100</span>
                <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${result.reputationScore}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-white/50 block mb-1">Risk Classification</span>
                <span className={`text-xl font-bold block mt-1 py-1 px-3 rounded-full inline-block ${
                  result.riskCategory === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                  result.riskCategory === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {result.riskCategory} Risk
                </span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-white/50 block mb-2 text-center">Engagement Sentiment</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Positive:</span>
                    <span className="font-semibold">{result.sentiment?.positive}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neutral:</span>
                    <span className="font-semibold">{result.sentiment?.neutral}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Negative:</span>
                    <span className="font-semibold">{result.sentiment?.negative}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ethical Flags & Behavioral Checks
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {result.ethicalConcerns?.map((concern: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.summary}
            </div>
          </div>
        )

      case 'court_order':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Case Registry Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Case Index:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{result.caseNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Plaintiff Party:</span>
                    <span className="text-white font-medium">{result.parties?.plaintiff}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Defendant Party:</span>
                    <span className="text-white font-medium">{result.parties?.defendant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Presiding Judge:</span>
                    <span className="text-white font-medium">{result.parties?.judge}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase mb-2">Legal Dispute Scope</h4>
                  <p className="text-sm text-slate-300 italic">"{result.legalDispute}"</p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Filing Stamp:</span>
                  <span className="font-semibold text-slate-300">{result.filingDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-955/20 border border-amber-500/20 p-5 rounded-xl text-slate-300">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4" /> Judicial Verdict & Order
              </h4>
              <p className="text-sm leading-relaxed font-serif italic text-white/90">"{result.finalDecision}"</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.summary}
            </div>
          </div>
        )

      case 'healthcare':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-xs text-white/50 block">Condition Urgency</span>
                <span className="text-lg font-bold text-white">Diagnostic Risk Classification</span>
              </div>
              <span className={`py-1.5 px-4 rounded-full font-bold text-sm ${
                result.riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                result.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.riskLevel} Risk Condition
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Possible Diagnoses & Weights
                </h4>
                <div className="space-y-3.5">
                  {result.possibleDiagnoses?.map((diag: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-medium">{diag.disease}</span>
                        <span className="font-semibold text-indigo-400">{diag.probability}% Match</span>
                      </div>
                      <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full" style={{ width: `${diag.probability}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Clinical Action Directives
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.recommendedSteps?.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/30 p-2 rounded border border-white/5">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.explanation}
            </div>
          </div>
        )

      case 'farming':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-400" /> Recommended Crops
                </h4>
                <div className="space-y-3">
                  {result.cropRecommendations?.map((crop: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900/30 rounded-lg border border-white/5 flex justify-between items-center gap-3">
                      <div>
                        <span className="font-semibold text-slate-200 block">{crop.crop}</span>
                        <span className="text-xs text-slate-400">{crop.reason}</span>
                      </div>
                      <span className="shrink-0 text-sm font-bold bg-green-500/20 text-green-400 py-1 px-2.5 rounded-full border border-green-500/30">
                        {crop.feasibilityPercentage}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Watering Cycle Advisory</span>
                  <p className="text-sm text-slate-200 font-semibold">{result.wateringSchedule}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Estimated Yield Performance</span>
                  <span className="text-2xl font-extrabold text-green-400 block">{result.yieldEstimation}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-white/90 mb-2">Soil Nutrient Supplement Plan</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{result.fertilizerPlan}</p>
            </div>
          </div>
        )

      case 'retail':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-white/50 block mb-1">Next-Month Sales Projection</span>
                <span className="text-3xl font-extrabold text-fuchsia-400">{result.projectedSales} units</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-white/50 block mb-1">Calculated Restock Requirement</span>
                <span className="text-3xl font-extrabold text-pink-400">{result.restockQuantity} units</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col justify-center text-center">
                <span className="text-xs text-white/50 block mb-1">Consensus Decision</span>
                <span className="text-xs font-semibold text-slate-200 truncate">{result.finalDecision}</span>
              </div>
            </div>

            <div className="bg-slate-850 p-5 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2 border-b border-white/5 pb-2">
                <Brain className="w-4 h-4 text-fuchsia-400" /> Multi-Agent Cooperative Consensus Logs
              </h4>
              <div className="space-y-3">
                {result.agentDiscussions?.map((msg: any, idx: number) => (
                  <div key={idx} className="flex gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">
                      {msg.avatar}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-fuchsia-400 block">{msg.agent}</span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.taskScheduled && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-semibold text-emerald-400 block">TaskNest MERN Integration Active</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Shortage buffer detected. Auto-created Task: <span className="font-semibold text-slate-200">"{result.taskScheduled.taskTitle}"</span> inside the Project <span className="font-semibold text-slate-200">"{result.taskScheduled.projectTitle}"</span> in the central workspace.
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 'interior':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {result.layoutPlan}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-3.5">
                  <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Extracted Theme Color Palette</h4>
                  <div className="flex gap-3 flex-wrap">
                    {result.colorPalette?.map((color: string, idx: number) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg border border-white/10 shadow-md" style={{ backgroundColor: color }}></div>
                        <span className="text-[10px] font-mono mt-1 text-white/60">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-2">
                  <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Zoned Lighting Guide</h4>
                  <p className="text-sm text-slate-300">{result.lightingRecommendations}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-3">
              <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Curated Furniture Selection
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {result.furnitureItems?.map((item: string, idx: number) => (
                  <div key={idx} className="bg-slate-900/40 p-2.5 rounded border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">AI Photorealistic Prompt (AR/VR Rendering Eng)</span>
              <p className="text-xs text-slate-300 font-mono italic bg-slate-950 p-3 rounded border border-white/5 break-all select-all">
                {result.aiImagePrompt}
              </p>
            </div>
          </div>
        )

      case 'supply_chain':
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs text-white/50 block">Cryptographic Tracking Contract</span>
              <span className="text-sm font-mono text-indigo-400 font-bold block break-all">{result.smartContractAddress}</span>
            </div>

            <div className="bg-slate-850 p-5 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" /> Smart Contract Chain-of-Custody Timeline
              </h4>
              <div className="relative border-l-2 border-slate-700 ml-3.5 space-y-5 py-2">
                {result.chainOfCustody?.map((node: any, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-500 border border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">{node.node}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">{node.timestamp}</span>
                      <p className="text-xs text-slate-300 mt-1">{node.state}</p>
                      <span className="text-[9px] font-mono text-cyan-500 block mt-1 break-all select-all">{node.transactionHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.risks && result.risks.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Logistic Risks & Anomalies Detected
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {result.risks?.map((risk: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center text-xs text-slate-400 font-mono">
              🛡️ SHA-256 Authenticity Stamp: <span className="text-white select-all">{result.authenticityCertificate}</span>
            </div>
          </div>
        )

      case 'maternal':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-xs text-white/50 block">Maternal Health Risk Severity</span>
                <span className="text-lg font-bold text-white">Active Condition Evaluation</span>
              </div>
              <span className={`py-1.5 px-4 rounded-full font-bold text-sm ${
                result.riskCategory === 'High Risk' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                result.riskCategory === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.riskCategory}
              </span>
            </div>

            {result.criticalAlert && (
              <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-sm font-semibold text-red-400 block">Critical Obstetric Warning Triggered</span>
                  <p className="text-xs text-slate-300 mt-1">
                    System readings indicate elevated cardiovascular pressure profiles. Mandate clinical contact for patient evaluation.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-400" /> Active Complication Flags
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.complications?.map((comp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/30 p-2.5 rounded border border-white/5">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.advisoryReport}
            </div>
          </div>
        )

      case 'pothole':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Civic Hazard Diagnostics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-1.5 text-sm">
                    <span className="text-slate-400">Severity Rating:</span>
                    <span className={`font-bold ${
                      result.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>{result.severity}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5 text-sm">
                    <span className="text-slate-400">Estimated Budget:</span>
                    <span className="font-semibold text-white">${result.estimatedCost} USD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Repair Pipeline:</span>
                    <span className="text-indigo-400 font-semibold">{result.repairSchedule}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Materials & Logistics required</h4>
                <div className="flex flex-wrap gap-2">
                  {result.requiredMaterials?.map((mat: string, idx: number) => (
                    <span key={idx} className="bg-slate-800 py-1 px-2.5 rounded text-xs border border-white/5 text-slate-300">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {result.taskScheduled && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-xl flex items-start gap-3.5">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-semibold text-emerald-400 block">TaskNest Automated Integration Triggered</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    This civic hazard report has been automatically pushed to the MERN task queue! A work order titled <span className="font-semibold text-slate-200">"{result.taskScheduled.taskTitle}"</span> has been created inside the Project <span className="font-semibold text-slate-200">"{result.taskScheduled.projectTitle}"</span>.
                  </p>
                  <div className="mt-3.5 flex gap-2">
                    <a
                      href="/tasks"
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider uppercase py-1.5 px-3 rounded border border-emerald-500/30 transition-all inline-block"
                    >
                      View in Kanban Board
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'sign_language':
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Translated Output Text</span>
              <p className="text-3xl font-extrabold text-indigo-400">"{result.translatedText}"</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/50 border-t border-white/5 pt-3 w-max mx-auto">
                <span>Confidence score: <span className="text-emerald-400 font-bold">{result.confidence}%</span></span>
                <span>•</span>
                <span>Language: <span className="text-slate-300">ASL to English</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-850 p-5 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Grammar Correction Matrix</h4>
                <p className="text-sm text-slate-300">{result.grammarCorrection}</p>
              </div>

              <div className="bg-slate-850 p-5 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider uppercase">Neural Parsing Framework</h4>
                <p className="text-xs text-slate-400 leading-relaxed italic">"{result.aiDescription}"</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 lg:p-6 text-white min-h-[calc(100vh-80px)]">
      {/* Immersive Header */}
      <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-fadeIn">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/20 to-purple-500/0 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 py-1 px-2.5 rounded-full border border-indigo-500/20">MERN Integrated</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Multi-Project Execution Suite</h1>
            <p className="text-sm text-slate-400 max-w-2xl font-light">
              A premium, cohesive dashboard merging all 10 specialized AI projects into a single MERN application. Leverage advanced AI systems with real-time analytics and direct MERN project integration hooks.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: 10 Projects selector */}
        <div className="lg:col-span-4 space-y-3.5">
          <h3 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase ml-1">Select AI Sub-Project</h3>
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {projectsList.map((proj) => {
              const Icon = proj.icon
              const isSelected = activeProject.id === proj.id
              return (
                <button
                  key={proj.id}
                  onClick={() => handleProjectSelect(proj)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-800 to-slate-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/5 translate-x-1.5'
                      : 'bg-slate-900/40 hover:bg-slate-800/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${proj.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white/90 block leading-tight">{proj.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">{proj.focus}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right column: Execution form & outputs */}
        <div className="lg:col-span-8 space-y-8 animate-fadeIn">
          {/* Active project description & form */}
          <div className="bg-slate-900/60 rounded-3xl border border-white/5 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
            <div className="border-b border-white/5 pb-5">
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase block">Input Configuration Parameters</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{activeProject.name}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">{activeProject.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.inputs.map((inp) => (
                  <div key={inp.name} className={`space-y-2 ${inp.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="text-xs font-bold text-white/80 block">{inp.label}</label>
                    {inp.type === 'text' && (
                      <input
                        type="text"
                        value={formParams[inp.name] || ''}
                        onChange={(e) => handleInputChange(inp.name, e.target.value)}
                        placeholder={inp.placeholder}
                        className="w-full bg-slate-955 border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                      />
                    )}
                    {inp.type === 'number' && (
                      <input
                        type="number"
                        value={formParams[inp.name] !== undefined ? formParams[inp.name] : ''}
                        onChange={(e) => handleInputChange(inp.name, Number(e.target.value))}
                        className="w-full bg-slate-955 border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold"
                      />
                    )}
                    {inp.type === 'textarea' && (
                      <textarea
                        rows={4}
                        value={formParams[inp.name] || ''}
                        onChange={(e) => handleInputChange(inp.name, e.target.value)}
                        placeholder={inp.placeholder}
                        className="w-full bg-slate-955 border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed resize-none"
                      />
                    )}
                    {inp.type === 'select' && (
                      <select
                        value={formParams[inp.name] || ''}
                        onChange={(e) => handleInputChange(inp.name, e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 focus:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium cursor-pointer"
                      >
                        {inp.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200 font-medium">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {inp.type === 'slider' && (
                      <div className="space-y-2 py-1">
                        <input
                          type="range"
                          min={inp.min}
                          max={inp.max}
                          step={inp.min && inp.min % 1 === 0 ? 1 : 0.1}
                          value={formParams[inp.name] !== undefined ? formParams[inp.name] : inp.defaultValue}
                          onChange={(e) => handleInputChange(inp.name, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/50 font-bold">
                          <span>Min: {inp.min}</span>
                          <span className="text-indigo-400 text-xs">Current: {formParams[inp.name] !== undefined ? formParams[inp.name] : inp.defaultValue}</span>
                          <span>Max: {inp.max}</span>
                        </div>
                      </div>
                    )}
                    {inp.type === 'multiselect' && (
                      <div className="flex gap-2 flex-wrap">
                        {inp.options?.map((opt) => {
                          const activeVals = formParams[inp.name] || []
                          const isActive = activeVals.includes(opt.value)
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleMultiSelectToggle(inp.name, opt.value)}
                              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                                isActive
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5'
                                  : 'bg-slate-955 border-white/5 hover:border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 tracking-wide uppercase text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Running AI Model Execution...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" /> Run Comprehensive AI Analysis
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Glowing loader */}
          {loading && (
            <div className="bg-slate-900/60 rounded-3xl border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-xl shadow-2xl min-h-[300px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <Brain className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white/90">Aggregating AI Context Data</h4>
                <p className="text-xs text-slate-400 font-light">Consulting neural layers and computing risk matrices...</p>
              </div>
            </div>
          )}

          {/* Results Output Block */}
          {result && (
            <div className="bg-slate-900/60 rounded-3xl border border-white/5 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block animate-pulse">Quantum Neural Results</span>
                    <h3 className="font-extrabold text-white text-lg">AI Report Diagnostic</h3>
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold text-white/40 hover:text-white transition-all uppercase tracking-wider bg-slate-850 py-1.5 px-3 rounded-lg border border-white/5 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Clear Report
                </button>
              </div>

              {renderResultDetails()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
