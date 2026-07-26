/**
 * PhytoPathometric — Premium Sign In Page
 * Glassmorphism auth card with mesh gradient background
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errorMessages: Record<string, string> = {
    user_not_found: 'Nenhuma conta encontrada com esse e-mail.',
    wrong_password: 'Senha incorreta. Tente novamente.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!password) { setError('Informe sua senha.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/app');
    } else {
      setError(errorMessages[result.error ?? ''] ?? 'Erro ao entrar. Tente novamente.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'oklch(0.09 0.025 155)' }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, oklch(0.35 0.14 155 / 0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at bottom right, oklch(0.45 0.18 140 / 0.10) 0%, transparent 60%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, oklch(0.38 0.14 155), oklch(0.55 0.20 155))',
              boxShadow: '0 8px 32px oklch(0.55 0.20 155 / 0.35)',
            }}>
            <Leaf size={28} className="text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-2xl tracking-tight" style={{ color: 'oklch(0.93 0.012 155)' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'oklch(0.58 0.06 155)' }}>
            Entre na sua conta
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: 'oklch(0.16 0.035 155 / 0.80)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            boxShadow: '0 20px 60px oklch(0 0 0 / 0.4), 0 1px 0 oklch(1 0 0 / 0.06) inset',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'oklch(0.58 0.06 155)' }}>
                E-mail
              </Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl text-sm transition-all outline-none"
                  style={{
                    background: 'oklch(0.20 0.035 155)',
                    border: '1px solid oklch(1 0 0 / 0.08)',
                    color: 'oklch(0.93 0.012 155)',
                    fontSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'oklch(0.60 0.18 155 / 0.5)'}
                  onBlur={e => e.target.style.borderColor = 'oklch(1 0 0 / 0.08)'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'oklch(0.58 0.06 155)' }}>
                Senha
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-12 pl-10 pr-12 rounded-2xl text-sm transition-all outline-none"
                  style={{
                    background: 'oklch(0.20 0.035 155)',
                    border: '1px solid oklch(1 0 0 / 0.08)',
                    color: 'oklch(0.93 0.012 155)',
                    fontSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'oklch(0.60 0.18 155 / 0.5)'}
                  onBlur={e => e.target.style.borderColor = 'oklch(1 0 0 / 0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'oklch(0.55 0.06 155)' }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{
                  background: 'oklch(0.57 0.24 27 / 0.12)',
                  border: '1px solid oklch(0.57 0.24 27 / 0.25)',
                  color: 'oklch(0.75 0.18 27)',
                }}
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, oklch(0.42 0.15 155), oklch(0.30 0.10 155))',
                boxShadow: '0 4px 20px oklch(0.42 0.15 155 / 0.40)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
            <span className="text-xs font-medium" style={{ color: 'oklch(0.50 0.05 155)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm" style={{ color: 'oklch(0.58 0.06 155)' }}>
            Não tem conta?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-bold transition-colors"
              style={{ color: 'oklch(0.65 0.18 155)' }}
            >
              Criar conta grátis
            </button>
          </p>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors mt-5 mx-auto"
          style={{ color: 'oklch(0.50 0.05 155)' }}
        >
          <ArrowLeft size={13} />
          Voltar ao início
        </button>
      </motion.div>
    </div>
  );
}
