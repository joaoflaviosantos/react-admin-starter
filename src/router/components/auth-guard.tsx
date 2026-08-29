import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

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
      <div className="flex min-h-screen items-center justify-center bg-ant-bg-layout">
        <Spin size="large" tip="Loading session..." />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
