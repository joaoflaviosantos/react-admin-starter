export enum BasicStatus {
  DISABLE = 'DISABLE',
  ENABLE = 'ENABLE',
}

export enum ResultEnum {
  SUCCESS = 0,
  ERROR = -1,
  TIMEOUT = 401,
}

export enum StorageEnum {
  Token = 'access_token',
  User = 'user',
  Settings = 'settings',
  I18N = 'i18nextLng',
}

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

export enum ThemeLayout {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Mini = 'mini',
}

export enum ThemeColorPresets {
  Default = 'default',
  Green = 'green',
  Cyan = 'cyan',
  Pink = 'pink',
  Purple = 'purple',
  Blue = 'blue',
  Orange = 'orange',
  Red = 'red',
}

export enum LocalEnum {
  pt_BR = 'pt_BR',
  en_US = 'en_US',
}

export enum MultiTabOperation {
  FULLSCREEN = 'fullscreen',
  REFRESH = 'refresh',
  CLOSE = 'close',
  CLOSEOTHERS = 'closeOthers',
  CLOSEALL = 'closeAll',
  CLOSELEFT = 'closeLeft',
  CLOSERIGHT = 'closeRight',
}

export enum PermissionType {
  CATALOGUE = 'CATALOGUE',
  MENU = 'MENU',
  BUTTON = 'BUTTON',
}

export enum PermissionActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  SYNCRONIZE = 'SYNCRONIZE',
}
