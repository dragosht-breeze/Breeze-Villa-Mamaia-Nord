export type AiQualityStatus = "passed" | "failed";

export type AiQualityCaseResult = {
  id: string;
  group: string;
  title: string;
  status: AiQualityStatus;
  expected: string;
  actual: string;
};

export type AiQualityReport = {
  generatedAt: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  groups: Array<{
    name: string;
    total: number;
    passed: number;
    failed: number;
  }>;
  results: AiQualityCaseResult[];
};
