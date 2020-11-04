# `test-flat`

A test framework extension to support resources teardown and cleanup in flat tests.

## Motivation

Writing flat (shallow) test suites has a [number of advantages](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing). However, testing frameworks rarely support `before`/`after` hooks as a part of an individual test. Such support would allow to create and clean up resources necessary for a single test suite, without having to rely on `beforeEach`/`afterEach` global hooks.

## Getting started

### Install

```bash
$ npm install test-flat --save-dev
```

### Extend Jest

```js
// jest.setup.js
import 'test-flat'
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
