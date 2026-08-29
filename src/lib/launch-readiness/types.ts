export type LaunchCheckStatus = "passed" | "warning" | "blocked";

export type LaunchCheck = {
  id: string;
  group: "Security" | "Storage" | "Website" | "Email" | "Payments" | "AI" | "WhatsApp" | "Automations";
  label: string;
  status: LaunchCheckStatus;
  detail: string;
  action?: string;
};

export type LaunchReadinessReport = {
  generatedAt: string;
  environment: "development" | "production" | "test";
  readyForProduction: boolean;
  passed: number;
  warnings: number;
  blockers: number;
  checks: LaunchCheck[];
};
