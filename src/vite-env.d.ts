/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_APP_BASE_API?: string;
  readonly VITE_APP_HOMEPAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
