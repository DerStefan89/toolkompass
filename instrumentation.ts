export async function register() {
  if (process.env.NEXT_SERVER_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_SERVER_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
