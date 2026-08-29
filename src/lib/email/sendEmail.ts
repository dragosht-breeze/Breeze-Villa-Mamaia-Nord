import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Breeze Villa <onboarding@resend.dev>";

export async function sendEmail(input: {
  to?: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string;
  }[];
}) {
  if (!input.to) {
    logger.warning("Email omis: destinatarul lipsește.");
    return { skipped: true as const, reason: "missing_recipient" as const };
  }

  if (!resendApiKey) {
    logger.warning("Email omis: RESEND_API_KEY nu este configurat.", {
      attachmentCount: input.attachments?.length ?? 0,
    });
    return { skipped: true as const, reason: "missing_api_key" as const };
  }

  try {
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });

    logger.info("Email trimis prin Resend.", {
      messageId: result.data?.id,
      attachmentCount: input.attachments?.length ?? 0,
    });

    return result;
  } catch (error) {
    logger.error("Trimiterea e-mailului a eșuat.", {
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return { error };
  }
}
