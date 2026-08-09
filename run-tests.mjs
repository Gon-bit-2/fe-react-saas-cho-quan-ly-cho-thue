import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

try {
  const output = execSync('npx vitest run', { encoding: 'utf-8', stdio: 'pipe' })
  writeFileSync('test_output.txt', output)
} catch (error) {
  writeFileSync('test_output.txt', error.stdout || error.message)
}
