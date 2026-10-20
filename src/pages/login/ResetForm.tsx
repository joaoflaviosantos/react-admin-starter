import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';
import ResetIcon from '@/assets/icons/reset-password.svg';

export default function ResetForm() {
  const { t } = useTranslation();
  const { loginState, backToLogin } = useLoginStateContext();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loginState === LoginStateEnum.RESET_PASSWORD) {
      setSubmitted(false);
      setEmail('');
    }
  }, [loginState]);

  if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate async request
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="text-green-500 h-24 w-24" strokeWidth={1.2} />
        </div>
        <div className="mb-3 text-2xl font-bold xl:text-3xl">
          {t('sys.login.resetEmailSentTitle')}
        </div>
        <p className="mb-8 px-2 text-sm text-muted-foreground">
          {t('sys.login.resetEmailSentDesc', { email })}
        </p>
        <Button variant="outline" className="w-full" size="lg" onClick={backToLogin}>
          {t('sys.login.backSignIn')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <img src={ResetIcon} alt="Reset Password" width={130} height={130} />
      </div>
      <div className="mb-2 text-center text-2xl font-bold xl:text-3xl">
        {t('sys.login.forgetFormTitle')}
      </div>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {t('sys.login.forgetFormDesc')}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex w-full items-center">
          <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            type="email"
            className="pl-10"
            placeholder={t('sys.login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading || !email.trim()}>
          {loading ? t('sys.login.sending') : t('sys.login.sendEmailButton')}
        </Button>
        <Button variant="outline" type="button" className="w-full" size="lg" onClick={backToLogin}>
          {t('sys.login.backSignIn')}
        </Button>
      </form>
    </div>
  );
}
