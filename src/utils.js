/**
 * Various utility methods used in AEgir.
 *
 * @module tasegir/utils
 */
'use strict'

const path = require('path')
const findUp = require('findup-sync')
const readPkgUp = require('read-pkg-up')
const fs = require('fs-extra')
const arrify = require('arrify')
const _ = require('lodash')
const VerboseRenderer = require('listr-verbose-renderer')
const execa = require('execa')
const os = require('os')

const { packageJson: pkg, path: pkgPath } = readPkgUp.sync({
  cwd: fs.realpathSync(process.cwd())
})
const PKG_FILE = 'package.json'
const DIST_FOLDER = 'dist'
const SRC_FOLDER = 'src'

exports.paths = {
  dist: DIST_FOLDER,
  src: SRC_FOLDER
}
exports.pkg = pkg
exports.hasPkgProp = props => arrify(props).some(prop => _.has(pkg, prop))
// TODO: get this from tasegir package.json
exports.browserslist = '>1% or node >=10 and not ie 11 and not dead'

exports.repoDirectory = path.dirname(pkgPath)
exports.fromRoot = (...p) => path.join(exports.repoDirectory, ...p)
exports.hasFile = (...p) => fs.existsSync(exports.fromRoot(...p))
exports.fromTasegir = (...p) => path.join(__dirname, '..', ...p)
/**
 * Gets the top level path of the project tasegir is executed in.
 *
 * @returns {string}
 */
exports.getBasePath = () => {
  return process.cwd()
}

/**
 * @returns {string}
 */
exports.getPathToPkg = () => {
  return path.join(exports.getBasePath(), PKG_FILE)
}

/**
 * @returns {Promise<Object>}
 */
exports.getPkg = () => {
  return fs.readJson(exports.getPathToPkg())
}

/**
 * @returns {string}
 */
exports.getPathToDist = () => {
  return path.join(exports.getBasePath(), DIST_FOLDER)
}

/**
 * @returns {string}
 */
exports.getUserConfigPath = () => {
  return findUp('.tasegir.js')
}

/**
 * @returns {Object}
 */
exports.getUserConfig = () => {
  let conf = {}
  try {
    const path = exports.getUserConfigPath()
    if (!path) return null
    conf = require(path)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
  }
  return conf
}

/**
 * @returns {string}
 */
exports.getGlobalConfigPath = () => {
  return process.env.TASEGIR_CONFIG || path.join(os.homedir(), '.tasegir.js')
}

/**
 * @returns {Object}
 */
exports.getGlobalConfig = () => {
  let conf = {}
  try {
    const path = exports.getGlobalConfigPath()
    if (!path) return null
    conf = require(path)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
  }
  return conf
}

/**
 * Converts the given name from something like `peer-id` to `PeerId`.
 *
 * @param {string} name
 *
 * @returns {string}
 */
exports.getLibraryName = (name) => {
  return _.upperFirst(_.camelCase(name))
}

/**
 * Get the absolute path to `node_modules` for tasegir itself
 *
 * @returns {string}
 */
exports.getPathToNodeModules = () => {
  return path.resolve(__dirname, '../node_modules')
}

/**
 * Get the config for Listr.
 *
 * @returns {Object}
 */
exports.getListrConfig = () => {
  return {
    renderer: VerboseRenderer
  }
}

/**
 * Get current env variables for inclusion.
 *
 * @param {string} [env='development']
 *
 * @returns {Object}
 */
exports.getEnv = (env) => {
  const PREFIX = /^TASEGIR_/i
  let NODE_ENV = env || 'development'
  if (JSON.stringify(process.env.NODE_ENV) !== JSON.stringify(undefined) && process.env.NODE_ENV) {
    NODE_ENV = process.env.NODE_ENV
  }

  const raw = Object.keys(process.env)
    .filter((key) => PREFIX.test(key))
    .reduce((env, key) => {
      if (key === 'TASEGIR_GHTOKEN') {
        return env
      } else {
        env[key] = process.env[key]
        return env
      }
    }, {
      NODE_ENV: NODE_ENV
    })

  const stringifed = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {})
  }

  return {
    raw: raw,
    stringified: stringifed
  }
}

/**
 * Path to example file.
 *
 * @returns {string}
 */
exports.getPathToExample = () => {
  return path.join(exports.getBasePath(), 'example.js')
}

/**
 * Path to documentation config file.
 *
 * @returns {string}
 */
exports.getPathToDocsConfig = () => {
  return path.join(exports.getBasePath(), 'documentation.yml')
}

/**
 * Path to documentation folder.
 *
 * @returns {string}
 */
exports.getPathToDocs = () => {
  return path.join(exports.getBasePath(), 'docs')
}

/**
 * Path to documentation index.html.
 *
 * @returns {string}
 */
exports.getPathToDocsFile = () => {
  return path.join(exports.getPathToDocs(), 'index.html')
}

/**
 * Path to documentation index.md.
 *
 * @returns {string}
 */
exports.getPathToDocsMdFile = () => {
  return path.join(exports.getPathToDocs(), 'index.md')
}

exports.hook = (env, key) => (ctx) => {
  if (ctx && ctx.hooks) {
    if (ctx.hooks[env] && ctx.hooks[env][key]) {
      return ctx.hooks[env][key]()
    }
    if (ctx.hooks[key]) {
      return ctx.hooks[key]()
    }
  }

  return Promise.resolve()
}

exports.exec = (command, args, options = {}) => {
  const result = execa(command, args, options)

  if (!options.quiet) {
    result.stdout.pipe(process.stdout)
  }

  result.stderr.pipe(process.stderr)

  return result
}

/**
 * Filter object based on allowed keys
 * @param {Object} obj
 * @param {Array} allowedKeys
 */
exports.filterKeys = (obj, allowedKeys) => {
  return Object.keys(obj)
    .filter(key => allowedKeys.includes(key))
    .reduce((newObj, key) => {
      return {
        ...newObj,
        [key]: obj[key]
      };
    }, {});
}
