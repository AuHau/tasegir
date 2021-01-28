'use strict'
const path = require('path')
const execa = require('execa')
const { hook } = require('../utils')
const tsconfig = require('../config/tsconfig.js')

module.exports = (argv) => {
  const input = argv._.slice(1)
  const forwardOptions = argv['--'] ? argv['--'] : []
  const watch = argv.watch ? ['--watch'] : []
  const files = argv.files.length ? [...argv.files] : ['test/**/*.spec.ts']
  const verbose = argv.verbose ? ['--log-level', 'debug'] : ['--log-level', 'error']
  const grep = argv.grep ? ['--grep', argv.grep] : []
  const progress = argv.progress ? ['--reporter=progress'] : []
  const bail = argv.bail ? ['--bail', argv.bail] : []
  const timeout = argv.timeout ? ['--timeout', argv.bail] : []
  const renderer = argv.renderer ? ['--renderer'] : []
  const compilerOptions = tsconfig(true).compilerOptions

  return hook('browser', 'pre')(argv.userConfig)
    .then(() => {
      return execa('electron-mocha', [
        '--require', 'ts-node/register',
        '--ui', 'bdd',
        ...input,
        ...files,
        ...watch,
        ...verbose,
        ...grep,
        ...progress,
        ...bail,
        ...timeout,
        ['--colors'],
        ...renderer,
        ...forwardOptions
      ], {
        localDir: path.join(__dirname, '../..'),
        preferLocal: true,
        stdio: 'inherit',
        env: {
          TASEGIR_RUNNER: argv.renderer ? 'electron-renderer' : 'electron-main',
          TS_NODE_COMPILER_OPTIONS: JSON.stringify(compilerOptions)
        }
      })
    })
    .then(() => hook('browser', 'post')(argv.userConfig))
}
