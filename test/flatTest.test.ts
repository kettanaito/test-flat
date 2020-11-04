import * as fs from 'fs'
import '../src/testFlat'

const beforeCallback = jest.fn(async () => {
  const filePath = ''
  await fs.promises.writeFile(filePath, 'data')
  return filePath
})

test.flat(
  'creates and removes the file',
  async (filePath) => {
    expect(fs.existsSync(filePath)).toBe(true)
  },
  beforeCallback,
  async (filePath) => {
    await fs.promises.rmdir(filePath)
  }
)

test('executes the "after" callback to clean up after the test', () => {
  expect(beforeCallback).toHaveBeenCalledTimes(1)
})
