import * as fs from 'fs'
import * as path from 'path'

const PACKAGE_NAME = '@onecx/integration-tests'

/**
 * Locates the version of the published runner package from its own `package.json`.
 *
 * Resolves for both source runs (`tsx`, where the package root is the repository) and
 * built runs (where the package root is the `dist` directory that carries a generated
 * `package.json`) by walking up from this module until a matching package manifest is found.
 */
export class RunnerVersion {
  /**
   * Reads the runner package version from the package manifest.
   *
   * @returns The package `version`, or `unknown` when no matching manifest is found.
   */
  static get(): string {
    let dir = __dirname

    for (;;) {
      const candidate = path.join(dir, 'package.json')
      if (fs.existsSync(candidate)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(candidate, 'utf8')) as {
            name?: string
            version?: string
          }
          if (manifest.name === PACKAGE_NAME) {
            return manifest.version ?? 'unknown'
          }
        } catch {
          // Ignore an unreadable manifest and keep walking up.
        }
      }

      const parent = path.dirname(dir)
      if (parent === dir) {
        return 'unknown'
      }
      dir = parent
    }
  }
}
