import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'How It Works - UK Take Home Pay Calculator',
  description:
    'Learn how we calculate your estimated take home pay based on HMRC 2025/26 tax rates.',
};

function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function RateTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {headers.map((header, i) => (
              <th key={i} className="text-left py-2 px-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExampleCard({
  title,
  gross,
  personalAllowance,
  taxableIncome,
  englandTax,
  scotlandTax,
  ni,
  englandTakeHome,
  scotlandTakeHome,
  englandTaxBreakdown,
  scotlandTaxBreakdown,
  niBreakdown,
}: {
  title: string;
  gross: string;
  personalAllowance: string;
  taxableIncome: string;
  englandTax: string;
  scotlandTax: string;
  ni: string;
  englandTakeHome: string;
  scotlandTakeHome: string;
  englandTaxBreakdown: { band: string; amount: string }[];
  scotlandTaxBreakdown: { band: string; amount: string }[];
  niBreakdown: { band: string; amount: string }[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary text-primary-foreground px-6 py-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-primary-foreground/80 text-sm">
          Gross income: {gross}
        </p>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Personal Allowance:</span>
            <span className="ml-2 font-medium">{personalAllowance}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxable Income:</span>
            <span className="ml-2 font-medium">{taxableIncome}</span>
          </div>
        </div>

        <Separator />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* England & NI Tax */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              England & Northern Ireland Tax
            </h5>
            <div className="space-y-1 text-sm">
              {englandTaxBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.band}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total Income Tax</span>
                <span>{englandTax}</span>
              </div>
            </div>
          </div>

          {/* Scotland Tax */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Scottish Income Tax
            </h5>
            <div className="space-y-1 text-sm">
              {scotlandTaxBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.band}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total Income Tax</span>
                <span>{scotlandTax}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* National Insurance */}
        <div className="space-y-3">
          <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            National Insurance (UK-wide, Category A)
          </h5>
          <div className="space-y-1 text-sm max-w-md">
            {niBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.band}</span>
                <span>{item.amount}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total NI</span>
              <span>{ni}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Take Home Results */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">
              England & N. Ireland Take Home
            </p>
            <p className="text-2xl font-bold text-primary">{englandTakeHome}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Scotland Take Home
            </p>
            <p className="text-2xl font-bold text-primary">
              {scotlandTakeHome}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />
            <span className="font-semibold">UK Tax Calculator</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Title Section */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            How we estimate take home pay
          </h1>
          <p className="text-lg text-muted-foreground">
            Tax year 6 April 2025 to 5 April 2026
          </p>
        </div>

        {/* Intro */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p>
              This calculator provides an <strong>estimated</strong> take home
              pay figure for a single employment, based on the UK rules for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>
                Income Tax (England, Northern Ireland, Wales rates and bands) or
                Scottish Income Tax (if applicable)
              </li>
              <li>
                Employee National Insurance (Class 1, primary contribution)
              </li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">
                This calculator assumes no other adjustments, for example:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Pension contributions (including salary sacrifice)</li>
                <li>Student loan repayments</li>
                <li>Benefits in kind</li>
                <li>Charitable giving</li>
                <li>Multiple jobs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Official Rates Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">
            Official rates used (2025 to 2026)
          </h2>

          {/* Personal Allowance */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Personal Allowance</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>
                    Standard Personal Allowance: <strong>£12,570</strong> per
                    year
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>
                    If your adjusted net income is above{' '}
                    <strong>£100,000</strong>, the Personal Allowance is reduced
                    by <strong>£1 for every £2</strong> over £100,000, reaching{' '}
                    <strong>£0 at £125,140</strong>
                  </span>
                </li>
              </ul>
              <SourceLink href="https://www.gov.uk/income-tax-rates">
                Income Tax rates and Personal Allowances - GOV.UK
              </SourceLink>
            </CardContent>
          </Card>

          {/* England & NI Tax */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">
                Income Tax (England and Northern Ireland)
              </h3>
              <p className="text-muted-foreground text-sm">
                Rates apply to your <strong>taxable income</strong> above the
                Personal Allowance
              </p>
              <RateTable
                headers={['Band', 'Rate', 'Taxable Income']}
                rows={[
                  ['Basic rate', <strong key="b">20%</strong>, 'Up to £37,700'],
                  [
                    'Higher rate',
                    <strong key="h">40%</strong>,
                    '£37,701 to £125,140',
                  ],
                  [
                    'Additional rate',
                    <strong key="a">45%</strong>,
                    'Above £125,140',
                  ],
                ]}
              />
              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                Rates and thresholds for employers 2025 to 2026 - GOV.UK
              </SourceLink>
            </CardContent>
          </Card>

          {/* Scottish Tax */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Scottish Income Tax</h3>
              <p className="text-muted-foreground text-sm">
                Rates apply to your <strong>taxable income</strong> above the
                Personal Allowance
              </p>
              <RateTable
                headers={['Band', 'Rate', 'Taxable Income']}
                rows={[
                  [
                    'Starter rate',
                    <strong key="s">19%</strong>,
                    'Up to £2,827',
                  ],
                  [
                    'Basic rate',
                    <strong key="b">20%</strong>,
                    '£2,828 to £14,921',
                  ],
                  [
                    'Intermediate rate',
                    <strong key="i">21%</strong>,
                    '£14,922 to £31,092',
                  ],
                  [
                    'Higher rate',
                    <strong key="h">42%</strong>,
                    '£31,093 to £62,430',
                  ],
                  [
                    'Advanced rate',
                    <strong key="a">45%</strong>,
                    '£62,431 to £125,140',
                  ],
                  ['Top rate', <strong key="t">48%</strong>, 'Above £125,140'],
                ]}
              />
              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                Rates and thresholds for employers 2025 to 2026 - GOV.UK
              </SourceLink>
            </CardContent>
          </Card>

          {/* National Insurance */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">
                Employee National Insurance (Class 1, primary, NI category A)
              </h3>
              <p className="text-muted-foreground text-sm">
                National Insurance is calculated on{' '}
                <strong>gross earnings</strong> (not on taxable income)
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Thresholds</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Primary Threshold
                      </span>
                      <strong>£12,570/year</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Upper Earnings Limit
                      </span>
                      <strong>£50,270/year</strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Rates (Category A)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Up to £12,570
                      </span>
                      <strong>0%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        £12,570 to £50,270
                      </span>
                      <strong>8%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Above £50,270
                      </span>
                      <strong>2%</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                Rates and thresholds for employers 2025 to 2026 - GOV.UK
              </SourceLink>
            </CardContent>
          </Card>
        </section>

        {/* Calculation Method */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">
            Calculation method (annual basis)
          </h2>
          <Card>
            <CardContent className="p-6">
              <ol className="space-y-4">
                {[
                  'Convert the user input to an annual gross figure (for weekly or monthly pay, annualise first).',
                  'Determine Personal Allowance (including the reduction above £100,000 where applicable).',
                  <>
                    Calculate taxable income:{' '}
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      taxable income = annual gross − Personal Allowance
                    </code>{' '}
                    (minimum 0).
                  </>,
                  'Calculate Income Tax by applying the relevant rates to the taxable income bands.',
                  'Calculate employee National Insurance (Class 1 primary) from the annual gross figure.',
                  <>
                    Calculate take home pay:{' '}
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      take home = annual gross − Income Tax − National Insurance
                    </code>
                  </>,
                  'If the user selected weekly or monthly, convert the annual results back to that period.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {i + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Worked Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Worked examples</h2>
          <p className="text-muted-foreground">
            Single job, NI category A, no other deductions
          </p>

          {/* Example A: £30,000 */}
          <ExampleCard
            title="Example A"
            gross="£30,000 per year"
            personalAllowance="£12,570"
            taxableIncome="£17,430"
            englandTax="£3,486.00"
            scotlandTax="£3,482.82"
            ni="£1,394.40"
            englandTakeHome="£25,119.60"
            scotlandTakeHome="£25,122.78"
            englandTaxBreakdown={[
              { band: '£17,430 at 20%', amount: '£3,486.00' },
            ]}
            scotlandTaxBreakdown={[
              { band: '£2,827 at 19%', amount: '£537.13' },
              { band: '£12,094 at 20%', amount: '£2,418.80' },
              { band: '£2,509 at 21%', amount: '£526.89' },
            ]}
            niBreakdown={[{ band: '£17,430 at 8%', amount: '£1,394.40' }]}
          />

          {/* Example B: £60,000 */}
          <ExampleCard
            title="Example B"
            gross="£60,000 per year"
            personalAllowance="£12,570"
            taxableIncome="£47,430"
            englandTax="£11,432.00"
            scotlandTax="£13,213.80"
            ni="£3,210.60"
            englandTakeHome="£45,357.40"
            scotlandTakeHome="£43,575.60"
            englandTaxBreakdown={[
              { band: '£37,700 at 20%', amount: '£7,540.00' },
              { band: '£9,730 at 40%', amount: '£3,892.00' },
            ]}
            scotlandTaxBreakdown={[
              { band: '£2,827 at 19%', amount: '£537.13' },
              { band: '£12,094 at 20%', amount: '£2,418.80' },
              { band: '£16,171 at 21%', amount: '£3,395.91' },
              { band: '£16,338 at 42%', amount: '£6,861.96' },
            ]}
            niBreakdown={[
              { band: '£37,700 at 8%', amount: '£3,016.00' },
              { band: '£9,730 at 2%', amount: '£194.60' },
            ]}
          />

          {/* Example C: £150,000 */}
          <ExampleCard
            title="Example C"
            gross="£150,000 per year"
            personalAllowance="£0 (fully removed at £125,140+)"
            taxableIncome="£150,000"
            englandTax="£53,703.00"
            scotlandTax="£59,666.10"
            ni="£5,010.60"
            englandTakeHome="£91,286.40"
            scotlandTakeHome="£85,323.30"
            englandTaxBreakdown={[
              { band: '£37,700 at 20%', amount: '£7,540.00' },
              { band: '£87,440 at 40%', amount: '£34,976.00' },
              { band: '£24,860 at 45%', amount: '£11,187.00' },
            ]}
            scotlandTaxBreakdown={[
              { band: '£2,827 at 19%', amount: '£537.13' },
              { band: '£12,094 at 20%', amount: '£2,418.80' },
              { band: '£16,171 at 21%', amount: '£3,395.91' },
              { band: '£31,338 at 42%', amount: '£13,161.96' },
              { band: '£62,710 at 45%', amount: '£28,219.50' },
              { band: '£24,860 at 48%', amount: '£11,932.80' },
            ]}
            niBreakdown={[
              { band: '£37,700 at 8%', amount: '£3,016.00' },
              { band: '£99,730 at 2%', amount: '£1,994.60' },
            ]}
          />
        </section>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">
              Ready to calculate your take home pay?
            </h3>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 rounded-lg font-medium hover:bg-background/90 transition-colors"
            >
              <Calculator className="h-5 w-5" />
              Go to Calculator
            </Link>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            This calculator provides estimates based on HMRC 2025/26 tax rates.
            For accurate calculations, please consult a tax professional or use
            HMRC official tools.
          </p>
        </div>
      </footer>
    </div>
  );
}
