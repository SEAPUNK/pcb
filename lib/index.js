'use strict'

const copromise = require('mini-copromise')
const composer = require('koa-compose')

class PCB {
  constructor (resource) {
    this.resource = resource
    this.middleware = []
  }

  use (middleware) {
    this.middleware.push(middleware)
  }

  call (name, data, meta) {
    if (typeof name !== 'string') {
      throw new Error('Name must be a string!')
    }

    const middlewareList = [initialMiddleware].concat(this.middleware)
    const composed = composer(middlewareList)
    const ctx = createContext(this.resource, name, data, meta)
    return composed(ctx).then(() => {
      console.log('resolved')
      return ctx
    }).catch((err) => {
      console.log('errored')
      console.log(err)
      throw err
    })
  }
}

const initialMiddleware = copromise(function * initialMiddleware (ctx, next) {
  console.log('first')
  yield next()
  console.log('last, handled:', ctx.handled)
})

function createContext (resource, name, data, meta) {
  const ctx = {
    resource: resource,
    name: name,
    data: data,
    meta: meta,
    locals: {},
    response: undefined
  }

  let handled = false

  Object.defineProperty(ctx, 'handled', {
    get: function () {
      return handled
    }
  })

  ctx.handle = function (response) {
    if (handled) throw new Error('Call already handled')
    ctx.response = response
    handled = true
  }

  return ctx
}

module.exports = PCB
