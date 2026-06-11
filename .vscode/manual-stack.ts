import { PlatformManager } from '../src/lib/platform/platform-manager'

const keycloakHostPort = process.env.ONECX_KEYCLOAK_HOST_PORT ?? '18080'
process.env.ONECX_KEYCLOAK_HOST_PORT = keycloakHostPort
process.env.ONECX_BROWSER_KEYCLOAK_URL =
  process.env.ONECX_BROWSER_KEYCLOAK_URL ?? `http://localhost:${keycloakHostPort}`

const manager = new PlatformManager('integration-tests/platform/platform.json')

async function shutdown(signal?: string): Promise<void> {
  console.log(
    signal ? `\n[manual-stack] received ${signal}, stopping containers...` : '\n[manual-stack] stopping containers...'
  )
  await manager.stopAllContainers().catch((error) => console.error('[manual-stack] cleanup failed', error))
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

console.log('[manual-stack] starting platform...')

async function main(): Promise<void> {
  await manager.startContainers()

  console.log('[manual-stack] checking health...')
  await manager.checkAllHealthy()

  const info = await manager.getPlatformInfo()
  await manager.exportPlatformInfo()

  const containers = info?.containers ?? {}
  const shell = containers['onecx-shell-ui']
  const workspaceUrl = shell?.externalUrl ? `${shell.externalUrl}/onecx-shell/admin/workspace` : undefined

  console.log('[manual-stack] platform ready')
  console.log('[manual-stack] shell-ui:', shell?.externalUrl ?? 'not found')
  console.log('[manual-stack] keycloak:', process.env.ONECX_BROWSER_KEYCLOAK_URL)
  console.log('[manual-stack] workspace URL:', workspaceUrl ?? 'not found')
  console.log('[manual-stack] keep this task running; stop it to clean up containers')

  process.stdin.resume()
}

main().catch(async (error) => {
  console.error('[manual-stack] startup failed', error)
  await shutdown()
})
