import sendgridClient from '@sendgrid/client'
import sendgridMailer from '@sendgrid/mail'

class SendgridEmailSender {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY
    this.sgMailer = sendgridMailer
    this.sgClient = sendgridClient
    this.apiKey && this.sgMailer.setApiKey(process.env.SENDGRID_API_KEY)
    this.apiKey && this.sgClient.setApiKey(process.env.SENDGRID_API_KEY)
  }

  async successfullyConfigured() {
    if (typeof this._configSucceeded !== 'undefined') { return this._configSucceeded }
    if (!this.apiKey) { return false }

    try {
      const [response, body] = await this.sgClient.request({
        method: 'GET',
        url: '/v3/scopes'
      })
      if (!response.statusCode.toString().startsWith('2')) { throw 'Error Reaching Sendgrid' }
      this._configSucceeded = body.scopes.indexOf('mail.send') >= 0
    } catch (err) {
      this._configSucceeded = false
    }

    return this._configSucceeded
  }

  async send(data) {
    if (!this.successfullyConfigured()) {
      return {succeeded: false, error: 'Sendgrid is not configured.', isNetworkingError: false}
    }

    try {
      await this.sgMailer.send(data)
      return {succeeded: true}
    } catch(error) {
      return {succeeded: false, error: 'Something went wrong.', isNetworkingError: this._isNetworkingError(error)}
    }
  }

  _isNetworkingError(error) {
    return error.code === 'ETIMEDOUT' || (error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo')
  }
}

export default SendgridEmailSender
