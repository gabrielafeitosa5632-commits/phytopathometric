/**
 * PhytoPathometric — Sign In Page
 * Design: AgTech Dashboard Moderno
 * Auth: localStorage-based (swap with API when ready)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

          {/* Logo inside card area */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.52 0.14 155))' }}
            >
              <Leaf size={30} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Bem-vindo de volta</h1>
            <p className="text-green-200/80 text-sm mt-1">Entre na sua conta</p>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border/60 p-6 space-y-5">

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

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
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-primary font-semibold hover:underline"
              >
                Criar conta grátis
              </button>
            </p>

          </div>

          {/* Back to landing */}
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
