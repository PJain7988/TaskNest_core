import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axiosInstance from '@/services/api'
import { Lock, Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password requirements calculation
  const requirements = useMemo(() => {
    return [
      { id: 'length', label: 'Minimum 8 characters', valid: password.length >= 8 },
      { id: 'case', label: 'Uppercase & lowercase letters', valid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
      { id: 'number', label: 'At least one number', valid: /[0-9]/.test(password) },
      { id: 'special', label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(password) },
    ]
  }, [password])

  // Password strength score (0 to 4)
  const strengthScore = useMemo(() => {
    return requirements.filter(req => req.valid).length
  }, [requirements])

  // Visual label for password strength
  const strengthLabel = useMemo(() => {
    if (password.length === 0) return { text: '', color: 'bg-transparent', labelColor: 'text-muted' }
    switch (strengthScore) {
      case 0:
      case 1:
        return { text: 'Weak Security', color: 'bg-red-500', labelColor: 'text-red-500' }
      case 2:
        return { text: 'Medium Security', color: 'bg-amber-500', labelColor: 'text-amber-500' }
      case 3:
        return { text: 'Strong Security', color: 'bg-blue-500', labelColor: 'text-blue-500' }
      case 4:
        return { text: 'Maximum Security', color: 'bg-emerald-500', labelColor: 'text-emerald-500' }
      default:
        return { text: '', color: 'bg-transparent', labelColor: 'text-muted' }
    }
  }, [strengthScore, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (strengthScore < 3) {
      setError('Please choose a more secure password matching the guidelines.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password })
      if (response.data.success) {
        setSuccessMessage('Your credentials have been securely updated.')
        toast({
          title: 'Security Notice',
          description: 'Your password has been successfully reset. Redirecting to login.',
        })
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update credentials. The reset token is invalid or has expired.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 relative group overflow-hidden transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
          <ShieldCheck className="w-8 h-8 relative z-10 text-primary" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
          Establish a strong, robust password to secure your account credentials.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {successMessage ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 text-center"
          >
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex flex-col items-center gap-4 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-base">{successMessage}</p>
                <p className="text-muted leading-relaxed">Your secure redirection to the portal login is in progress...</p>
              </div>
            </div>
            
            <Link
              to="/login"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary/25"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go to Sign In</span>
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-semibold flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* New Password Input */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-input bg-background/50 pl-12 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus:bg-background/80 shadow-inner"
                  placeholder="Create new secure password"
                />
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-input bg-background/50 pl-12 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus:bg-background/80 shadow-inner"
                  placeholder="Confirm secure password"
                />
              </div>
            </div>

            {/* Password Strength Widget */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 bg-secondary-900/5 dark:bg-white/5 p-4 rounded-2xl border border-border/40 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted">Password Strength</span>
                  <span className={`font-bold transition-all duration-300 ${strengthLabel.labelColor}`}>
                    {strengthLabel.text}
                  </span>
                </div>
                
                {/* Progress bars */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((barIndex) => (
                    <div
                      key={barIndex}
                      className={`h-full rounded-full transition-all duration-500 bg-border/20 ${
                        strengthScore >= barIndex ? strengthLabel.color : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Requirements Checklist */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        req.valid ? 'text-foreground font-medium' : 'text-muted'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                          req.valid
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-105'
                            : 'border-border text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Update Credentials</span>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
