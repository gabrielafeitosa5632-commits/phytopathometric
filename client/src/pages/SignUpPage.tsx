/**
 * PhytoPathometric — Premium Sign Up Page
 * Glassmorphism dark auth card
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Leaf, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 6 caracteres', ok: password.length >= 6 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1 mt-2">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1.5 text-xs"
          style={{ color: c.ok ? 'oklch(0.62 0.18 143)' : 'oklch(0.50 0.05 155)' }}>
          <CheckCircle2 size={11} style={{ color: c.ok ? 'oklch(0.62 0.18 143)' : 'oklch(0.35 0.04 155)' }} />
          {c.label}
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  background: 'oklch(0.20 0.035 155)',
  border: '1px solid oklch(1 0 0 / 0.08)',
  color: 'oklch(0.93 0.012 155)',
  fontSize: '14px',
};

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errorMessages: Record<string, string> = {
    email_exists: 'Já existe uma conta com esse e-mail.',
    password_short: 'A senha deve ter pelo menos 6 caracteres.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Informe seu nome.'); return; }
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('E-mail inválido.'); return; }
    if (!password) { setError('Crie uma senha.'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/app');
    } else {
      setError(errorMessages[result.error ?? ''] ?? 'Erro ao criar conta. Tente novamente.');
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'oklch(0.60 0.18 155 / 0.5)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'oklch(1 0 0 / 0.08)';
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'oklch(0.09 0.025 155)' }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, oklch(0.38 0.16 155 / 0.20) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at bottom left, oklch(0.42 0.16 140 / 0.08) 0%, transparent 60%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, oklch(0.38 0.14 155), oklch(0.58 0.22 155))',
              boxShadow: '0 8px 32px oklch(0.55 0.20 155 / 0.35)',
            }}>
            <Leaf size={28} className="text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-2xl tracking-tight" style={{ color: 'oklch(0.93 0.012 155)' }}>
            Criar sua conta
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'oklch(0.58 0.06 155)' }}>
            Gratuito, sem cartão de crédito
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-6 space-y-4"
          style={{
            background: 'oklch(0.16 0.035 155 / 0.80)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            boxShadow: '0 20px 60px oklch(0 0 0 / 0.4), 0 1px 0 oklch(1 0 0 / 0.06) inset',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.58 0.06 155)' }}>
                Nome completo
              </Label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  type="text"
                  placeholder="João Silva"
                  autoComplete="name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl text-sm transition-all outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.58 0.06 155)' }}>
                E-mail
              </Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl text-sm transition-all outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.58 0.06 155)' }}>
                Senha
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-12 rounded-2xl text-sm transition-all outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.58 0.06 155)' }}>
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-12 rounded-2xl text-sm transition-all outline-none"
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== password
                      ? 'oklch(0.57 0.24 27 / 0.4)'
                      : confirmPassword && confirmPassword === password
                      ? 'oklch(0.56 0.22 143 / 0.4)'
                      : 'oklch(1 0 0 / 0.08)',
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.55 0.06 155)' }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword === password && (
                <p className="flex items-center gap-1.5 text-xs" style={{ color: 'oklch(0.62 0.18 143)' }}>
                  <CheckCircle2 size={11} />Senhas coincidem
                </p>
              )}
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
                marginTop: '4px',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />Criando conta...
                </span>
              ) : 'Criar conta'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
            <span className="text-xs font-medium" style={{ color: 'oklch(0.50 0.05 155)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'oklch(0.58 0.06 155)' }}>
            Já tem conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold transition-colors"
              style={{ color: 'oklch(0.65 0.18 155)' }}
            >
              Entrar
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors mt-5 mx-auto"
          style={{ color: 'oklch(0.50 0.05 155)' }}
        >
          <ArrowLeft size={13} />Voltar ao início
        </button>
      </motion.div>
    </div>
  );
}
