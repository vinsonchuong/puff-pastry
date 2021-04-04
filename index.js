import path from 'path'
import {promises as fs} from 'fs'
import {fork} from 'child_process'
import {set} from 'envdotyml'

export default async function (cliPath, {flags = []} = {}) {
  const binPath = await fs.realpath(process.argv[1])
  const absoluteCliPath = path.resolve(path.dirname(binPath), cliPath)
  const {default: cli} = await import(absoluteCliPath)

  if (flags.some((flag) => !process.execArgv.includes(flag))) {
    fork(process.argv[1], process.argv.slice(2), {
      stdio: 'inherit',
      execArgv: [...process.execArgv, ...flags]
    })
  } else {
    try {
      await set()

      await cli({
        cwd: process.cwd(),
        env: process.env,
        argv: process.argv,
        stdout: process.stdout,
        stderr: process.stderr
      })
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}
