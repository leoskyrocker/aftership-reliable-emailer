import _ from 'lodash'

import MailgunEmailSender from './MailgunEmailSender'
import SendgridEmailSender from './SendgridEmailSender'

const SECONDS_TO_WAIT_BEFORE_RETRYING = 0.5
const NUM_RETRIES_FOR_EACH_SERVICE = 3

class ReliableEmailSender {
  constructor() {
    this._senders = [this._mailgunEmailSender(), this._sendgridEmailSender()]
    this.usableServices = []
    this._senders.forEach(async (sender) => {
      if (await sender.successfullyConfigured()) {
        this.usableServices.push(sender)
      }
    })
    this._currentEmailServiceIdx = 0
  }

  currentEmailService() {
    return this.usableServices[this._currentEmailServiceIdx]
  }

  hasAvailableServices() {
    return this.usableServices.length > 0
  }

  async send(data) {
    if (!this.hasAvailableServices()) { return {succeeded: false, error: 'No services are currently available in our reliable service =/', tryCount: 1} }

    let result = null
    let tryCount = 1
    let shouldContinueRetry = true

    while(shouldContinueRetry) {
      result = await this.currentEmailService().send(data)

      shouldContinueRetry =
        !result.succeeded
        && tryCount < this.usableServices.length * NUM_RETRIES_FOR_EACH_SERVICE
        && result.isNetworkingError

      if (shouldContinueRetry) {
        await new Promise(resolve => setTimeout(
          resolve, SECONDS_TO_WAIT_BEFORE_RETRYING * 1000
        ))
        this._rotateEmailService()
        tryCount++
      }
    }

    return Object.assign({}, result, {tryCount})
  }

  _rotateEmailService() {
    this._currentEmailServiceIdx = (this._currentEmailServiceIdx + 1) % this.usableServices.length
  }

  _mailgunEmailSender() {
    this._mailgunSender = this._mailgunSender || new MailgunEmailSender()
    return this._mailgunSender
  }

  _sendgridEmailSender() {
    this._sendgridSender = this._sendgridSender || new SendgridEmailSender()
    return this._sendgridSender
  }
}

export default ReliableEmailSender
