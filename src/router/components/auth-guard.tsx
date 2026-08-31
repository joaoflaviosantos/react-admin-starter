import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import bg1 from '@/assets/images/background/auth_guard_1.jpg';
import bg2 from '@/assets/images/background/auth_guard_2.jpg';
import bg3 from '@/assets/images/background/auth_guard_3.jpg';
import Logo from '@/components/logo';
import { fetchCurrentUser, useUserActions, useUserInfo, useUserToken } from '@/store/userStore';
import { useTheme } from '@/theme/hooks/use-theme';
import { isUserWithPermissionsRead } from '@/utils/permission';

// Minimum time the loading screen is always visible (ms)
const MIN_LOADING_MS = 1800;

// ±30% random variation so it doesn't feel robotic
function getDynamicTimeout() {
  return MIN_LOADING_MS * (0.7 + Math.random() * 0.6);
}

// Helper function to darken a hex color
function darkenColor(hex: string, amount = 0.65) {
  const value = hex.replace('#', '');

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgb(
    ${Math.round(r * amount)}
    ${Math.round(g * amount)}
    ${Math.round(b * amount)}
  )`;
}

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { access_token } = useUserToken();
  const userInfo = useUserInfo();
  const { setUserInfo, clearAllUserInfoAndToken } = useUserActions();
  const { colorPrimary } = useTheme();

  // Always start in "loading" state so the screen is always shown
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Darken the primary color for the overlay
  const overlayColor = darkenColor(colorPrimary, 0.1);

  // Pick a random background image once on mount
  useEffect(() => {
    const images = [bg1, bg2, bg3];
    setBackgroundImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const timeout = getDynamicTimeout();

    // 1. Timer Promise
    const timerPromise = new Promise((resolve) => setTimeout(resolve, timeout));

    // 2. Verification Promise
    const verifyPromise = (async () => {
      if (!access_token) return false;

      // If we already have permissions in state/storage, we are good
      if (isUserWithPermissionsRead(userInfo)) return true;

      // Otherwise, attempt to fetch current user data
      const userData = await fetchCurrentUser();
      if (userData && userData.permissions?.length) {
        setUserInfo(userData);
        return true;
      }

      clearAllUserInfoAndToken();
      return false;
    })();

    // 3. Wait for BOTH to finish
    Promise.all([timerPromise, verifyPromise]).then(([, isAuth]) => {
      if (!cancelled) {
        setAuthorized(isAuth as boolean);
        setLoading(false);
      }
    });

    // Animate progress bar during the timeout
    const intervalTime = 80;
    const totalIntervals = Math.ceil(timeout / intervalTime);
    const increment = 95 / totalIntervals;
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + increment, 95));
    }, intervalTime);

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap progress to 100% when loading finishes
  useEffect(() => {
    if (!loading) setProgress(100);
  }, [loading]);

  // Redirect if not authorized after loading completes
  useEffect(() => {
    if (!loading && !authorized) {
      navigate('/login', { replace: true });
    }
  }, [loading, authorized, navigate]);

  if (loading) {
    // Mimic ScheFlow background string format
    const bgStyle = backgroundImage
      ? `url("${backgroundImage}") center center / cover no-repeat`
      : 'hsl(var(--background))';

    return (
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: bgStyle }}
      >
        {/* Dark primary-color overlay */}
        {backgroundImage && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: 0.85,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex w-[70%] max-w-2xl flex-col items-center justify-center px-6">
          {/* Logo static and larger */}
          <div className="mb-16 w-72 sm:w-96 md:w-[26rem] lg:w-[32rem]">
            <Logo withLink={false} darkMode={true} />
          </div>

          <div className="flex w-full max-w-md flex-col items-center">
            {/* Progress bar */}
            <div className="md:h-3.0 mb-6 h-2 w-full rounded-full bg-white sm:h-2.5">
              <div
                className="md:h-3.0 h-2 rounded-full transition-all duration-300 ease-out sm:h-2.5"
                style={{ width: `${progress}%`, backgroundColor: colorPrimary }}
              />
            </div>

            {/* Loading text */}
            <p className="animate-pulse text-sm font-bold tracking-wide text-white xs:text-lg sm:text-xl">
              {t('sys.login.loadingText', 'Loading...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
