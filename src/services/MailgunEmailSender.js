import mailgun from 'mailgun-js'

class MailgunEmailSender {
  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY
    this.domain = process.env.MAILGUN_SENDER_DOMAIN
    this.mgMail = this.apiKey && this.domain && new mailgun({
      apiKey: this.apiKey,
      domain: this.domain
    })
  }

  async successfullyConfigured() {
    if (typeof this._configSucceeded !== 'undefined') { return this._configSucceeded }
    if (!this.apiKey || !this.domain) { return false }

    try {
      await this.mgMail.get(`/${this.domain}/log`)
      this._configSucceeded = true
    } catch (err) {
      this._configSucceeded = false
    }

    return this._configSucceeded
  }

  async send(data) {
    if (!this.successfullyConfigured()) {
      return {succeeded: false, error: 'Mailgun is not configured.', isNetworkingError: false}
    }

    try {
      await this.mgMail.messages().send(data)
      return {succeeded: true}
    } catch(error) {
      return {succeeded: false, error, isNetworkingError: this._isNetworkingError(error)}
    }
  }

  _isNetworkingError(error) {
    return error.code === 'ETIMEDOUT' || (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo')
  }
}

export default MailgunEmailSender
