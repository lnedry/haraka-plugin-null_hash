// version 1.0.0    03/01/2025
// inserts X-Null-Hash header in outbound mail
// (hash of Date:, Subject:, From:, and secret phrase)

'use strict'

const {createHash} = require('node:crypto')

exports.register = function () {
    this.load_config()
}

exports.load_config = function () {
    this.cfg = this.config.get('null_hash.ini', () => {
        this.load_config()
    })
}

exports.hook_data_post = function (next, connection) {
    const {transaction} = connection

    const from_header = transaction.header.get_decoded('From')
    const date_header = transaction.header.get_decoded('Date')
    const message_id = transaction.header.get_decoded('Message-ID')

    const amalgam = `${from_header}:${date_header}:${message_id}:${this.cfg.main.secret}`
    connection.logdebug(this, `hook_data_post: amalgam: ${amalgam}`)

    const null_hash = createHash('md5').update(amalgam).digest('hex')

    connection.logdebug(this, `hook_data_post: null hash: ${null_hash}`)
    transaction.add_header('X-Null-Hash', null_hash)

    next()
}