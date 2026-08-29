import { promises as fs } from "node:fs";
import path from "node:path";
import { runAiQualitySuite } from "@/lib/ai/quality";
import { isWhatsAppConfigured } from "@/lib/whatsapp/service";
import type { LaunchCheck, LaunchReadinessReport } from "./types";

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function check(
  id: string,
  group: LaunchCheck["group"],
  label: string,
  status: LaunchCheck["status"],
  detail: string,
  action?: string
): LaunchCheck {
  return { id, group, label, status, detail, action };
}

function storageDirectory() {
  const configured = env("BREEZE_STORAGE_DIR");
  return configured ? path.resolve(configured) : path.join(process.cwd(), "storage");
}

async function checkStorage(): Promise<LaunchCheck[]> {
  const directory = storageDirectory();
  const configured = Boolean(env("BREEZE_STORAGE_DIR"));
  const production = process.env.NODE_ENV === "production";
  const probe = path.join(directory, `.breeze-launch-probe-${process.pid}-${Date.now()}`);

  let writable: LaunchCheck;

  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(probe, "ok", "utf8");
    await fs.unlink(probe);
    writable = check(
      "storage-writable",
      "Storage",
      "Storage inscriptibil",
      "passed",
      "Directorul de storage poate fi citit și scris de aplicație."
    );
  } catch (error) {
    writable = check(
      "storage-writable",
      "Storage",
      "Storage inscriptibil",
      "blocked",
      `Aplicația nu poate scrie în directorul configurat: ${error instanceof Error ? error.message : "eroare necunoscută"}`,
      "Configurează un director persistent și inscriptibil înainte de lansare."
    );
  }

  const persistence = check(
    "storage-persistent-config",
    "Storage",
    "Storage persistent configurat",
    configured ? "passed" : production ? "blocked" : "warning",
    configured
      ? "BREEZE_STORAGE_DIR este setat explicit."
      : production
        ? "BREEZE_STORAGE_DIR lipsește în producție; storage-ul local al aplicației poate fi efemer pe hosting."
        : "În development se folosește ./storage. La deploy trebuie setat un volum/director persistent.",
    "La hosting setează BREEZE_STORAGE_DIR către un volum persistent. Dacă hostingul nu oferă filesystem persistent, migrează store-urile JSON într-o bază de date înainte de go-live."
  );

  return [writable, persistence];
}

function securityChecks(): LaunchCheck[] {
  const secret = env("BREEZE_AUTH_SECRET");
  const adminName = env("BREEZE_ADMIN_NAME");
  const adminEmail = env("BREEZE_ADMIN_EMAIL");
  const adminPassword = env("BREEZE_ADMIN_PASSWORD");

  return [
    check(
      "auth-secret",
      "Security",
      "Secret autentificare",
      secret.length >= 32 ? "passed" : "blocked",
      secret.length >= 32
        ? "BREEZE_AUTH_SECRET este configurat și are minimum 32 de caractere."
        : "BREEZE_AUTH_SECRET lipsește sau este prea scurt.",
      "Generează un secret unic de minimum 32 de caractere."
    ),
    check(
      "admin-identity",
      "Security",
      "Cont administrator inițial",
      adminName && adminEmail ? "passed" : "blocked",
      adminName && adminEmail
        ? "Numele și e-mailul administratorului sunt configurate."
        : "BREEZE_ADMIN_NAME sau BREEZE_ADMIN_EMAIL lipsește.",
      "Configurează identitatea administratorului înainte de producție."
    ),
    check(
      "admin-password",
      "Security",
      "Parolă administrator",
      adminPassword.length >= 12 ? "passed" : "blocked",
      adminPassword.length >= 12
        ? "Parola inițială are minimum 12 caractere."
        : "BREEZE_ADMIN_PASSWORD lipsește sau are sub 12 caractere.",
      "Folosește o parolă unică de minimum 12 caractere."
    ),
  ];
}

function websiteChecks(): LaunchCheck[] {
  const siteUrl = env("NEXT_PUBLIC_SITE_URL");
  const validHttps = /^https:\/\//i.test(siteUrl);
  return [
    check(
      "site-url",
      "Website",
      "URL public HTTPS",
      validHttps ? "passed" : "blocked",
      validHttps ? `URL public configurat: ${siteUrl}` : "NEXT_PUBLIC_SITE_URL nu este un URL HTTPS valid.",
      "Setează NEXT_PUBLIC_SITE_URL la domeniul final cu https://."
    ),
  ];
}

function emailChecks(): LaunchCheck[] {
  const key = env("RESEND_API_KEY");
  const from = env("RESEND_FROM_EMAIL");
  return [
    check(
      "email-resend",
      "Email",
      "Trimitere e-mail",
      key && from ? "passed" : "warning",
      key && from
        ? "Resend este configurat pentru e-mailurile tranzacționale."
        : "Resend nu este configurat complet.",
      "Configurează RESEND_API_KEY și RESEND_FROM_EMAIL înainte de e-mailuri reale."
    ),
  ];
}

