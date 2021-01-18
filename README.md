# `test-flat`

A test framework extension to support resources teardown and cleanup in flat tests.

## What problem does this solve?

When writing tests there's often logic that a test needs, which isn't strictly a part of the test itself. That logic is often put into the `beforeAll`/`afterAll` hooks of a testing framework that executes it before and after tests, respectively.

This package allows to defined a "before" and "after" logic on a per-test basis. This helps you avoid nesting during your tests and keep them flat.

> Learn more about the topic in "[Avoid nesting when you're testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)" by Kent C. Dodds.

## Features

### Immutable shared context

Shares context between the `before` and `after` hooks, as well as exposes it in the test suite to prevent variable mutation.

```js
// BEFORE
// Exposing `server` at the global test's scope
// makes it vulnurable to accidental mutation.
let server

beforeAll(() => {
  server = createServer(...)
})

afterAll(() => server.close())
```

```js
// AFTER
test(
  'handles request',
  ({ server }) => {/* Your test */},
  () => {
    const server = createServer()
    // Create a context shared with the test and the "after" hook.
    // The `server` instance is nicely scoped and immutable.
    return { server }
  },
  ({ server }) => {
    return server.close()
  }
})
```

### Deterministic cleanup

As opposed to calling the cleanup (`after`) hook as the last step of the test, this library executes it regardless of the test's passing status.

```js
// BEFORE
test('handles request', () => {
  const server = createServer()

  // If this assertion fails,
  expect(res.status).toBe(200)

  // ...this cleanup is never called.
  return server.close()
})
```

```js
// AFTER
test(
  'a failing test',
  () => {
    throw new Error('Oops, assertion failed!')
  },
  createServer,
  // Regardless if the test passes or not,
  // this cleanup function is always called.
  closeServer
)
```

## Getting started

### Install

```bash
$ npm install test-flat --save-dev
```

### Extend your testing framework

#### Jest

```js
// jest.setup.js
import 'test-flat'
```

```js
// jest.config.js
module.exports = {
  setupFiles: ['./jest.setup.js'],
}
```

## Example

Here's an example of a flat test suite that tears down a Puppeteer browser and cleans up afterwards as a part of a single test suite:

```js
import * as puppeteer from 'puppeteer'

test.flat(
  'renders the header element on the homepage',
  (context) => {
    await context.page.goto('https://github.com')
    const headerElement = await context.page.evaluate(() => {
      return document.getElementById('header')
    })

    expect(headerElement).toBeTruthy()
  },
  async () => {
    // Create a browser and a new page
    // before the test suite.
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    return {
      browser
      page,
    }
  },
  async (context) => {
    // Await until the browser is closed
    // before finishing the test.
    return context.browser.close()
  }
)
```

> Both `test.only.flat` and `test.skip.flat` are supported.

## API

```ts
function flatTest<Context>(
  title: string,
  suite: (context: Context) => Promise<any>,
  before?: () => Promise<Context>,
  after?: (context: Context) => Promise<any>
): void
```

### `title`

A test suite title.

### `suite`

A test suite itself.

> Test suite function in `test-flat` is always an asynchronous function and does not support the `done` callback argument.

### `before`

An optional teardown hook to create any resources necessary for the respective test. Anything returned from this hook will be available as the `context` argument in the `suite` and `after` functions.

### `after`

An optional cleanup hook executed after the test is finished (passed or failed). Accepts an optional `context` argument to clean up the resources created as a part of the `before` hook.

## FAQ

### This is a huge repetition

If you notice your before/after logic repeating from test to test, consider abstracting it into a helper function.

```js
// test/helper.js
import express from 'express'

export function startServer(options) {
  return () => {
    const app = express()

    return new Promise((resolve) => {
      app.listen(options?.port || 3000, () => {
        resolve({ app })
      })
    })
  }
}

function closeServer({ app }) {
  return new Promise((resolve) => {
    app.close(resolve)
  })
}
```

```js
// test/checkout.test.js
import { startServer, closeServer } from './helpers'

test(
  'handles a /checkout route',
  () => {
    /* Your test here */
  },
  startServer({ port: 3001 }),
  closeServer
)
```
