import type { LearnedAnswer } from "@/lib/ai/learning/types";

export function buildLearnedAnswersContext(answers: LearnedAnswer[]) {
  const approved = answers.filter((item) => item.approved).slice(0, 100);
  if (!approved.length) return "";

  const entries = approved
    .map(
      (item, index) =>
        `${index + 1}. Întrebare: ${item.question}\nRăspuns aprobat: ${item.answer}`
    )
    .join("\n\n");

  return `\nRĂSPUNSURI APROBATE DE PROPRIETATE\nFolosește aceste răspunsuri ca sursă oficială. Adaptează doar formularea și limba, fără să schimbi sensul.\n${entries}\n`;
}
