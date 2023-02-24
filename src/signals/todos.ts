import { batch } from "solid-js";
import { createStore } from "solid-js/store";

class Identificator {
  static counter = 1;
  static createId() {
    return this.counter++;
  }
}

export type Todo = {
  id: number;
  description: string;
  dependsOn: number[];
  done: boolean;
};

export const newTodo = ({
  description,
  done,
  dependsOn,
}: {
  description: string;
  done?: boolean;
  dependsOn?: number[];
}): Todo => ({
  id: Identificator.createId(),
  description,
  done: done ?? false,
  dependsOn: dependsOn ?? [],
});

const [todos, setTodos] = createStore<Todo[]>([
  newTodo({ description: "do the laundry", done: true }),
  newTodo({ description: "make a todo app" }),
  newTodo({ description: "show todo app to santi", dependsOn: [2] }),
]);

export { todos };

export const parseTodo = (description: string) => {
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
        const parsed = parseInt(t.slice(1), 10);
        console.log(`'${t}': '${parsed}'`);
        if (!todos.find((t) => t.id === parsed)) return false;
        return parsed;
      } catch {
        return false;
      }
    })
    .filter(Boolean) as number[]; // TS is shit;

  console.log(dependsOn);

  if (dependsOn.length === 0) return newTodo({ description });

  return newTodo({ description: description.slice(0, start - 1), dependsOn });
};

export const addTodo = (todo: Todo) => setTodos((t) => [...t, todo]);

export const toggleTodo = (todoId: number) =>
  setTodos(
    (t) => t.id === todoId,
    "done",
    (done) => !done
  );

export const deleteTodo = (todoId: number) => {
  batch(() => {
    setTodos({}, "dependsOn", (deps) => deps.filter((id) => id !== todoId));
    setTodos((todos) => todos.filter((t) => t.id !== todoId));
  });
};

export const isMissingDependencies = (todo: Todo) => {
  for (const id of todo.dependsOn) {
    if (!todos.find((t) => t.id === id)?.done) return true;
  }
  return false;
};
