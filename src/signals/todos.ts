import { batch } from "solid-js";
import { createStore } from "solid-js/store";

class Identificator {
  static counter = 1;
  static createId() {
    return this.counter++;
  }
  static reset() {
    this.counter = 1;
  }
}

export type Todo = {
  id: number;
  description: string;
  dependsOn: Set<number>;
  done: boolean;
};

export const newTodo = ({
  description,
  done,
  dependsOn,
  noId = false,
}: {
  description: string;
  done?: boolean;
  dependsOn?: Set<number>;
  noId?: boolean;
}): Todo => ({
  id: noId ? 0 : Identificator.createId(),
  description,
  done: done ?? false,
  dependsOn: dependsOn ?? new Set(),
});

const [todos, setTodos] = createStore<Todo[]>([
  newTodo({ description: "do the laundry", done: true }),
  newTodo({ description: "make a todo app" }),
  newTodo({ description: "show todo app to santi", dependsOn: new Set([2]) }),
]);

export { todos };

export const parseTodo = (description: string, noId: boolean = false) => {
  const trimmed = description.trim();
  if (trimmed === "") return;
  if (!trimmed.endsWith(")")) return newTodo({ description, noId });
  const start = trimmed.lastIndexOf("(", trimmed.length - 1);
  if (start === -1) return newTodo({ description, noId });
  const dependsOn = new Set(
    trimmed
      .slice(start + 1, trimmed.length - 1)
      .split(",")
      .map((s) => {
        const t = s.trim();
        if (!t.startsWith("#")) return false;
        try {
          const parsed = parseInt(t.slice(1), 10);
          if (!todos.find((t) => t.id === parsed)) return false;
          return parsed;
        } catch {
          return false;
        }
      })
      .filter(Boolean)
  );

  if (dependsOn.size === 0) return newTodo({ description, noId });

  return newTodo({
    description: description.slice(0, start - 1),
    dependsOn,
    noId,
  });
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
    setTodos({}, "dependsOn", (deps) => {
      if (deps.delete(todoId)) return new Set(deps);
      return deps;
    });
    setTodos((todos) => todos.filter((t) => t.id !== todoId));
    if (todos.length === 0) Identificator.reset();
  });
};

export const updateTodo = (todoId: number, updatedTodo: Todo) => {
  updatedTodo.id = todoId;
  setTodos((t) => t.id === todoId, updatedTodo);
};

export const isMissingDependencies = (todo: Todo) => {
  for (const id of todo.dependsOn) {
    if (!todos.find((t) => t.id === id)?.done) return true;
  }
  return false;
};
