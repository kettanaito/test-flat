export function createFlatTest(
  runner: typeof test | typeof test.skip | typeof test.only
) {
  const flatTest: jest.It['flat'] = (title, suite, before, after) => {
    runner(title, async () => {
      const context = await before()

      try {
        await suite(context)
      } finally {
        await after(context)
      }
    })
  }

  return flatTest
}

test.flat = createFlatTest(test)
test.only.flat = createFlatTest(test.only)
test.skip.flat = createFlatTest(test.skip)
