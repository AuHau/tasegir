'use strict'
const userConfig = require('./config/user')
const path = require('path')
const execa = require('execa')

const DEFAULT_IGNORE = ['tasegir']

const DEFAULT_INPUTS = [
  'package.json',
  './test/**/*.ts',
  './src/**/*.ts',
  '!./test/fixtures/**/*.ts'
]

module.exports = function depCheck (argv) {
  const config = userConfig()

  const input = argv._.slice(1)
  const forwardOptions = argv['--'] ? argv['--'] : []
  const defaults = input.length ? input : (config.depCheck && config.depCheck.files ? config.depCheck.files : DEFAULT_INPUTS)

  const ignored = (config.depCheck && config.depCheck.ignore) || DEFAULT_IGNORE
  const formattedIgnored = ignored.map(value => ['--ignore-module', value]).reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])

  return execa('dependency-check', [
    ...defaults,
    '--missing',
    '--unused',
    '--extensions', 'ts:detective-typescript',
    ...formattedIgnored,
    ...forwardOptions
  ], {
    stdio: 'inherit',
    localDir: path.join(__dirname, '..'),
    preferLocal: true
  })
}
