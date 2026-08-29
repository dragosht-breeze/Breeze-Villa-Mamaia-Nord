const required = [
  ["NEXT_PUBLIC_SITE_URL", (v) => /^https:\/\//i.test(v), "trebuie să înceapă cu https://"],
  ["BREEZE_AUTH_SECRET", (v) => v.length >= 32, "minimum 32 caractere"],
  ["BREEZE_ADMIN_NAME", (v) => v.length > 0, "obligatoriu"],
  ["BREEZE_ADMIN_EMAIL", (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "e-mail valid obligatoriu"],
  ["BREEZE_ADMIN_PASSWORD", (v) => v.length >= 12, "minimum 12 caractere"],
  ["BREEZE_STORAGE_DIR", (v) => v.length > 0, "obligatoriu pentru storage persistent"],
  ["GUEST_AUTOMATION_CRON_SECRET", (v) => v.length >= 32, "minimum 32 caractere"],
  ["RESEND_API_KEY", (v) => v.length > 0, "obligatoriu pentru e-mail tranzacțional"],
  ["RESEND_FROM_EMAIL", (v) => v.length > 0, "obligatoriu pentru e-mail tranzacțional"],
  ["OPENAI_API_KEY", (v) => v.length > 0, "obligatoriu pentru AI"],
];

const failures = [];
for (const [name, validate, reason] of required) {
  const value = (process.env[name] ?? "").trim();
  if (!validate(value)) failures.push(`${name}: ${reason}`);
}

const delivery = (process.env.GUEST_AUTOMATION_DELIVERY_ENABLED ?? "").trim().toLowerCase() === "true";
if (delivery) {
  const whatsappRequired = [
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_TEMPLATE_PRE_STAY",
    "WHATSAPP_TEMPLATE_CHECK_IN_DAY",
    "WHATSAPP_TEMPLATE_IN_STAY",
    "WHATSAPP_TEMPLATE_PRE_CHECKOUT",
    "WHATSAPP_TEMPLATE_POST_STAY",
  ];
  for (const name of whatsappRequired) {
    if (!(process.env[name] ?? "").trim()) {
      failures.push(`${name}: obligatoriu când GUEST_AUTOMATION_DELIVERY_ENABLED=true`);
    }
  }
}

if (failures.length) {
  console.error("\nRC14.2 PRODUCTION CHECK: FAILED\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nNu porni producția până când verificările de mai sus sunt rezolvate.\n");
  process.exit(1);
}

console.log("RC14.2 PRODUCTION CHECK: OK");
console.log("Configurația minimă de producție este prezentă.");
