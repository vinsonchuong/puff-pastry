import test from 'ava'
import {useTemporaryDirectory, runProcess} from 'ava-patterns'
import install from 'quick-install'

test('running a CLI', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await install(process.cwd(), directory.path)
  await directory.writeFile(
    'bin.mjs',
    `
    #!/usr/bin/env node
    import run from 'puff-pastry'
    run('./cli.mjs')
    `
  )
  await directory.writeFile(
    'cli.mjs',
    `
    export default async function({cwd, env, argv, stdout}) {
      stdout.write(\`\${cwd}\\n\`)
      stdout.write(\`FOO=\${env.FOO}\\n\`)
      stdout.write(argv.join(' ') + '\\n')
    }
    `
  )

  const {output} = await runProcess(t, {
    command: ['./bin.mjs', 'arg1', 'arg2'],
    cwd: directory.path,
    env: {FOO: 'BAR'}
  })

  t.log(output)
  t.true(output.includes(directory.path))
  t.true(output.includes('FOO=BAR'))
  t.true(output.includes('arg1 arg2'))
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
    export default async function({cwd, env, argv, stdout}) {
      stdout.write(process.execArgv.join(' ') + '\\n')
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

test('properly resolving the CLI path', async (t) => {
  const packageDirectory = await useTemporaryDirectory(t)
  await packageDirectory.writeFile(
    'package.json',
    `
      {
        "name": "project",
        "version": "0.0.0",
        "bin": "./bin.mjs"
      }
    `
  )
  await install(process.cwd(), packageDirectory.path)
  await packageDirectory.writeFile(
    'bin.mjs',
    `
    #!/usr/bin/env node
    import run from 'puff-pastry'
    run('./cli.mjs')
    `
  )
  await packageDirectory.writeFile(
    'cli.mjs',
    `
    export default async function({cwd, env, argv, stdout}) {
      stdout.write(\`FOO=\${env.FOO}\\n\`)
    }
    `
  )

  const projectDirectory = await useTemporaryDirectory(t)
  await install(packageDirectory.path, projectDirectory.path)

  const {output} = await runProcess(t, {
    command: ['npx', 'project'],
    cwd: projectDirectory.path,
    env: {FOO: 'BAR'}
  })

  t.log(output)
  t.true(output.includes('FOO=BAR'))
})

test('adding environment variables from .env.yml', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await install(process.cwd(), directory.path)
  await directory.writeFile(
    'bin.mjs',
    `
    #!/usr/bin/env node
    import run from 'puff-pastry'
    run('./cli.mjs')
    `
  )
  await directory.writeFile(
    'cli.mjs',
    `
    export default async function({cwd, env, argv, stdout}) {
      stdout.write(\`FOO=\${env.FOO}\\n\`)
    }
    `
  )
  await directory.writeFile(
    '.env.yml',
    `
    FOO: BAR
    `
  )

  const {output} = await runProcess(t, {
    command: ['./bin.mjs'],
    cwd: directory.path
  })

  t.log(output)
  t.true(output.includes('FOO=BAR'))
})
