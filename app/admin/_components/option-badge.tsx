import { AnswerOption } from "../_types";

const optionColors: Record<AnswerOption, string> = {
  [AnswerOption.A]: "bg-violet-100 text-violet-700",
  [AnswerOption.B]: "bg-sky-100 text-sky-700",
  [AnswerOption.C]: "bg-amber-100 text-amber-700",
  [AnswerOption.D]: "bg-rose-100 text-rose-700",
};

type OptionBadgeProps = {
  option: AnswerOption;
  isCorrect?: boolean;
};

export function OptionBadge({ option, isCorrect }: OptionBadgeProps) {
  return (
    <span
      className={[
        "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
        isCorrect
          ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300"
          : optionColors[option],
      ].join(" ")}
    >
      {option}
    </span>
  );
}
