'use client';

import Link from 'next/link';
import { ExternalLink, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/contexts/LocaleContext';

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
    <>
      {/* Mobile: Card layout */}
      <div className="sm:hidden space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            {row.map((cell, j) => (
              <div
                key={j}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-muted-foreground">{headers[j]}</span>
                <span className="font-medium">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Desktop: Table layout */}
      <div className="hidden sm:block">
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
    </>
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
  t,
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
  t: (key: string) => string;
}) {
  return (
    <Card className="overflow-hidden !pt-0">
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 sm:py-4">
        <h4 className="font-semibold text-base sm:text-lg">{title}</h4>
        <p className="text-primary-foreground/80 text-xs sm:text-sm">
          {t('howItWorks.exampleCard.grossIncome')}: {gross}
        </p>
      </div>
      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground">
              {t('howItWorks.exampleCard.personalAllowance')}:
            </span>
            <span className="ml-2 font-medium">{personalAllowance}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t('howItWorks.exampleCard.taxableIncome')}:
            </span>
            <span className="ml-2 font-medium">{taxableIncome}</span>
          </div>
        </div>

        <Separator />

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h5 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
              {t('howItWorks.exampleCard.englandNiTax')}
            </h5>
            <div className="space-y-1 text-xs sm:text-sm">
              {englandTaxBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.band}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>{t('howItWorks.exampleCard.totalIncomeTax')}</span>
                <span>{englandTax}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h5 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
              {t('howItWorks.exampleCard.scotlandTax')}
            </h5>
            <div className="space-y-1 text-xs sm:text-sm">
              {scotlandTaxBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.band}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>{t('howItWorks.exampleCard.totalIncomeTax')}</span>
                <span>{scotlandTax}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 sm:space-y-3">
          <h5 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
            {t('howItWorks.exampleCard.nationalInsurance')}
          </h5>
          <div className="space-y-1 text-xs sm:text-sm max-w-md">
            {niBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.band}</span>
                <span>{item.amount}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>{t('howItWorks.exampleCard.totalNi')}</span>
              <span>{ni}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-muted rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('howItWorks.exampleCard.englandTakeHome')}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-primary">
              {englandTakeHome}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('howItWorks.exampleCard.scotlandTakeHome')}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-primary">
              {scotlandTakeHome}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorksPage() {
  const t = useTranslations();

  return (
    <div className="bg-background">
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-12">
        <div className="space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {t('howItWorks.title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t('howItWorks.taxYear')}
          </p>
        </div>

        <Card>
          <CardContent className="space-y-3 sm:space-y-4">
            <p
              className="text-sm sm:text-base"
              dangerouslySetInnerHTML={{
                __html: t('howItWorks.intro.paragraph'),
              }}
            />
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-sm sm:text-base">
              <li>{t('howItWorks.intro.bullet1')}</li>
              <li>{t('howItWorks.intro.bullet2')}</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
              <p className="font-medium mb-2">
                {t('howItWorks.intro.assumesTitle')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t('howItWorks.intro.assumes1')}</li>
                <li>{t('howItWorks.intro.assumes2')}</li>
                <li>{t('howItWorks.intro.assumes3')}</li>
                <li>{t('howItWorks.intro.assumes4')}</li>
                <li>{t('howItWorks.intro.assumes5')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('howItWorks.officialRates')}
          </h2>

          <Card>
            <CardContent className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('howItWorks.personalAllowance.title')}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('howItWorks.personalAllowance.standard'),
                    }}
                  />
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('howItWorks.personalAllowance.reduction'),
                    }}
                  />
                </li>
              </ul>
              <SourceLink href="https://www.gov.uk/income-tax-rates">
                {t('howItWorks.personalAllowance.sourceLink')}
              </SourceLink>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('howItWorks.englandNiTax.title')}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('howItWorks.englandNiTax.ratesApply'),
                  }}
                />
              </p>
              <RateTable
                headers={[
                  t('howItWorks.englandNiTax.band'),
                  t('howItWorks.englandNiTax.rate'),
                  t('howItWorks.englandNiTax.taxableIncome'),
                ]}
                rows={[
                  [
                    t('howItWorks.englandNiTax.basicRate'),
                    <strong key="b">20%</strong>,
                    t('howItWorks.englandNiTax.basicRange'),
                  ],
                  [
                    t('howItWorks.englandNiTax.higherRate'),
                    <strong key="h">40%</strong>,
                    t('howItWorks.englandNiTax.higherRange'),
                  ],
                  [
                    t('howItWorks.englandNiTax.additionalRate'),
                    <strong key="a">45%</strong>,
                    t('howItWorks.englandNiTax.additionalRange'),
                  ],
                ]}
              />
              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                {t('howItWorks.englandNiTax.sourceLink')}
              </SourceLink>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('howItWorks.scotlandTax.title')}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('howItWorks.scotlandTax.ratesApply'),
                  }}
                />
              </p>
              <RateTable
                headers={[
                  t('howItWorks.englandNiTax.band'),
                  t('howItWorks.englandNiTax.rate'),
                  t('howItWorks.englandNiTax.taxableIncome'),
                ]}
                rows={[
                  [
                    t('howItWorks.scotlandTax.starterRate'),
                    <strong key="s">19%</strong>,
                    t('howItWorks.scotlandTax.starterRange'),
                  ],
                  [
                    t('howItWorks.scotlandTax.basicRate'),
                    <strong key="b">20%</strong>,
                    t('howItWorks.scotlandTax.basicRange'),
                  ],
                  [
                    t('howItWorks.scotlandTax.intermediateRate'),
                    <strong key="i">21%</strong>,
                    t('howItWorks.scotlandTax.intermediateRange'),
                  ],
                  [
                    t('howItWorks.scotlandTax.higherRate'),
                    <strong key="h">42%</strong>,
                    t('howItWorks.scotlandTax.higherRange'),
                  ],
                  [
                    t('howItWorks.scotlandTax.advancedRate'),
                    <strong key="a">45%</strong>,
                    t('howItWorks.scotlandTax.advancedRange'),
                  ],
                  [
                    t('howItWorks.scotlandTax.topRate'),
                    <strong key="t">48%</strong>,
                    t('howItWorks.scotlandTax.topRange'),
                  ],
                ]}
              />
              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                {t('howItWorks.scotlandTax.sourceLink')}
              </SourceLink>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('howItWorks.nationalInsurance.title')}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('howItWorks.nationalInsurance.ratesApply'),
                  }}
                />
              </p>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                    {t('howItWorks.nationalInsurance.thresholds')}
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('howItWorks.nationalInsurance.primaryThreshold')}
                      </span>
                      <strong>£12,570/year</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('howItWorks.nationalInsurance.upperEarningsLimit')}
                      </span>
                      <strong>£50,270/year</strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                    {t('howItWorks.nationalInsurance.rates')}
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('howItWorks.nationalInsurance.rate1Label')}
                      </span>
                      <strong>0%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('howItWorks.nationalInsurance.rate2Label')}
                      </span>
                      <strong>8%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('howItWorks.nationalInsurance.rate3Label')}
                      </span>
                      <strong>2%</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <SourceLink href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026">
                {t('howItWorks.nationalInsurance.sourceLink')}
              </SourceLink>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('howItWorks.calculationMethod.title')}
          </h2>
          <Card>
            <CardContent>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  t('howItWorks.calculationMethod.step1'),
                  t('howItWorks.calculationMethod.step2'),
                  <>
                    {t('howItWorks.calculationMethod.step3intro')}{' '}
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {t('howItWorks.calculationMethod.step3formula')}
                    </code>{' '}
                    {t('howItWorks.calculationMethod.step3suffix')}
                  </>,
                  t('howItWorks.calculationMethod.step4'),
                  t('howItWorks.calculationMethod.step5'),
                  <>
                    {t('howItWorks.calculationMethod.step6intro')}{' '}
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {t('howItWorks.calculationMethod.step6formula')}
                    </code>
                  </>,
                  t('howItWorks.calculationMethod.step7'),
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 sm:gap-4">
                    <span className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs sm:text-sm">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 sm:pt-1 text-sm sm:text-base">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('howItWorks.workedExamples.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('howItWorks.workedExamples.subtitle')}
          </p>

          <ExampleCard
            title={t('howItWorks.examples.exampleA')}
            gross={`£30,000 ${t('howItWorks.examples.perYear')}`}
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
            t={t}
          />

          <ExampleCard
            title={t('howItWorks.examples.exampleB')}
            gross={`£60,000 ${t('howItWorks.examples.perYear')}`}
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
            t={t}
          />

          <ExampleCard
            title={t('howItWorks.examples.exampleC')}
            gross={`£150,000 ${t('howItWorks.examples.perYear')}`}
            personalAllowance={t(
              'howItWorks.examples.personalAllowanceRemoved'
            )}
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
            t={t}
          />
        </section>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold">
              {t('howItWorks.cta.title')}
            </h3>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-background text-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-background/90 transition-colors text-sm sm:text-base"
            >
              <Calculator className="h-5 w-5" />
              {t('howItWorks.cta.buttonText')}
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
