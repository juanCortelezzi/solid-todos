import type { TodoInput } from "~/db";

export const newTodo = ({
  description,
  done,
  dependsOn,
}: {
  description: string;
  done?: boolean;
  dependsOn?: Array<number>;
}): TodoInput => ({
  description,
  done: done ?? false,
  dependsOn: dependsOn ?? [],
});

export function parseTodo(description: string) {
  const trimmed = description.trim();
  if (trimmed === "") return;
  if (!trimmed.endsWith(")")) return newTodo({ description });
  const start = trimmed.lastIndexOf("(", trimmed.length - 1);
  if (start === -1) return newTodo({ description });
  const dependsOn = trimmed
    .slice(start + 1, trimmed.length - 1)
    .split(",")
    .map((s) => {
      const t = s.trim();
      if (!t.startsWith("#")) return false;
      try {
        return parseInt(t.slice(1), 10);
      } catch {
        return false;
      }
    })
    .filter(Boolean);

  if (dependsOn.length === 0) return newTodo({ description });

  return newTodo({
    description: description.slice(0, start - 1),
    dependsOn,
  });
}
