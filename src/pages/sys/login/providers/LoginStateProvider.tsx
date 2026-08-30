import React, { createContext, useContext, useState } from 'react';

export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  MOBILE,
  QR_CODE,
}

interface LoginStateContextType {
  loginState: LoginStateEnum;
  setLoginState: (state: LoginStateEnum) => void;
  backToLogin: () => void;
}

const LoginStateContext = createContext<LoginStateContextType | undefined>(undefined);

export function LoginStateProvider({ children }: { children: React.ReactNode }) {
  const [loginState, setLoginState] = useState<LoginStateEnum>(LoginStateEnum.LOGIN);

  const backToLogin = () => setLoginState(LoginStateEnum.LOGIN);

  return (
    <LoginStateContext.Provider value={{ loginState, setLoginState, backToLogin }}>
      {children}
    </LoginStateContext.Provider>
  );
}

export function useLoginStateContext() {
  const context = useContext(LoginStateContext);
  if (!context) {
    throw new Error('useLoginStateContext must be used within a LoginStateProvider');
  }
  return context;
}
