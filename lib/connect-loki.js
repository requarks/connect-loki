'use strict'

/**
 * CONNECT-LOKI
 * A Loki.js session store for Connect/Express
 * MIT Licensed
 */

const Loki = require('lokijs')
const util = require('util')
const _ = {
  noop: () => {},
  isNil: (v) => v == null
}

module.exports = (session) => {
  /**
   * Express's session Store.
   */
  const Store = session.Store

  /**
   * Initialize LokiStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */
  function LokiStore (options) {
    if (!(this instanceof LokiStore)) {
      throw new TypeError('Cannot call LokiStore constructor as a function')
    }

    const self = this

    // Parse options

    options = options || {}
    Store.call(this, options)

    this.autosave = options.autosave !== false
    this.storePath = options.path || './session-store.db'
    this.ttl = options.ttl || 1209600
    if (this.ttl === 0) { this.ttl = null }

    // Initialize Loki.js

    this.client = new Loki(this.storePath, {
      env: 'NODEJS',
      autosave: self.autosave,
      autosaveInterval: 5000
    })

    // Setup error logging

    if (options.logErrors) {
      if (typeof options.logErrors !== 'function') {
        options.logErrors = function (err) {
          console.error('Warning: connect-loki reported a client error: ' + err)
        }
      }
      this.logger = options.logErrors
    } else {
      this.logger = _.noop
    }

    // Get / Create collection

    this.client.loadDatabase({}, () => {
      self.collection = self.client.getCollection('Sessions')
      if (_.isNil(self.collection)) {
        self.collection = self.client.addCollection('Sessions', {
          indices: ['sid'],
          ttlInterval: self.ttl
        })
      }
      self.collection.on('error', (err) => {
        return self.logger(err)
      })
      self.emit('connect')
    })
  }

  /**
   * Inherit from `Store`.
   */
  util.inherits(LokiStore, Store)

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.get = function (sid, fn) {
    if (!fn) { fn = _.noop }
    if (!this.collection) {
      return fn(null)
    }
    const s = this.collection.find({ sid })
    if (s[0] && s[0].content) {
      fn(null, s[0].content)
    } else {
      fn(null)
    }
  }

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.set = function (sid, sess, fn) {
    if (!fn) { fn = _.noop }

    const s = this.collection.find({ sid })
    if (s[0] && s[0].content) {
      s[0].content = sess
      s[0].updatedAt = new Date()
      this.collection.update(s[0])
    } else {
      this.collection.insert({
        sid,
        content: sess,
        updatedAt: new Date()
      })
    }

    fn(null)
  }

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.destroy = function (sid, fn) {
    if (!fn) { fn = _.noop }
    this.collection.findAndRemove({ sid })
    fn(null)
  }

  /**
   * Clear all sessions in the store
   *
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.clear = function (fn) {
    if (!fn) { fn = _.noop }
    this.collection.clear()
    fn(null)
  }

  /**
   * Count of all sessions in the store
   *
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.length = function (fn) {
    if (!fn) { fn = _.noop }
    const c = this.collection.count()
    fn(null, c)
  }

  /**
   * Refresh the time-to-live for the session with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  LokiStore.prototype.touch = function (sid, sess, fn) {
    if (!fn) { fn = _.noop }

    const s = this.collection.find({ sid })
    if (s[0] && s[0].updatedAt) {
      s[0].updatedAt = new Date()
      this.collection.update(s[0])
    }

    return fn()
  }

  return LokiStore
}
