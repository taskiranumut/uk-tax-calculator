'use client';

import { useEffect } from 'react';

export function ScrollLockFix() {
  useEffect(() => {
    const resetBodyMargin = () => {
      document.body.style.setProperty('margin-right', '0', 'important');
    };

    // Initial reset
    resetBodyMargin();

    // Watch for style changes on body
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          resetBodyMargin();
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
