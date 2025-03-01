// tests for null_hash 03/01/2025
// version 1.0.0

'use strict'

const assert = require('node:assert/strict')
const {createHash} = require('node:crypto')

const fixtures   = require('haraka-test-fixtures')


beforeEach(function () {
  this.plugin = new fixtures.plugin('null_hash')

  this.connection = fixtures.connection.createConnection()
  this.connection.transaction = fixtures.transaction.createTransaction()
  this.connection.transaction.results = new fixtures.results(this.connection)

  this.connection.transaction.notes = {}
  this.connection.transaction.mail_from = { original: '<test@example.com>' }
  this.connection.transaction.body = {bodytext: 'some body'}
})

afterEach(function () {
})

describe('null_hash', function () {
  it('loads', function () {
    assert.ok(this.plugin)
  })
})

describe('load_config', function () {
  it('confirms that configs have been loaded', function (done) {
    this.plugin.load_config()
    assert.strictEqual(this.plugin.cfg.main.secret, "secret-phrase-goes-here")
    done()
  })
})

describe('uses text fixtures', function () {
  it('sets up a connection', function (done) {
    this.connection = fixtures.connection.createConnection({})
    assert.ok(this.connection.server)
    done()
  })

  it('sets up a transaction', function (done) {
    this.connection = fixtures.connection.createConnection({})
    this.connection.init_transaction()
    assert.ok(this.connection.transaction.header)
    done()
  })
})

describe('hook_data_post', function () {
  beforeEach(function () {
    this.plugin.load_config()

    this.plugin.cfg.main = {secret: "secret-phrase-goes-here"}
    this.from_header = '<test@example.com>'
    this.date_header = 'Sat, 08 Feb 2025 07:38:09 +0000 (UTC)'
    this.message_id  = '<test@example.com>'
  })

  it('missing Message-ID header', function (done) {
    this.message_id = ''
    const amalgam = `${this.from_header}:${this.date_header}:${this.message_id}:${this.plugin.cfg.main.secret}`

    const expected_hash = createHash('md5').update(amalgam).digest('hex')

    this.connection.transaction.header.add('From', this.from_header)
    this.connection.transaction.header.add('Date', this.date_header)

    this.plugin.hook_data_post((code, msg) => {
      assert.equal(code, undefined)
      assert.equal(msg, undefined)
      const hash = this.connection.transaction.header.get_decoded('X-Null-Hash')
      assert.strictEqual(hash, expected_hash)

      done()
    }, this.connection)
  })

  it('missing From, Date, and Message-ID headers', function (done) {
    this.from_header = ''
    this.date_header = ''
    this.message_id  = ''
    const amalgam = `${this.from_header}:${this.date_header}:${this.message_id}:${this.plugin.cfg.main.secret}`

    const expected_hash = createHash('md5').update(amalgam).digest('hex')

    this.plugin.hook_data_post((code, msg) => {
      assert.equal(code, undefined)
      assert.equal(msg, undefined)
      const hash = this.connection.transaction.header.get_decoded('X-Null-Hash')
      assert.strictEqual(hash, expected_hash)

      done()
    }, this.connection)
  })

  it('missing secret phrase', function (done) {
    delete this.plugin.cfg.main.secret

    const amalgam = `${this.from_header}:${this.date_header}:${this.message_id}:${this.plugin.cfg.main.secret}`

    const expected_hash = createHash('md5').update(amalgam).digest('hex')

    this.connection.transaction.header.add('From', this.from_header)
    this.connection.transaction.header.add('Date', this.date_header)
    this.connection.transaction.header.add('Message-ID', this.message_id)
    this.plugin.cfg.main = {}

    this.plugin.hook_data_post((code, msg) => {
      assert.equal(code, undefined)
      assert.equal(msg, undefined)

      const hash = this.connection.transaction.header.get_decoded('X-Null-Hash')
      assert.strictEqual(hash, expected_hash)

      done()
    }, this.connection)
  })

  it('has secret phrase', function (done) {
    const amalgam = `${this.from_header}:${this.date_header}:${this.message_id}:${this.plugin.cfg.main.secret}`

    const expected_hash = createHash('md5').update(amalgam).digest('hex')

    this.connection.transaction.header.add('Message-ID', this.message_id)
    this.connection.transaction.header.add('From', this.from_header)
    this.connection.transaction.header.add('Date', this.date_header)

    this.plugin.hook_data_post((code, msg) => {
      assert.equal(code, undefined)
      assert.equal(msg, undefined)

      const hash = this.connection.transaction.header.get_decoded('X-Null-Hash')
      assert.strictEqual(hash, expected_hash)

      done()
    }, this.connection)
  })
})
