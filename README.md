# Todos in SolidStart

This is a simple todo application to test solidStart, the equivalent of Nextjs
for solid. Why? well, its fun!

## Quickstart

- `pnpm i` to install the dependencies.
- `pnpm dev` to start the application.
- Go to `localhost:3000` and be amazed by yet another todo applicaiton.

To make a todo just enter the description in the input
`e.g: start washing machine` and press enter.

Now a todo is created, but what if we wanted to create a todo that depends on
another one `e.g: hang clothes`? Simply add a
`(#<id of the todo to depend on>)` and you are done!

#1 -> `start washing machine`
#2 -> `hang clothes (#1)` // this one will depend on the first one
#3 -> `fold t-shirts (#2)` // this one will depend on the second one
#4 -> `wash another batch of clothes (#1)` // this one will depend on the first one too!
