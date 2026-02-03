import { describe, it, expect } from 'vitest';
import {
  estimateTakeHome,
  estimateGrossFromNet,
  TakeHomeInput,
  NetToGrossInput,
  TakeHomeResult,
} from './takeHome';

describe('estimateTakeHome', () => {
  // Helper to compare numbers with tolerance for floating point
  const expectClose = (actual: number, expected: number, tolerance = 0.01) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };

  describe('Basic income tax calculation (ruk)', () => {
    it('should return no tax for income below personal allowance', () => {
      const result = estimateTakeHome({
        gross: 12000,
        period: 'year',
      });

      expect(result.annual.gross).toBe(12000);
      expect(result.annual.personalAllowance).toBe(12570);
      expect(result.annual.taxableIncome).toBe(0);
      expect(result.annual.incomeTax).toBe(0);
      expect(result.annual.takeHome).toBe(12000); // Only NI deducted, but below threshold
    });

    it('should calculate basic rate tax correctly for £30,000 annual income', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
      });

      // Taxable: 30000 - 12570 = 17430
      // Tax: 17430 * 0.20 = 3486
      // NI: (30000 - 12570) * 0.08 = 1394.40
      // Take home: 30000 - 3486 - 1394.40 = 25119.60

      expect(result.annual.gross).toBe(30000);
      expect(result.annual.personalAllowance).toBe(12570);
      expect(result.annual.taxableIncome).toBe(17430);
      expect(result.annual.incomeTax).toBe(3486);
      expectClose(result.annual.nationalInsurance, 1394.4);
      expectClose(result.annual.takeHome, 25119.6);
    });

    it('should calculate higher rate tax correctly for £60,000 annual income', () => {
      const result = estimateTakeHome({
        gross: 60000,
        period: 'year',
      });

      // Taxable: 60000 - 12570 = 47430
      // Basic rate (0-37700): 37700 * 0.20 = 7540
      // Higher rate (37700-47430): 9730 * 0.40 = 3892
      // Total tax: 7540 + 3892 = 11432
      // NI: (50270 - 12570) * 0.08 + (60000 - 50270) * 0.02
      //   = 37700 * 0.08 + 9730 * 0.02
      //   = 3016 + 194.60 = 3210.60
      // Take home: 60000 - 11432 - 3210.60 = 45357.40

      expect(result.annual.gross).toBe(60000);
      expect(result.annual.taxableIncome).toBe(47430);
      expect(result.annual.incomeTax).toBe(11432);
      expectClose(result.annual.nationalInsurance, 3210.6);
      expectClose(result.annual.takeHome, 45357.4);
    });

    it('should calculate additional rate tax correctly for £150,000 annual income', () => {
      const result = estimateTakeHome({
        gross: 150000,
        period: 'year',
      });

      // At £150,000, personal allowance is tapered to 0 (income > £125,140)
      // Taxable: 150000 - 0 = 150000
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate (37700-125140): 87440 * 0.40 = 34976
      // Additional rate (125140+): 24860 * 0.45 = 11187
      // Total tax: 7540 + 34976 + 11187 = 53703
      // NI: 37700 * 0.08 + (150000 - 50270) * 0.02
      //   = 3016 + 99730 * 0.02 = 3016 + 1994.60 = 5010.60

      expect(result.annual.personalAllowance).toBe(0);
      expect(result.annual.taxableIncome).toBe(150000);
      expect(result.annual.incomeTax).toBe(53703);
      expectClose(result.annual.nationalInsurance, 5010.6);
    });
  });

  describe('Personal Allowance taper', () => {
    it('should not taper personal allowance at £100,000', () => {
      const result = estimateTakeHome({
        gross: 100000,
        period: 'year',
      });

      expect(result.annual.personalAllowance).toBe(12570);
    });

    it('should taper personal allowance at £110,000', () => {
      const result = estimateTakeHome({
        gross: 110000,
        period: 'year',
      });

      // Reduction: (110000 - 100000) / 2 = 5000
      // Tapered allowance: 12570 - 5000 = 7570
      expect(result.annual.personalAllowance).toBe(7570);
    });

    it('should reduce personal allowance to zero at £125,140', () => {
      const result = estimateTakeHome({
        gross: 125140,
        period: 'year',
      });

      // Reduction: (125140 - 100000) / 2 = 12570
      // Tapered allowance: 12570 - 12570 = 0
      expect(result.annual.personalAllowance).toBe(0);
    });

    it('should have zero personal allowance above £125,140', () => {
      const result = estimateTakeHome({
        gross: 200000,
        period: 'year',
      });

      expect(result.annual.personalAllowance).toBe(0);
    });
  });

  describe('Scotland tax bands', () => {
    it('should apply Scottish rates for £30,000 income', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        jurisdiction: 'scotland',
      });

      // Taxable: 30000 - 12570 = 17430
      // Starter (0-2827): 2827 * 0.19 = 537.13
      // Basic (2827-14921): 12094 * 0.20 = 2418.80
      // Intermediate (14921-17430): 2509 * 0.21 = 526.89
      // Total: 537.13 + 2418.80 + 526.89 = 3482.82

      expect(result.meta.jurisdiction).toBe('scotland');
      expect(result.annual.taxableIncome).toBe(17430);
      expectClose(result.annual.incomeTax, 3482.82, 0.1);
    });

    it('should apply all Scottish bands for £130,000 income', () => {
      const result = estimateTakeHome({
        gross: 130000,
        period: 'year',
        jurisdiction: 'scotland',
      });

      // PA tapered to 0 (income > 125,140)
      // Taxable: 130000
      // Starter (0-2827): 2827 * 0.19 = 537.13
      // Basic (2827-14921): 12094 * 0.20 = 2418.80
      // Intermediate (14921-31092): 16171 * 0.21 = 3395.91
      // Higher (31092-62430): 31338 * 0.42 = 13161.96
      // Advanced (62430-125140): 62710 * 0.45 = 28219.50
      // Top (125140+): 4860 * 0.48 = 2332.80
      // Total: 50066.10

      expect(result.annual.personalAllowance).toBe(0);
      expectClose(result.annual.incomeTax, 50066.1, 1);
    });
  });

  describe('National Insurance categories', () => {
    it('should calculate NI for category A (standard)', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
        niCategory: 'A',
      });

      // NI: (50000 - 12570) * 0.08 = 37430 * 0.08 = 2994.40
      expectClose(result.annual.nationalInsurance, 2994.4);
    });

    it('should calculate zero NI for category C (state pension age)', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
        niCategory: 'C',
      });

      expect(result.annual.nationalInsurance).toBe(0);
    });

    it('should calculate reduced NI for category B', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
        niCategory: 'B',
      });

      // NI: (50000 - 12570) * 0.0185 = 37430 * 0.0185 = 692.46
      expectClose(result.annual.nationalInsurance, 692.46, 0.1);
    });

    it('should calculate NI with upper rate above UEL', () => {
      const result = estimateTakeHome({
        gross: 70000,
        period: 'year',
        niCategory: 'A',
      });

      // Main: (50270 - 12570) * 0.08 = 37700 * 0.08 = 3016
      // Upper: (70000 - 50270) * 0.02 = 19730 * 0.02 = 394.60
      // Total: 3410.60
      expectClose(result.annual.nationalInsurance, 3410.6);
    });
  });

  describe('Tax codes', () => {
    it('should use default 1257L if no tax code provided', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
      });

      expect(result.annual.personalAllowance).toBe(12570);
    });

    it('should parse standard tax code 1257L', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: '1257L',
      });

      expect(result.meta.taxCodeUsed).toBe('1257L');
      expect(result.annual.personalAllowance).toBe(12570);
    });

    it('should parse custom allowance code 1500L', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: '1500L',
      });

      expect(result.annual.personalAllowance).toBe(15000);
    });

    it('should apply flat rate BR (20%)', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'BR',
      });

      // All income taxed at 20% - no personal allowance
      expect(result.annual.incomeTax).toBe(6000);
      expect(result.annual.incomeTaxBreakdown[0].rate).toBe(0.2);
    });

    it('should apply flat rate D0 (40%)', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'D0',
      });

      expect(result.annual.incomeTax).toBe(12000);
    });

    it('should apply flat rate D1 (45%)', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'D1',
      });

      expect(result.annual.incomeTax).toBe(13500);
    });

    it('should apply zero allowance for 0T code', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: '0T',
      });

      expect(result.annual.personalAllowance).toBe(0);
      expect(result.annual.taxableIncome).toBe(30000);
    });

    it('should apply NT (no tax) code', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'NT',
      });

      expect(result.annual.incomeTax).toBe(0);
    });

    it('should detect Scotland from S prefix in tax code', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'S1257L',
      });

      expect(result.meta.jurisdiction).toBe('scotland');
      expect(result.meta.taxCodeUsed).toBe('S1257L');
    });

    it('should handle K code (negative allowance)', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
        taxCode: 'K100',
      });

      // K100 means -1000 allowance, so taxable = 30000 + 1000 = 31000
      expect(result.annual.taxableIncome).toBe(31000);
    });
  });

  describe('Period conversions', () => {
    it('should annualise monthly income correctly', () => {
      const result = estimateTakeHome({
        gross: 2500,
        period: 'month',
      });

      expect(result.annual.gross).toBe(30000);
    });

    it('should annualise weekly income correctly', () => {
      const result = estimateTakeHome({
        gross: 576.92,
        period: 'week',
      });

      expectClose(result.annual.gross, 29999.84, 1);
    });

    it('should annualise daily income with default 260 days', () => {
      const result = estimateTakeHome({
        gross: 115.38,
        period: 'day',
      });

      expectClose(result.annual.gross, 29998.8, 1);
    });

    it('should annualise daily income with custom days per year', () => {
      const result = estimateTakeHome({
        gross: 100,
        period: 'day',
        daysPerYear: 365,
      });

      expect(result.annual.gross).toBe(36500);
    });

    it('should return correct per-period values', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
      });

      // Annual tax: 3486, NI: 1394.40, Take home: 25119.60
      expectClose(result.perPeriod.incomeTax, 3486);
      expectClose(result.perPeriod.nationalInsurance, 1394.4);
      expectClose(result.perPeriod.takeHome, 25119.6);
    });

    it('should calculate monthly breakdown correctly', () => {
      const result = estimateTakeHome({
        gross: 2500,
        period: 'month',
      });

      expect(result.perPeriod.period).toBe('month');
      expect(result.perPeriod.gross).toBe(2500);
      expectClose(result.perPeriod.incomeTax, 290.5); // 3486 / 12
      expectClose(result.perPeriod.nationalInsurance, 116.2); // 1394.40 / 12
    });
  });

  describe('Income tax breakdown', () => {
    it('should provide breakdown for basic rate only', () => {
      const result = estimateTakeHome({
        gross: 30000,
        period: 'year',
      });

      expect(result.annual.incomeTaxBreakdown).toHaveLength(1);
      expect(result.annual.incomeTaxBreakdown[0].bandName).toBe('basic');
      expect(result.annual.incomeTaxBreakdown[0].rate).toBe(0.2);
    });

    it('should provide breakdown for multiple bands', () => {
      const result = estimateTakeHome({
        gross: 60000,
        period: 'year',
      });

      expect(result.annual.incomeTaxBreakdown).toHaveLength(2);
      expect(result.annual.incomeTaxBreakdown[0].bandName).toBe('basic');
      expect(result.annual.incomeTaxBreakdown[1].bandName).toBe('higher');
    });

    it('should provide breakdown for all bands at high income', () => {
      const result = estimateTakeHome({
        gross: 200000,
        period: 'year',
      });

      expect(result.annual.incomeTaxBreakdown).toHaveLength(3);
      expect(result.annual.incomeTaxBreakdown[2].bandName).toBe('additional');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero income', () => {
      const result = estimateTakeHome({
        gross: 0,
        period: 'year',
      });

      expect(result.annual.gross).toBe(0);
      expect(result.annual.incomeTax).toBe(0);
      expect(result.annual.nationalInsurance).toBe(0);
      expect(result.annual.takeHome).toBe(0);
    });

    it('should handle income exactly at personal allowance', () => {
      const result = estimateTakeHome({
        gross: 12570,
        period: 'year',
      });

      expect(result.annual.taxableIncome).toBe(0);
      expect(result.annual.incomeTax).toBe(0);
      expect(result.annual.nationalInsurance).toBe(0); // Below NI threshold
    });

    it('should handle income exactly at UEL', () => {
      const result = estimateTakeHome({
        gross: 50270,
        period: 'year',
      });

      // All NI at main rate, none at upper
      const mainNI = (50270 - 12570) * 0.08;
      expectClose(result.annual.nationalInsurance, mainNI);
    });

    it('should handle very high income', () => {
      const result = estimateTakeHome({
        gross: 1000000,
        period: 'year',
      });

      expect(result.annual.personalAllowance).toBe(0);
      expect(result.annual.takeHome).toBeGreaterThan(0);
      expect(result.annual.takeHome).toBeLessThan(result.annual.gross);
    });
  });

  describe('Meta information', () => {
    it('should include correct meta information', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
        jurisdiction: 'scotland',
        niCategory: 'M',
      });

      expect(result.meta.jurisdiction).toBe('scotland');
      expect(result.meta.niCategory).toBe('M');
      expect(result.meta.calculationTaxYear).toBe('2025/26');
    });

    it('should default to ruk jurisdiction', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
      });

      expect(result.meta.jurisdiction).toBe('ruk');
    });

    it('should default to category A', () => {
      const result = estimateTakeHome({
        gross: 50000,
        period: 'year',
      });

      expect(result.meta.niCategory).toBe('A');
    });
  });
});

