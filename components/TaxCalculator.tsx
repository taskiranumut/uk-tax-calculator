'use client';

import { useState, useMemo } from 'react';
import {
  estimateTakeHome,
  Period,
  Jurisdiction,
  NICategory,
  TakeHomeResult,
} from '@/lib/takeHome';
import { useTranslations } from '@/contexts/LocaleContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calculator,
  PoundSterling,
  Info,
  Building2,
  Calendar,
} from 'lucide-react';

const niCategories: NICategory[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'S',
  'V',
  'Z',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

interface ResultCardProps {
  title: string;
  value: number;
  subtitle?: string;
  highlight?: boolean;
  negative?: boolean;
}

function ResultCard({
  title,
  value,
  subtitle,
  highlight,
  negative,
}: ResultCardProps) {
  return (
    <div
      className={`rounded-lg p-4 ${
        highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}
    >
      <p
        className={`text-sm font-medium ${
          highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'
        }`}
      >
        {title}
      </p>
      <p className={`text-2xl font-bold ${negative ? 'text-destructive' : ''}`}>
        {negative && value > 0 ? '-' : ''}
        {formatCurrency(value)}
      </p>
      {subtitle && (
        <p
          className={`text-xs mt-1 ${
            highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function TaxCalculator() {
  const t = useTranslations();
  const [grossInput, setGrossInput] = useState<string>('30000');
  const [period, setPeriod] = useState<Period>('year');
  const [outputPeriod, setOutputPeriod] = useState<Period>('year');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('ruk');
  const [taxCode, setTaxCode] = useState<string>('');
  const [niCategory, setNiCategory] = useState<NICategory>('A');

  const gross = useMemo(() => {
    const parsed = parseFloat(grossInput.replace(/,/g, ''));
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [grossInput]);

  const result: TakeHomeResult | null = useMemo(() => {
    if (gross === 0) return null;

    return estimateTakeHome({
      gross,
      period,
      jurisdiction,
      taxCode: taxCode || undefined,
      niCategory,
    });
  }, [gross, period, jurisdiction, taxCode, niCategory]);

  // Convert results to output period
  const outputResult = useMemo(() => {
    if (!result) return null;

    const divisor =
      outputPeriod === 'year'
        ? 1
        : outputPeriod === 'month'
        ? 12
        : outputPeriod === 'week'
        ? 52
        : 260; // day

    return {
      gross: result.annual.gross / divisor,
      incomeTax: result.annual.incomeTax / divisor,
      nationalInsurance: result.annual.nationalInsurance / divisor,
      takeHome: result.annual.takeHome / divisor,
    };
  }, [result, outputPeriod]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PoundSterling className="h-5 w-5" />
                  {t('calculator.incomeDetails')}
                </CardTitle>
                <CardDescription>
                  {t('calculator.incomeDetailsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gross Income */}
                <div className="space-y-2">
                  <Label htmlFor="gross">{t('calculator.grossIncome')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      £
                    </span>
                    <Input
                      id="gross"
                      type="text"
                      inputMode="decimal"
                      value={grossInput}
                      onChange={(e) => setGrossInput(e.target.value)}
                      className="pl-7 text-lg"
                      placeholder="30000"
                    />
                  </div>
                </div>

                {/* Input Period */}
                <div className="space-y-2">
                  <Label>{t('calculator.inputPeriod')}</Label>
                  <Tabs
                    value={period}
                    onValueChange={(v) => setPeriod(v as Period)}
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      {(['year', 'month', 'week', 'day'] as Period[]).map(
                        (p) => (
                          <TabsTrigger key={p} value={p}>
                            {t(`calculator.periods.${p}`)}
                          </TabsTrigger>
                        )
                      )}
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                {/* Jurisdiction */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t('calculator.taxRegion')}
                  </Label>
                  <Select
                    value={jurisdiction}
                    onValueChange={(v) => setJurisdiction(v as Jurisdiction)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['ruk', 'scotland'] as Jurisdiction[]).map((j) => (
                        <SelectItem key={j} value={j}>
                          {t(`calculator.jurisdictions.${j}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                  <Label htmlFor="taxCode" className="flex items-center gap-2">
                    {t('calculator.taxCode')}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t('calculator.taxCodeTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="taxCode"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
                    placeholder="1257L"
                    className="uppercase"
                  />
                </div>

                {/* NI Category */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {t('calculator.niCategory')}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t('calculator.niCategoryTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select
                    value={niCategory}
                    onValueChange={(v) => setNiCategory(v as NICategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {niCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="font-mono font-bold">{cat}</span>
                          <span className="ml-2 text-muted-foreground">
                            - {t(`calculator.niCategories.${cat}`)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('calculator.results')}
                </CardTitle>
                <CardDescription>
                  {t('calculator.resultsDescription')}
                </CardDescription>
                {/* Output Period Selector */}
                <Tabs
                  value={outputPeriod}
                  onValueChange={(v) => setOutputPeriod(v as Period)}
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    {(['year', 'month', 'week', 'day'] as Period[]).map((p) => (
                      <TabsTrigger key={p} value={p}>
                        {t(`calculator.periods.${p}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="space-y-4">
                {outputResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <ResultCard
                        title={t('calculator.grossIncome')}
                        value={outputResult.gross}
                      />
                      <ResultCard
                        title={t('calculator.takeHome')}
                        value={outputResult.takeHome}
                        highlight
                        subtitle={
                          result
                            ? `${(
                                (result.annual.takeHome / result.annual.gross) *
                                100
                              ).toFixed(1)}% ${t('calculator.ofGross')}`
                            : undefined
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {t('calculator.deductions')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <ResultCard
                          title={t('calculator.incomeTax')}
                          value={outputResult.incomeTax}
                          negative
                        />
                        <ResultCard
                          title={t('calculator.nationalInsurance')}
                          value={outputResult.nationalInsurance}
                          negative
                        />
                      </div>
                    </div>

                    {result && (
                      <>
                        <Separator />

                        {/* Annual Summary */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            {t('calculator.annualSummary')}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {t('calculator.personalAllowance')}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  result.annual.personalAllowance
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {t('calculator.taxableIncome')}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(result.annual.taxableIncome)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tax Breakdown */}
                        {result.annual.incomeTaxBreakdown.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                {t('calculator.taxBandBreakdown')}
                              </h4>
                              <div className="space-y-2">
                                {result.annual.incomeTaxBreakdown.map(
                                  (band, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {t(
                                            `calculator.taxBands.${band.bandName}`
                                          )}
                                        </span>
                                        <span className="text-muted-foreground ml-2">
                                          @ {formatPercent(band.rate)}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">
                                          {formatCurrency(band.tax)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {t('calculator.on')}{' '}
                                          {formatCurrency(band.taxableInBand)}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Meta Info */}
                        <Separator />
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded">
                            {t('calculator.taxYear')}:{' '}
                            {result.meta.calculationTaxYear}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            {t('calculator.region')}:{' '}
                            {t(
                              `calculator.jurisdictions.${result.meta.jurisdiction}`
                            )}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            {t('calculator.taxCode')}:{' '}
                            {result.meta.taxCodeUsed || '1257L'}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            {t('calculator.niCategory')}:{' '}
                            {result.meta.niCategory}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('calculator.enterGrossIncome')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card className="bg-muted/50">
            <CardContent className="py-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {t('calculator.footerDisclaimer')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
