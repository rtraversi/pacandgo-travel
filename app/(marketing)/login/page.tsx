import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Agent Login — PAC and GO Travel' }

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-navy px-[5%]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-3">Agent Portal</p>
          <h1 className="text-3xl text-white">Welcome Back</h1>
          <p className="text-white/60 mt-2 text-sm">Sign in to manage your profile, deals, and content.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
