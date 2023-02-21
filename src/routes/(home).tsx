import { Component, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { CheckCircleIcon, MinusCircleIcon } from "~/components/Icons";

class Identificator {
  static counter = 0;
  static createId() {
    return this.counter++;
  }
}

type Todo = {
  id: number;
  description: string;
  dependsOn: number[];
  done: boolean;
};

function newTodo({
  description,
  done,
  dependsOn,
}: {
  description: string;
  done?: boolean;
  dependsOn?: number[];
}): Todo {
  return {
    id: Identificator.createId(),
    description,
    done: done ?? false,
    dependsOn: dependsOn ?? [],
  };
}

function parseTodo(description: string) {
  const trimmed = description.trim();
  if (trimmed === "") return;
  if (!trimmed.endsWith(")")) return newTodo({ description });
  const start = trimmed.lastIndexOf("(", trimmed.length - 1);
  if (start === -1) return newTodo({ description });
  const dependsOn = trimmed
    .slice(start + 1, trimmed.length - 1)
    .split(",")
    .map((s) => {
      console.log(s);
      if (!s.startsWith("#")) return false;
      let parsed: number;
      try {
        parsed = parseInt(s.slice(1), 10);
      } catch {
        return false;
      }
      if (store.todos.length <= parsed) return false;
      return parsed;
    })
    .filter(Boolean) as number[]; // TS is shit;

  if (dependsOn.length === 0) return newTodo({ description });

  return newTodo({ description: description.slice(0, start - 1), dependsOn });
}

const [store, setStore] = createStore<{
  description: string;
  todos: Todo[];
}>({
  description: "",
  todos: [
    newTodo({ description: "do the laundry", done: true }),
    newTodo({ description: "make a todo app" }),
    newTodo({ description: "show todo app to santi", dependsOn: [1] }),
  ],
});

export default function Home() {
  return (
    <main class="mx-auto my-4 lg:container">
      <h1 class="text-center text-4xl font-bold text-blue-500">
        Todos, once again!
      </h1>
      <div class="my-4" />
      <div class="mx-auto flex max-w-xl flex-col items-center justify-center">
        <form
          class="w-full"
          onSubmit={(e) => {
            e.preventDefault();

            const description = store.description;
            setStore("description", "");

            if (description.trim() === "") return;

            const todo = parseTodo(description);
            if (!todo) return;

            setStore("todos", (t) => [...t, todo]);
          }}
        >
          <div>
            <input
              class="form-input w-full rounded border border-blue-500 p-2"
              placeholder="description.."
              onInput={(e) => setStore("description", e.currentTarget.value)}
              value={store.description}
            />
            <button type="button">toggle clean mode</button>
          </div>
        </form>
        <div class="my-4" />
        <div class="w-full">
          <For each={store.todos}>{(todo) => <TodoItem todo={todo} />}</For>
        </div>
      </div>
    </main>
  );
}

const TodoItem: Component<{ todo: Todo }> = (props) => {
  return (
    <div class="my-2 flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (!props.todo.done) {
            for (const id of props.todo.dependsOn) {
              if (!store.todos[id].done) return;
            }
          }
          setStore("todos", props.todo.id, (t) => ({
            ...t,
            done: !t.done,
          }));
        }}
      >
        {props.todo.done ? (
          <CheckCircleIcon class="h-6 w-6 text-blue-500" />
        ) : (
          <MinusCircleIcon class="h-6 w-6" />
        )}
      </button>
      <p
        classList={{
          "opacity-70": props.todo.done,
        }}
      >
        #{props.todo.id}
      </p>
      <p
        classList={{
          "line-through opacity-70": props.todo.done,
        }}
      >
        {props.todo.description}
      </p>
      <Show when={props.todo.dependsOn.length > 0}>
        <p>| ({props.todo.dependsOn.map((n) => `#${n}`).join(", ")})</p>
      </Show>
    </div>
  );
};
