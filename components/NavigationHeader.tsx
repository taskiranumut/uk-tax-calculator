'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calculator, Moon, Sun, Globe, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ThemeProvider';

interface NavigationHeaderProps {
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonText?: string;
}

export function NavigationHeader({
  showBackButton = false,
  backButtonHref = '/',
  backButtonText = 'Back to Calculator',
}: NavigationHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState<'tr' | 'en'>('en');

  const languages = [
    { code: 'tr' as const, label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find((l) => l.code === currentLanguage);

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
                UK Tax Calculator
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Take Home Pay Estimator
              </span>
            </div>
          </Link>

          {/* Right side - Controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang?.flag}</span>
                <span className="hidden md:inline">{currentLang?.label}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className={currentLanguage === lang.code ? 'bg-muted' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
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
                aria-label="Toggle dark mode"
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
              {backButtonText}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
