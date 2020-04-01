'use strict'

module.exports = {
  command: 'init',
  desc: 'Initializes some goodies. \n\nWhen symlinking the links are added to local Git ignore (eq. .git/info/exclude file)',
  builder: {
    eslint: {
      alias: 'e',
      describe: 'Create symlink for eslintrc.js',
      type: 'boolean'
    },
    ts: {
      alias: 't',
      describe: 'Create symlink for tsconfig.json',
      type: 'boolean'
    }

  },
  handler (argv) {
    const init = require('../src/init')
    const onError = require('../src/error-handler')
    init(argv).catch(onError)
  }
}
