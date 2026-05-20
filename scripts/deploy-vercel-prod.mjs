import { spawn } from 'node:child_process'

const token = process.env.VERCEL_TOKEN

if (!token) {
  console.error('Missing VERCEL_TOKEN. Run this with a Vercel token in the environment.')
  process.exit(1)
}

const child = spawn(
  'vercel',
  ['deploy', '--prod', '--yes', '--token', token],
  {
    stdio: 'inherit',
    env: process.env,
  },
)

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Vercel deploy exited with signal ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})
