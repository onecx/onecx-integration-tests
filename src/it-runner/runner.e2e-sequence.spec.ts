import { PlatformRuntime } from '../lib/models/interfaces/platform-runtime.interface'
import { E2eExecutionRecord } from '../lib/models/interfaces/e2e.interface'
import * as fs from 'fs'
import * as path from 'path'
import { RunSummary } from './types/run-summary.interface'

const ensureDirectoriesMock = jest.fn()
const copyE2eResultsMock = jest.fn()
const writeSummaryMock = jest.fn()
const writeE2eExecutionsMock = jest.fn()

jest.mock('./artifacts/artifacts-manager', () => ({
  ArtifactsManager: jest.fn().mockImplementation(() => ({
    ensureDirectories: ensureDirectoriesMock,
    getArtifactsRoot: jest.fn().mockReturnValue(process.cwd()),
    getRunDir: jest.fn().mockReturnValue(`${process.cwd()}/integration-tests/artifacts/test-run`),
    getRunnerLogPath: jest
      .fn()
      .mockReturnValue(`${process.cwd()}/integration-tests/artifacts/test-run/logs/runner.log`),
    getLogsDir: jest.fn().mockReturnValue(`${process.cwd()}/integration-tests/artifacts/test-run/logs`),
    getContainerLogPath: jest.fn().mockImplementation((name: string) => `${process.cwd()}/logs/${name}.log`),
    writeSummary: writeSummaryMock,
    writeE2eExecutions: writeE2eExecutionsMock,
    copyE2eResults: copyE2eResultsMock,
  })),
}))

import { IntegrationTestsRunner } from './runner'

class StubPlatformRuntime implements PlatformRuntime {
  readonly callOrder: string[] = []

  constructor(
    private readonly e2eRecords: E2eExecutionRecord[] | undefined,
    private readonly configValid = true,
    private readonly resolvedImages: Record<string, string> = {},
    private readonly startError?: string
  ) {}

  hasValidatedConfig(): boolean {
    return this.configValid
  }

  getValidatedConfig() {
    return {
      importData: true,
      container: {
        e2e: this.e2eRecords ? [{ image: 'suite-image', networkAlias: 'suite-a' }] : undefined,
      },
    }
  }

  hasE2eConfig(): boolean {
    return (this.e2eRecords?.length ?? 0) > 0
  }

  async startContainers(): Promise<void> {
    this.callOrder.push('startContainers')
    if (this.startError) {
      throw new Error(this.startError)
    }
  }

  async exportPlatformInfo(): Promise<void> {
    this.callOrder.push('exportPlatformInfo')
  }

  async checkAllHealthy(): Promise<unknown> {
    this.callOrder.push('checkAllHealthy')
    return []
  }

  async startE2eContainers(): Promise<E2eExecutionRecord[] | undefined> {
    this.callOrder.push('startE2eContainers')
    return this.e2eRecords
  }

  async stopAllContainers(): Promise<void> {
    this.callOrder.push('stopAllContainers')
  }

  getAllContainers(): Map<string, unknown> {
    return new Map()
  }

  getResolvedImages(): Record<string, string> {
    return this.resolvedImages
  }
}

describe('IntegrationTestsRunner E2E sequencing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fail final run when at least one E2E execution failed and still perform finalization', async () => {
    const records: E2eExecutionRecord[] = [
      {
        networkAlias: 'suite-a',
        sequence: 1,
        total: 2,
        status: 'failed_timeout',
        success: false,
        errorMessage: 'timeout waiting for container',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        duration: 100,
      },
      {
        networkAlias: 'suite-b',
        sequence: 2,
        total: 2,
        status: 'passed',
        success: true,
        exitCode: 0,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        duration: 120,
      },
    ]

    const runtime = new StubPlatformRuntime(records)
    const runner = new IntegrationTestsRunner(
      {
        verbose: false,
        dryRun: false,
        captureLogsToFile: false,
        help: false,
      },
      () => runtime
    )

    const exitCode = await runner.run()

    expect(exitCode).toBe(1)
    expect(runtime.callOrder).toContain('stopAllContainers')
    expect(runtime.callOrder.indexOf('exportPlatformInfo')).toBeLessThan(
      runtime.callOrder.indexOf('startE2eContainers')
    )
    expect(writeE2eExecutionsMock).toHaveBeenCalledTimes(1)
    expect(copyE2eResultsMock).toHaveBeenCalledTimes(1)
    expect(writeSummaryMock).toHaveBeenCalledTimes(1)
  })

  it('should succeed when no E2E executions are returned', async () => {
    const resolvedImages = { 'docker.io/library/postgres:17.9': 'my-custom-postgres:latest' }
    const runtime = new StubPlatformRuntime(undefined, true, resolvedImages)
    const runner = new IntegrationTestsRunner(
      {
        verbose: false,
        dryRun: false,
        captureLogsToFile: false,
        help: false,
        configPath: 'integration/platform.json',
      },
      () => runtime
    )

    const exitCode = await runner.run()

    expect(exitCode).toBe(0)
    expect(writeE2eExecutionsMock).not.toHaveBeenCalled()
    expect(copyE2eResultsMock).toHaveBeenCalledTimes(1)
    expect(runtime.callOrder).toContain('stopAllContainers')

    const summary = writeSummaryMock.mock.calls[0][0] as RunSummary
    expect(summary.configPath).toBe('integration/platform.json')
    const packageVersion = (
      JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')) as { version: string }
    ).version
    expect(summary.runnerVersion).toBe(packageVersion)
    expect(summary.resolvedImages).toEqual(resolvedImages)
  })

  it('exits non-zero with status error when a strict image override fails during platform startup', async () => {
    const overrideError = 'Explicitly requested image override is not available: my-override/image:1.0'
    const runtime = new StubPlatformRuntime(undefined, true, {}, overrideError)
    const runner = new IntegrationTestsRunner(
      {
        verbose: false,
        dryRun: false,
        captureLogsToFile: false,
        help: false,
        configPath: 'integration/platform.json',
      },
      () => runtime
    )

    const exitCode = await runner.run()

    expect(exitCode).toBe(1)
    expect(runtime.callOrder).toContain('stopAllContainers')
    expect(runtime.callOrder).not.toContain('startE2eContainers')

    const summary = writeSummaryMock.mock.calls[0][0] as RunSummary
    expect(summary.exitCode).toBe(1)
    expect(summary.status).toBe('error')
    expect(summary.configPath).toBe('integration/platform.json')
  })
})
