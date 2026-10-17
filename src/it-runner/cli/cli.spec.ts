import { parseCliArgs } from './cli'

/**
 * Validates supported CLI flag parsing and error handling.
 */
describe('parseCliArgs', () => {
  it('enables capture logs by default', () => {
    const options = parseCliArgs([], {})
    expect(options.captureLogsToFile).toBe(true)
  })

  it('parses boolean flags', () => {
    const options = parseCliArgs(['--capture-logs', '--dry-run'], {})

    expect(options.captureLogsToFile).toBe(true)
    expect(options.dryRun).toBe(true)
  })

  it('supports verbose alias', () => {
    const options = parseCliArgs(['-v'], {})
    expect(options.verbose).toBe(true)
  })

  it('parses help flag', () => {
    const options = parseCliArgs(['--help'], {})
    expect(options.help).toBe(true)
  })

  it('throws on unknown flag', () => {
    expect(() => parseCliArgs(['--unknown'], {})).toThrow("unknown option '--unknown'")
  })

  it('parses the --config option value', () => {
    const options = parseCliArgs(['--config', 'integration/platform.json'], {})

    expect(options.configPath).toBe('integration/platform.json')
    expect(options.dryRun).toBe(false)
  })

  it('leaves configPath undefined when --config is not provided', () => {
    const options = parseCliArgs([], {})

    expect(options.configPath).toBeUndefined()
  })

  it('throws when --config is provided without a value', () => {
    expect(() => parseCliArgs(['--config'], {})).toThrow("option '--config <path>' argument missing")
  })
})
