import { ReactNode } from 'react';
import { Params, RouteObject } from 'react-router-dom';

export interface RouteMeta {
  key: string;
  type?: string;
  label: string;
  alternative_label?: string | null;
  icon?: ReactNode;
  suffix?: ReactNode;
  is_hide?: boolean;
  is_tab_hide?: boolean | null;
  disabled?: boolean;
  outlet?: unknown;
  timeStamp?: string;
  frame_src?: string;
  params?: Params<string>;
}

export type AppRouteObject = {
  order?: string;
  meta?: RouteMeta;
  children?: AppRouteObject[];
} & Omit<RouteObject, 'children'>;
