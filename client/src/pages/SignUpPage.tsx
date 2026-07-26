/**
 * PhytoPathometric — Sign Up Page
 * Design: AgTech Dashboard Moderno
 * Auth: localStorage-based (swap with API when ready)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Leaf, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 size={11} className={c.ok ? 'text-green-500' : 'text-border'} />
          {c.label}
        </div>
      ))}
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Background top accent */}
      <div
        className="h-48 flex-shrink-0"
        style={{
          background: 'linear-gradient(160deg, oklch(0.18 0.07 155) 0%, oklch(0.32 0.09 155) 100%)',
        }}
      />

      {/* Card container */}
      <div className="flex-1 flex flex-col items-center -mt-24 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.52 0.14 155))' }}
            >
              <Leaf size={30} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Criar sua conta</h1>
            <p className="text-green-200/80 text-sm mt-1">Gratuito, sem cartão de crédito</p>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border/60 p-6 space-y-5">

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nome completo
                </Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Silva"
                    autoComplete="name"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    className="pl-9 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="pl-9 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Senha
                </Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="pl-9 pr-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    className={`pl-9 pr-10 h-11 rounded-xl ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-destructive focus-visible:ring-destructive/50'
                        : confirmPassword && confirmPassword === password
                        ? 'border-green-400 focus-visible:ring-green-400/50'
                        : ''
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === password && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 mt-1">
                    <CheckCircle2 size={11} className="text-green-500" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold gap-2 text-base"
                style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.42 0.12 155))' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </button>
            </p>

          </div>

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-5 mx-auto"
          >
            <ArrowLeft size={13} />
            Voltar ao início
          </button>

        </motion.div>
      </div>
    </div>
  );
}
