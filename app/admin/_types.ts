export enum PostTestPeriod {
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
}
 
export enum AnswerOption {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
}
 
export type PostTestQuestion = {
  id: string;
  period: PostTestPeriod;
  body: string;
  options: [string, string, string, string]; // [A, B, C, D]
  correctOption: AnswerOption;
  sortOrder: number;
};
