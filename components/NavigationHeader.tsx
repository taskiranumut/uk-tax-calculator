'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun, Globe, ChevronDown, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ThemeProvider';
import {
  useLocale,
  useSetLocale,
  useTranslations,
} from '@/contexts/LocaleContext';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

interface NavigationHeaderProps {
  showBackButton?: boolean;
  backButtonHref?: string;
}

export function NavigationHeader({
  showBackButton = false,
  backButtonHref = '/',
}: NavigationHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useTranslations();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const currentLang = {
    code: locale,
    label: localeNames[locale],
    flag: localeFlags[locale],
  };

  return (
    <header className="bg-card">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and App Name */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
          >
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden">
              <Image
                src="/main-logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-lg leading-tight text-foreground truncate">
                {t('calculator.pageTitle')}
              </span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                {t('common.appDescription')}
              </span>
            </div>
          </Link>

          {/* Right side - Controls */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* How It Works Link */}
            <Link
              href="/how-it-works"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden md:inline">
                {t('navigation.howItWorks')}
              </span>
            </Link>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang.flag}</span>
                <span className="hidden lg:inline">{currentLang.label}</span>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    className={locale === loc ? 'bg-muted' : ''}
                  >
                    <span className="mr-2">{localeFlags[loc]}</span>
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sun
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:block ${
                  theme === 'light' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label={t('common.toggleDarkMode')}
              />
              <Moon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:block ${
                  theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Optional Back Button Row */}
        {showBackButton && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
            <Link
              href={backButtonHref}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              {t('common.backToCalculator')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
