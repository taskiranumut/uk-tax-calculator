'use client';

import { useTranslations } from '@/contexts/LocaleContext';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
        <p>{t('calculator.footerDisclaimer')}</p>
        <p>{t('common.copyright')}</p>
      </div>
    </footer>
  );
}
