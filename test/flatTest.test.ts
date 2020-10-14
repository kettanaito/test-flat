import '../src/flatTest'

test.flat(
  '',
  async (interval) => {
    context
  },
  async () => {
    return setInterval(() => null, 500)
  },
  async (interval) => {
    clearInterval(interval)
  }
)
