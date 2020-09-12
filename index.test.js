/* eslint-disable ava/no-only-test */
import test from 'ava'
import {useTemporaryDirectory, runProcess} from 'ava-patterns'
import install from 'quick-install'

test.only('running a CLI', async (t) => {
  console.log('make dir')
  const directory = await useTemporaryDirectory(t)

  console.log('quick install')
  await install(process.cwd(), directory.path)

  console.log('write bin')
  await directory.writeFile(
    'bin.mjs',
    `
    #!/usr/bin/env node
    import run from 'puff-pastry'
    run('./cli.mjs')
    `
  )

  console.log('write cli')
  await directory.writeFile(
    'cli.mjs',
    `
    export default async function({cwd, env, argv, log}) {
      log(\`\${cwd}\\n\`)
      log(\`FOO=\${env.FOO}\\n\`)
      log(argv.join(' ') + '\\n')
    }
    `
  )

  console.log('spawn')
  const program = runProcess(t, {
    command: ['./bin.mjs', 'arg1', 'arg2'],
    cwd: directory.path,
    env: {FOO: 'BAR'}
  })

  console.log('program', program)

  console.log('look at output')
  for await (const data of program.outputStream) {
    console.log(data)
  }

  t.log(program.output)
  t.true(program.output.includes(directory.path))
  t.true(program.output.includes('FOO=BAR'))
  t.true(program.output.includes('arg1 arg2'))
})

test('setting CLI flags', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await install(process.cwd(), directory.path)
  await directory.writeFile(
    'bin.mjs',
    `
    #!/usr/bin/env node
    import run from 'puff-pastry'
    run('./cli.mjs', {flags: ['--title', 'foo']})
    `
  )
  await directory.writeFile(
    'cli.mjs',
    `
    export default async function({cwd, env, argv, log}) {
      log(process.execArgv.join(' ') + '\\n')
    }
    `
  )

  const {output} = await runProcess(t, {
    command: ['./bin.mjs'],
    cwd: directory.path
  })

  t.log(output)
  t.true(output.includes('--title foo'))
})