describe('estimateGrossFromNet', () => {
  // Helper to compare numbers with tolerance for floating point
  const expectClose = (actual: number, expected: number, tolerance = 1) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };

  describe('Basic net to gross calculation', () => {
    it('should return zero gross for zero net', () => {
      const result = estimateGrossFromNet({
        net: 0,
        period: 'year',
      });

      expect(result.annual.gross).toBe(0);
      expect(result.annual.takeHome).toBe(0);
    });

    it('should find correct gross for £25,119.60 net (known from gross £30,000)', () => {
      // From estimateTakeHome test: £30,000 gross = £25,119.60 net
      const result = estimateGrossFromNet({
        net: 25119.6,
        period: 'year',
      });

      expectClose(result.annual.gross, 30000, 1);
      expectClose(result.annual.takeHome, 25119.6, 1);
    });

    it('should find correct gross for £45,357.40 net (known from gross £60,000)', () => {
      // From estimateTakeHome test: £60,000 gross = £45,357.40 net
      const result = estimateGrossFromNet({
        net: 45357.4,
        period: 'year',
      });

      expectClose(result.annual.gross, 60000, 1);
      expectClose(result.annual.takeHome, 45357.4, 1);
    });

    it('should handle income below personal allowance threshold', () => {
      const result = estimateGrossFromNet({
        net: 12000,
        period: 'year',
      });

      // Below threshold, net equals gross (no tax, no NI)
      expect(result.annual.gross).toBe(12000);
      expect(result.annual.takeHome).toBe(12000);
      expect(result.annual.incomeTax).toBe(0);
    });
  });

  describe('Roundtrip consistency', () => {
    it('should be consistent with estimateTakeHome for basic rate income', () => {
      const grossOriginal = 35000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });

    it('should be consistent with estimateTakeHome for higher rate income', () => {
      const grossOriginal = 75000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });

    it('should be consistent with estimateTakeHome for additional rate income', () => {
      const grossOriginal = 150000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });
  });

  describe('Scotland jurisdiction', () => {
    it('should handle Scottish tax rates for net to gross', () => {
      const grossOriginal = 50000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
        jurisdiction: 'scotland',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
        jurisdiction: 'scotland',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
      expect(reverseResult.meta.jurisdiction).toBe('scotland');
    });
  });

  describe('Different NI categories', () => {
    it('should handle category C (no NI) for net to gross', () => {
      const grossOriginal = 40000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
        niCategory: 'C',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
        niCategory: 'C',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
      expect(reverseResult.meta.niCategory).toBe('C');
    });
  });

  describe('Tax codes', () => {
    it('should handle BR tax code for net to gross', () => {
      const grossOriginal = 25000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
        taxCode: 'BR',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
        taxCode: 'BR',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });

    it('should handle NT tax code for net to gross', () => {
      const grossOriginal = 30000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
        taxCode: 'NT',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
        taxCode: 'NT',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });

    it('should detect Scotland from S prefix in tax code', () => {
      const result = estimateGrossFromNet({
        net: 30000,
        period: 'year',
        taxCode: 'S1257L',
      });

      expect(result.meta.jurisdiction).toBe('scotland');
      expect(result.meta.taxCodeUsed).toBe('S1257L');
    });
  });

  describe('Period conversions', () => {
    it('should handle monthly net input', () => {
      const grossOriginal = 36000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const monthlyNet = forwardResult.annual.takeHome / 12;

      const reverseResult = estimateGrossFromNet({
        net: monthlyNet,
        period: 'month',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
      expect(reverseResult.perPeriod.period).toBe('month');
    });

    it('should handle weekly net input', () => {
      const grossOriginal = 52000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const weeklyNet = forwardResult.annual.takeHome / 52;

      const reverseResult = estimateGrossFromNet({
        net: weeklyNet,
        period: 'week',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
      expect(reverseResult.perPeriod.period).toBe('week');
    });
  });

  describe('Edge cases', () => {
    it('should handle very high net income', () => {
      const grossOriginal = 500000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 5);
    });

    it('should handle income at personal allowance boundary', () => {
      const grossOriginal = 12570;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });

    it('should handle income at taper threshold (£100,000)', () => {
      const grossOriginal = 100000;
      const forwardResult = estimateTakeHome({
        gross: grossOriginal,
        period: 'year',
      });

      const reverseResult = estimateGrossFromNet({
        net: forwardResult.annual.takeHome,
        period: 'year',
      });

      expectClose(reverseResult.annual.gross, grossOriginal, 1);
    });
  });

  describe('Meta information', () => {
    it('should include correct meta information', () => {
      const result = estimateGrossFromNet({
        net: 35000,
        period: 'year',
        jurisdiction: 'scotland',
        niCategory: 'M',
      });

      expect(result.meta.jurisdiction).toBe('scotland');
      expect(result.meta.niCategory).toBe('M');
      expect(result.meta.calculationTaxYear).toBe('2025/26');
    });

    it('should default to ruk jurisdiction', () => {
      const result = estimateGrossFromNet({
        net: 35000,
        period: 'year',
      });

      expect(result.meta.jurisdiction).toBe('ruk');
    });

    it('should default to category A', () => {
      const result = estimateGrossFromNet({
        net: 35000,
        period: 'year',
      });

      expect(result.meta.niCategory).toBe('A');
    });
  });
});
