/* eslint-env mocha */

import sinon from 'sinon'
import path from 'path'

import { expect } from 'chai'

import utils from '../src/utils'

describe('utils', () => {
  it('getBasePath', () => {
    expect(utils.getBasePath()).to.eql(process.cwd())
  })

  it('getPathToPkg', () => {
    sinon.stub(process, 'cwd').returns('hello')

    expect(utils.getPathToPkg()).to.eql(path.normalize('hello/package.json'))
    // TODO: Proper TS mocking
    // @ts-ignore: Currently ignored
    process.cwd.restore()
  })

  it('getPkg', () => {
    return utils.getPkg().then((pkg: { name: any }) => {
      expect(pkg.name).to.eql('tasegir')
    })
  })

  it('getPathToDist', () => {
    expect(utils.getPathToDist()).to.match(/dist$/)
  })

  it('getUserConfigPath', () => {
    expect(utils.getUserConfigPath()).to.match(/.tasegir.js$/)
  })

  it('getUserConfig', () => {
    sinon.stub(utils, 'getUserConfigPath').returns(path.join(__dirname, 'fixtures/.tasegir.js'))
    expect(utils.getUserConfig()).to.eql({ config: 'mine' })
  })

  it('getLibraryName', () => {
    const cases = [
      ['hello world', 'HelloWorld'],
      ['peer-id', 'PeerId'],
      ['Peer ID', 'PeerId'],
      ['aegir', 'Aegir']
    ]
    cases.forEach((c) => {
      expect(utils.getLibraryName(c[0])).to.eql(c[1])
    })
  })

  it('getPathToNodeModules', () => {
    expect(utils.getPathToNodeModules()).to.match(/node_modules$/)
  })

  it('getEnv', () => {
    process.env.TASEGIR_TEST = 'hello'

    const env = utils.getEnv()
    expect(env.raw.NODE_ENV).to.eql('test')
    expect(env.raw.TASEGIR_TEST).to.eql('hello')
    expect(env.stringified['process.env'].NODE_ENV).to.eql('"test"')
    expect(env.stringified['process.env'].TASEGIR_TEST).to.eql('"hello"')

    process.env.NODE_ENV = ''
    expect(utils.getEnv('production').raw).to.have.property('NODE_ENV', 'production')
    process.env.NODE_ENV = 'test'
  })

  it('hook', () => {
    const res = utils.hook('node', 'pre')({
      hooks: {
        node: {
          pre () {
            return Promise.resolve(10)
          }
        }
      }
    })

    return Promise.all([
      res,
      utils.hook('node', 'pre')({ hooks: {} }),
      utils.hook('node', 'pre')({ hooks: { browser: { pre: {} } } })
    ]).then((results) => {
      expect(results).to.eql([
        10,
        undefined,
        undefined
      ])
    })
  })
})
