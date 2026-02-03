'use client';

import { useState, useMemo } from 'react';
import {
  estimateTakeHome,
  Period,
  Jurisdiction,
  NICategory,
  NI_CATEGORY_DESCRIPTIONS,
  TakeHomeResult,
} from '@/lib/takeHome';
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
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

const periodLabels: Record<Period, string> = {
  year: 'Yearly',
  month: 'Monthly',
  week: 'Weekly',
  day: 'Daily',
};

const jurisdictionLabels: Record<Jurisdiction, string> = {
  ruk: 'England, Wales & N. Ireland',
  scotland: 'Scotland',
};

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
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center gap-2 text-primary">
              <Calculator className="h-8 w-8" />
              <h1 className="text-3xl font-bold">
                UK Take Home Pay Calculator
              </h1>
            </div>
            <p className="text-muted-foreground">
              Calculate your net income after Income Tax and National Insurance
              for the 2025/26 tax year
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <HelpCircle className="h-4 w-4" />
              How it works
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PoundSterling className="h-5 w-5" />
                  Income Details
                </CardTitle>
                <CardDescription>
                  Enter your gross income and select options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gross Income */}
                <div className="space-y-2">
                  <Label htmlFor="gross">Gross Income</Label>
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
                  <Label>Input Period</Label>
                  <Tabs
                    value={period}
                    onValueChange={(v) => setPeriod(v as Period)}
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      {(Object.keys(periodLabels) as Period[]).map((p) => (
                        <TabsTrigger key={p} value={p}>
                          {periodLabels[p]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                {/* Jurisdiction */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Tax Region
                  </Label>
                  <Select
                    value={jurisdiction}
                    onValueChange={(v) => setJurisdiction(v as Jurisdiction)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(jurisdictionLabels) as Jurisdiction[]).map(
                        (j) => (
                          <SelectItem key={j} value={j}>
                            {jurisdictionLabels[j]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                  <Label htmlFor="taxCode" className="flex items-center gap-2">
                    Tax Code
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Leave empty for default (1257L). Common codes: BR
                          (basic rate all), D0 (higher rate all), 0T (no
                          allowance), NT (no tax). S prefix for Scotland (e.g.,
                          S1257L).
                        </p>
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
                    NI Category
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Category A is for most employees. Other categories
                          apply to specific groups like apprentices (H), under
                          21 (M), or state pension age (C).
                        </p>
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
                            - {NI_CATEGORY_DESCRIPTIONS[cat]}
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
                  Results
                </CardTitle>
                <CardDescription>Your take home pay breakdown</CardDescription>
                {/* Output Period Selector */}
                <Tabs
                  value={outputPeriod}
                  onValueChange={(v) => setOutputPeriod(v as Period)}
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    {(Object.keys(periodLabels) as Period[]).map((p) => (
                      <TabsTrigger key={p} value={p}>
                        {periodLabels[p]}
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
                        title="Gross Income"
                        value={outputResult.gross}
                      />
                      <ResultCard
                        title="Take Home"
                        value={outputResult.takeHome}
                        highlight
                        subtitle={
                          result
                            ? `${(
                                (result.annual.takeHome / result.annual.gross) *
                                100
                              ).toFixed(1)}% of gross`
                            : undefined
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Deductions
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <ResultCard
                          title="Income Tax"
                          value={outputResult.incomeTax}
                          negative
                        />
                        <ResultCard
                          title="National Insurance"
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
                            Annual Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Personal Allowance
                              </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  result.annual.personalAllowance
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Taxable Income
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
                                Tax Band Breakdown
                              </h4>
                              <div className="space-y-2">
                                {result.annual.incomeTaxBreakdown.map(
                                  (band, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3"
                                    >
                                      <div>
                                        <span className="capitalize font-medium">
                                          {band.bandName}
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
                                          on{' '}
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
                            Tax Year: {result.meta.calculationTaxYear}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            Region:{' '}
                            {jurisdictionLabels[result.meta.jurisdiction]}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            Tax Code: {result.meta.taxCodeUsed || '1257L'}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded">
                            NI Category: {result.meta.niCategory}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter your gross income to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card className="bg-muted/50">
            <CardContent className="py-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                This calculator provides estimates based on HMRC 2025/26 tax
                rates. For accurate calculations, please consult a tax
                professional or use HMRC official tools. Student loan
                repayments, pension contributions, and other deductions are not
                included.
              </p>
              <p className="text-center">
                <Link
                  href="/how-it-works"
                  className="text-sm text-primary hover:underline"
                >
                  Learn more about how we calculate your take home pay
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
