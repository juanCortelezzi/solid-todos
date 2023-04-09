import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import {
  CheckCircleIcon,
  EllipsisCircleIcon,
  PaperPlaneIcon,
  PencilIcon,
  TrashIcon,
} from "~/components/Icons";
import {
  deleteTodoFn,
  getTodosFn,
  postTodoFn,
  TodoInput,
  TodoReturn,
  toggleTodoFn,
  updateTodoFn,
} from "~/db";
import { stringToTodo } from "~/signals/todos";
import { createToggle } from "~/signals/toggle";

export const routeData = () => {
  return createServerData$(getTodosFn, { initialValue: [] });
};

export default function Home() {
  const [description, setDescription] = createSignal("");
  const todos = useRouteData<typeof routeData>();
  const [posting, postMutation] = createServerAction$(async (todo: TodoInput) =>
    postTodoFn(todo)
  );

  createEffect(() => console.log(todos()));

  return (
    <main class="mx-auto my-4 lg:container">
      <h1 class="text-center text-4xl font-bold text-blue-500">
        Todos, once again!
      </h1>
      <div class="my-4" />
      <div class="mx-auto flex max-w-xl flex-col items-center justify-center">
        <form
          class="flex w-full gap-1"
          onSubmit={(e) => {
            e.preventDefault();

            const desc = description();
            setDescription("");

            const todo = stringToTodo(desc);
            console.log("this is the todo:", todo);
            if (todo) postMutation(todo);
          }}
        >
          <input
            class="form-input w-full rounded border p-2"
            placeholder="description.."
            onInput={(e) => setDescription(e.currentTarget.value)}
            value={description()}
          />
          <button class="form-input rounded border p-2 text-blue-500 hover:bg-blue-300 hover:text-inherit">
            <PaperPlaneIcon
              class="h-6 w-6"
              classList={{ "animate-spin": posting.pending }}
            />
          </button>
        </form>
        <div class="my-4" />
        <div class="flex w-full flex-col gap-2">
          <For each={todos()} fallback="No todos, lets create some!">
            {(todo) => <TodoItem todo={todo} />}
          </For>
        </div>
      </div>
    </main>
  );
}

const depString = (deps: Array<number>) =>
  `(${deps.map((n) => `#${n}`).join(", ")})`;

const TodoItem: Component<{ todo: TodoReturn }> = (props) => {
  const editMode = createToggle(false);

  const [description, setDescription] = createSignal(
    props.todo.dependsOn.length > 0
      ? props.todo.description +
          " " +
          depString([...props.todo.dependsOn.values()])
      : props.todo.description
  );

  const [_deleting, deleteMutation] = createServerAction$(async (id: number) =>
    deleteTodoFn(id)
  );

  const [_updating, updateMutation] = createServerAction$(
    async ({ id, todo }: { id: number; todo: TodoInput }) =>
      updateTodoFn(id, todo)
  );

  const [_toggling, toggleMutation] = createServerAction$(async (id: number) =>
    toggleTodoFn(id)
  );

  return (
    <div class="flex items-center justify-between rounded px-1 shadow">
      <div class="my-2 flex items-center gap-2">
        <button
          type="button"
          disabled={
            (props.todo.isMissingDeps && !props.todo.done) || editMode.isOn()
          }
          class="disabled:pointer-events-none disabled:cursor-pointer disabled:opacity-50"
          onClick={() => toggleMutation(props.todo.id)}
        >
          <Show
            when={props.todo.done}
            fallback={<EllipsisCircleIcon class="h-6 w-6" />}
          >
            <CheckCircleIcon class="h-6 w-6 text-blue-500" />
          </Show>
        </button>
        <p classList={{ "opacity-70": props.todo.done && !editMode.isOn() }}>
          #{props.todo.id}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const desc = description();

            const todo = stringToTodo(desc);
            if (!todo) return;

            setDescription(
              todo.dependsOn.length > 0
                ? todo.description + " " + depString(todo.dependsOn)
                : todo.description
            );

            updateMutation({ id: props.todo.id, todo });
            editMode.turnOff();
          }}
        >
          <Show
            when={!editMode.isOn()}
            fallback={
              <input
                onInput={(e) => setDescription(e.currentTarget.value)}
                value={description()}
                class="border-b border-slate-400"
              />
            }
          >
            <p
              class="truncate"
              classList={{ "line-through opacity-70": props.todo.done }}
            >
              {props.todo.description}
            </p>
          </Show>
        </form>
      </div>
      <div class="flex items-center justify-center gap-1">
        <Show when={props.todo.dependsOn.length > 0}>
          <p>
            ({[...props.todo.dependsOn.values()].map((n) => `#${n}`).join(", ")}
            )
          </p>
        </Show>
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
          onClick={() => deleteMutation(props.todo.id)}
          class="rounded p-2 disabled:pointer-events-none disabled:cursor-pointer disabled:opacity-50"
          classList={{ "hover:bg-red-300": !editMode.isOn() }}
          disabled={editMode.isOn()}
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
