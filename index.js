import * as path from 'path'
import {fork} from 'child_process'

export default async function (cliPath, {flags = []} = {}) {
  const binPath = process.argv[1]
  const absoluteCliPath = path.resolve(path.dirname(binPath), cliPath)
  const {default: cli} = await import(absoluteCliPath)

  if (flags.some((flag) => !process.execArgv.includes(flag))) {
    fork(process.argv[1], process.argv.slice(2), {
      stdio: 'inherit',
      execArgv: [...process.execArgv, ...flags]
    })
  } else {
    try {
      await cli({
        cwd: process.cwd(),
        env: process.env,
        argv: process.argv,
        log: (data) => {
          process.stdout.write(data)
        }
      })
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}
