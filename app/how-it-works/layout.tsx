import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works - UK Take Home Pay Calculator',
  description:
    'Learn how we calculate your estimated take home pay based on HMRC 2025/26 tax rates.',
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
