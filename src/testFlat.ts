export function createTestFlat(
  runner: typeof test | typeof test.skip | typeof test.only
) {
  const testFlat: jest.It['flat'] = (title, suite, before, after) => {
    runner(title, async () => {
      const context = await before()

      try {
        await suite(context)
      } finally {
        await after(context)
      }
    })
  }

  return testFlat
}

test.flat = createTestFlat(test)
test.only.flat = createTestFlat(test.only)
test.skip.flat = createTestFlat(test.skip)
