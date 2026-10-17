import * as path from 'path'

jest.mock('fs', () => {
  const actual = jest.requireActual<typeof import('fs')>('fs')
  return {
    ...actual,
    existsSync: jest.fn(actual.existsSync),
    readFileSync: jest.fn(actual.readFileSync),
  }
})

import * as fs from 'fs'
import { RunnerVersion } from './runner-version'

const actualFs = jest.requireActual<typeof import('fs')>('fs')
const packageJson = JSON.parse(actualFs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')) as {
  version: string
}

describe('RunnerVersion', () => {
  const existsSyncMock = fs.existsSync as jest.Mock
  const readFileSyncMock = fs.readFileSync as jest.Mock

  afterEach(() => {
    existsSyncMock.mockImplementation(actualFs.existsSync)
    readFileSyncMock.mockImplementation(actualFs.readFileSync)
  })

  it('returns the version from the package manifest', () => {
    expect(RunnerVersion.get()).toBe(packageJson.version)
  })

  it('returns unknown when no matching package manifest is found', () => {
    existsSyncMock.mockReturnValue(true)
    readFileSyncMock.mockReturnValue(JSON.stringify({ name: 'some-other-package', version: '9.9.9' }))

    expect(RunnerVersion.get()).toBe('unknown')
  })

  it('returns unknown when no package manifest exists', () => {
    existsSyncMock.mockReturnValue(false)

    expect(RunnerVersion.get()).toBe('unknown')
  })
})
