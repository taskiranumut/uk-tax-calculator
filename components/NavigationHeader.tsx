'use client';

import Link from 'next/link';
import { Calculator, Moon, Sun, Globe, ChevronDown } from 'lucide-react';
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
    <header className="bg-card border-b">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and App Name */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Calculator className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-foreground">
                {t('common.appName')}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {t('common.appDescription')}
              </span>
            </div>
          </Link>

          {/* Right side - Controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang.flag}</span>
                <span className="hidden md:inline">{currentLang.label}</span>
                <ChevronDown className="h-3 w-3" />
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
            <div className="flex items-center gap-2">
              <Sun
                className={`h-4 w-4 ${
                  theme === 'light' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label={t('common.toggleDarkMode')}
              />
              <Moon
                className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Optional Back Button Row */}
        {showBackButton && (
          <div className="mt-3 pt-3 border-t">
            <Link
              href={backButtonHref}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
