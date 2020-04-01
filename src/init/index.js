'use strict'

const Listr = require('listr')
const inquirer = require('inquirer')
const fs = require('fs').promises
const git = require('simple-git/promise')

const {fromTasegir, fromRoot, filterKeys} = require('../utils')

async function bootstrap () {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Do you want to symlink eslintrc.js to root of your project?',
      default: false
    },
    {
      type: 'confirm',
      name: 'ts',
      message: 'Do you want to symlink tsconfig.json to root of your project?',
      default: false
    },
  ])
}

function symlinkClosure (configFile) {
  return async () => {
    const to = fromRoot(configFile)
    await fs.symlink(fromTasegir('config', configFile), to)

    const ignoredFiles = await git().checkIgnore(configFile)
    if (ignoredFiles.length === 0) {
      await fs.appendFile('.git/info/exclude', configFile)
    }
  }
}

module.exports = async function init (opts) {
  console.log('Opts: ', opts)

  opts = filterKeys(opts, ['ts', 'eslint'])

  if (Object.keys(opts).length === 0) {
    opts = await bootstrap()
    console.log('')
  }

  const tasks = new Listr([
    {
      title: 'Symlinking eslintrc.js',
      task: symlinkClosure('eslintrc.js'),
      enabled: (ctx) => ctx.eslint
    },
    {
      title: 'Symlinking tsconfig.json',
      task: symlinkClosure('tsconfig.json'),
      enabled: (ctx) => ctx.ts
    }
  ])

  return tasks.run(opts)
}
