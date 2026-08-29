import * as React from 'react';

export function isNativeButtonElement(element: React.ReactElement): boolean {
  return typeof element.type === 'string' && element.type === 'button';
}

export function isNativeAnchorElement(element: React.ReactElement): boolean {
  return typeof element.type === 'string' && element.type === 'a';
}

/** Whether Base UI should treat the rendered child as a native button. */
export function shouldUseNativeButton(element: React.ReactElement): boolean {
  if (isNativeButtonElement(element)) {
    return true;
  }

  if (isNativeAnchorElement(element)) {
    return false;
  }

  if (typeof element.type !== 'string') {
    const props = element.props as { type?: string; href?: string };
    if (props.href || props.type === 'a') {
      return false;
    }

    // Wrapper components such as IconButton render a native <button>.
    return true;
  }

  return false;
}

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export function mergeHandlers<E extends React.SyntheticEvent>(
  theirs?: React.EventHandler<E>,
  ours?: React.EventHandler<E>,
): React.EventHandler<E> | undefined {
  if (!theirs) return ours;
  if (!ours) return theirs;

  return (event) => {
    theirs(event);
    ours(event);
  };
}
