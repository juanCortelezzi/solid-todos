import { Component, createSignal, For, Show } from "solid-js";
import {
  CheckCircleIcon,
  EllipsisCircleIcon,
  PencilIcon,
  TrashIcon,
} from "~/components/Icons";
import {
  addTodo,
  deleteTodo,
  isMissingDependencies,
  parseTodo,
  Todo,
  todos,
  toggleTodo,
} from "~/signals/todos";
import { createToggle } from "~/signals/toggle";

export default function Home() {
  const [description, setDescription] = createSignal("");
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

            const desc = description();
            setDescription("");

            const todo = parseTodo(desc);
            if (todo) addTodo(todo);
          }}
        >
          <input
            class="form-input w-full rounded border p-2"
            placeholder="description.."
            onInput={(e) => setDescription(e.currentTarget.value)}
            value={description()}
          />
        </form>
        <div class="my-4" />
        <div class="flex w-full flex-col gap-2">
          <For each={todos} fallback="No todos, lets create some!">
            {(todo) => <TodoItem todo={todo} />}
          </For>
        </div>
      </div>
    </main>
  );
}

const TodoItem: Component<{ todo: Todo }> = (props) => {
  const editMode = createToggle(false);
  return (
    <div class="flex items-center justify-between rounded px-1 shadow">
      <div class="my-2 flex items-center gap-2">
        <button
          type="button"
          disabled={isMissingDependencies(props.todo) && !props.todo.done}
          class="disabled:pointer-events-none disabled:cursor-pointer disabled:opacity-50"
          onClick={() => toggleTodo(props.todo.id)}
        >
          <Show
            when={props.todo.done}
            fallback={<EllipsisCircleIcon class="h-6 w-6" />}
          >
            <CheckCircleIcon class="h-6 w-6 text-blue-500" />
          </Show>
        </button>
        <p classList={{ "opacity-70": props.todo.done }}>#{props.todo.id}</p>
        <p classList={{ "line-through opacity-70": props.todo.done }}>
          {props.todo.description}
        </p>
        <Show when={props.todo.dependsOn.length > 0}>
          <p>| ({props.todo.dependsOn.map((n) => `#${n}`).join(", ")})</p>
        </Show>
      </div>
      <div class="flex items-center justify-center">
        <button
          onClick={editMode.toggle}
          class="rounded p-2"
          classList={{
            "bg-blue-300": editMode.isOn(),
            "hover:text-blue-500": !editMode.isOn(),
          }}
        >
          <PencilIcon class="h-5 w-5" />
        </button>
        <button
          onClick={() => deleteTodo(props.todo.id)}
          class="rounded p-2 hover:bg-red-300"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
