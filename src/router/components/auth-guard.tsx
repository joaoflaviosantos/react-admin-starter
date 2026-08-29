import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { fetchCurrentUser, useUserActions, useUserInfo, useUserToken } from '@/store/userStore';
import { isUserWithPermissionsRead } from '@/utils/permission';

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { access_token } = useUserToken();
  const userInfo = useUserInfo();
  const { setUserInfo, clearAllUserInfoAndToken } = useUserActions();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!access_token) {
        if (!cancelled) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      if (isUserWithPermissionsRead(userInfo)) {
        if (!cancelled) {
          setAuthorized(true);
          setChecking(false);
        }
        return;
      }

      const userData = await fetchCurrentUser();
      if (cancelled) {
        return;
      }

      if (userData && userData.permissions?.length) {
        setUserInfo(userData);
        setAuthorized(true);
      } else {
        clearAllUserInfoAndToken();
        setAuthorized(false);
      }
      setChecking(false);
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [access_token, userInfo, setUserInfo, clearAllUserInfoAndToken]);

  useEffect(() => {
    if (!checking && !authorized) {
      navigate('/login', { replace: true });
    }
  }, [checking, authorized, navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-layout">
        <Skeleton className="h-12 w-12 rounded-full" />
        <p className="text-sm text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
