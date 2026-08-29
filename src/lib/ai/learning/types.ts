export type LearnedAnswer = {
  id: string;
  question: string;
  answer: string;
  aliases: string[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateLearnedAnswerInput = {
  question: string;
  answer: string;
  aliases?: string[];
};

export type UpdateLearnedAnswerInput = Partial<
  Pick<LearnedAnswer, "question" | "answer" | "aliases" | "approved">
>;