function paymentChecks(): LaunchCheck[] {
  const configured = Boolean(env("NETOPIA_API_TOKEN") && env("NETOPIA_PAYMENT_ENDPOINT") && env("NETOPIA_POS_ID"));
  return [
    check(
      "payments-netopia",
      "Payments",
      "NETOPIA production",
      configured ? "passed" : "warning",
      configured ? "NETOPIA este configurat." : "NETOPIA nu este configurat complet în acest mediu.",
      "Completează variabilele NETOPIA înainte de activarea plăților reale."
    ),
  ];
}

function aiChecks(): LaunchCheck[] {
  const apiKey = env("OPENAI_API_KEY");
  const quality = runAiQualitySuite();
  return [
    check(
      "openai-key",
      "AI",
      "OpenAI API",
      apiKey ? "passed" : "warning",
      apiKey ? "OPENAI_API_KEY este configurată." : "OPENAI_API_KEY nu este configurată în acest mediu.",
      "Configurează cheia API în mediul de producție."
    ),
    check(
      "ai-quality",
      "AI",
      "AI Quality Suite",
      quality.failed === 0 ? "passed" : "blocked",
      `${quality.passed}/${quality.total} teste trecute (${quality.passRate}%).`,
      quality.failed ? "Rezolvă testele AI eșuate înainte de lansare." : undefined
    ),
  ];
}

function automationChecks(): LaunchCheck[] {
  const cronSecret = env("GUEST_AUTOMATION_CRON_SECRET") || env("CRON_SECRET");
  const production = process.env.NODE_ENV === "production";

  return [
    check(
      "automation-cron-secret",
      "Automations",
      "Secret scheduler/cron",
      cronSecret.length >= 32 ? "passed" : production ? "blocked" : "warning",
      cronSecret.length >= 32
        ? "Schedulerul extern poate fi protejat cu Bearer token."
        : production
          ? "Secretul pentru endpointul cron lipsește sau este prea scurt."
          : "Secretul cron va fi obligatoriu la deploy; local endpointul poate fi testat fără el.",
      "Setează GUEST_AUTOMATION_CRON_SECRET cu minimum 32 de caractere și configurează același Bearer token în schedulerul hostingului."
    ),
  ];
}

function whatsappChecks(): LaunchCheck[] {
  const configured = isWhatsAppConfigured();
  const deliveryEnabled = env("GUEST_AUTOMATION_DELIVERY_ENABLED").toLowerCase() === "true";
  const templateNames = [
    "WHATSAPP_TEMPLATE_PRE_STAY",
    "WHATSAPP_TEMPLATE_CHECK_IN_DAY",
    "WHATSAPP_TEMPLATE_IN_STAY",
    "WHATSAPP_TEMPLATE_PRE_CHECKOUT",
    "WHATSAPP_TEMPLATE_POST_STAY",
  ];
  const templatesConfigured = templateNames.every((name) => Boolean(env(name)));

  return [
    check(
      "whatsapp-api",
      "WhatsApp",
      "WhatsApp Cloud API",
      configured ? "passed" : "warning",
      configured
        ? "Tokenul și Phone Number ID sunt configurate."
        : "WhatsApp production rămâne neconfigurat până la adăugarea numărului dedicat.",
      "După obținerea numărului dedicat, finalizează Production setup în Meta."
    ),
    check(
      "whatsapp-templates",
      "WhatsApp",
      "Template-uri Meta",
      templatesConfigured ? "passed" : "warning",
      templatesConfigured
        ? "Cele 5 nume de template sunt configurate în mediu."
        : "Template-urile Meta nu sunt încă configurate complet.",
      "Creează și aprobă template-urile după înregistrarea numărului WhatsApp."
    ),
    check(
      "automation-delivery-switch",
      "Automations",
      "Comutator delivery WhatsApp",
      deliveryEnabled && (!configured || !templatesConfigured) ? "blocked" : "passed",
      deliveryEnabled
        ? "Delivery este ACTIV."
        : "Delivery este OPRIT în siguranță; schedulerul poate pregăti coada fără trimitere reală.",
      deliveryEnabled && (!configured || !templatesConfigured)
        ? "Oprește delivery până când WhatsApp și template-urile sunt configurate complet."
        : undefined
    ),
  ];
}

export async function getLaunchReadinessReport(): Promise<LaunchReadinessReport> {
  const storageChecks = await checkStorage();
  const checks = [
    ...securityChecks(),
    ...storageChecks,
    ...websiteChecks(),
    ...emailChecks(),
    ...paymentChecks(),
    ...aiChecks(),
    ...automationChecks(),
    ...whatsappChecks(),
  ];

  const passed = checks.filter((item) => item.status === "passed").length;
  const warnings = checks.filter((item) => item.status === "warning").length;
  const blockers = checks.filter((item) => item.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    environment: (process.env.NODE_ENV ?? "development") as LaunchReadinessReport["environment"],
    readyForProduction: blockers === 0,
    passed,
    warnings,
    blockers,
    checks,
  };
}
