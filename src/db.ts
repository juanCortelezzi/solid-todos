import { z } from "zod";

class Identifier {
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

export type TodoReturn = {
  id: number;
  description: string;
  done: boolean;
  dependsOn: number[];
  isMissingDeps: boolean;
};

const todos = new Map<number, Todo>();

export type TodoInput = z.input<typeof todoInputSchema>;
const todoInputSchema = z.object({
  description: z.string().min(1).max(80),
  dependsOn: z.number().nonnegative().finite().array(),
  done: z.boolean(),
});

export const getTodoFn = (id: number) => {
  const todo = todos.get(id);
  if (!todo) return;
  return {
    id: todo.id,
    description: todo.description,
    dependsOn: [...todo.dependsOn],
    done: todo.done,
    isMissingDeps: isMissingDepsFn(todo.dependsOn),
  };
};

export const getTodosFn = () =>
  [...todos.values()].map((todo) => ({
    id: todo.id,
    description: todo.description,
    dependsOn: [...todo.dependsOn],
    done: todo.done,
    isMissingDeps: isMissingDepsFn(todo.dependsOn),
  }));

export function postTodoFn(rawTodo: z.input<typeof todoInputSchema>) {
  const todoResult = todoInputSchema.safeParse(rawTodo);
  if (!todoResult.success) {
    return todoResult.error;
  }

  const todo = todoResult.data;
  const id = Identifier.createId();
  todos.set(id, {
    id,
    description: todo.description,
    dependsOn: new Set(todo.dependsOn.filter((id) => todos.has(id))),
    done: todo.done,
  });
}

export function updateTodoFn(
  id: number,
  rawUpdatedTodo: z.input<typeof todoInputSchema>
) {
  if (!todos.has(id)) return;

  const updatedTodoResult = todoInputSchema.safeParse(rawUpdatedTodo);
  if (!updatedTodoResult.success) return;

  const updatedTodo = updatedTodoResult.data;

  todos.set(id, {
    id,
    description: updatedTodo.description,
    dependsOn: new Set(updatedTodo.dependsOn.filter((id) => todos.has(id))),
    done: updatedTodo.done,
  });
}

export function toggleTodoFn(id: number) {
  const todo = todos.get(id);
  if (todo) todo.done = !todo.done;
}

function isMissingDepsFn(deps: Set<number>) {
  for (const id of deps) {
    if (!todos.get(id)?.done) return true;
  }
  return false;
}

export function deleteTodoFn(id: number) {
  if (!todos.delete(id)) return;
  for (const todo of todos.values()) {
    todo.dependsOn.delete(id);
  }
}
