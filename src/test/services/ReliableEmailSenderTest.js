import {expect} from 'chai'
import nock from 'nock'
import ReliableEmailSender from '../../services/ReliableEmailSender'

describe('# ReliableEmailSender', () => {
  const env = Object.assign({}, process.env)

  beforeEach(() => {
    process.env.MAILGUN_API_KEY = 'testapikey'
    process.env.MAILGUN_SENDER_DOMAIN = 'testdomain'
    process.env.SENDGRID_API_KEY = 'sendgridapikey'
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  it('can send email successfully', async () => {
    const sendgridScope = nock(/.*/).get(/v3\/scopes/).reply(200, {scopes: ['mail.send']})
    const scope = nock(/.*/).persist().get(/.*/).reply(200)
    const postScope = nock(/.*/).post(/.*/).reply(200)
    const sender = new ReliableEmailSender()

    await new Promise(resolve => setTimeout(resolve, 10))
    const result = await sender.send({from: 'leo@gmail.com', to: 'abc@gmail.com', subject: 'abc'})
    expect(result.succeeded).to.equal(true)
    expect(result.tryCount).to.equal(1)
    scope.isDone()
    postScope.isDone()
    sendgridScope.isDone()
  })

  it('retry with another service when one has network error', async () => {
    const sendgridScope = nock(/.*/).get(/v3\/scopes/).reply(200, {scopes: ['mail.send']})
    const scope = nock(/.*/).persist().get(/.*/).reply(200)
    const firstPostScope = nock(/.*/).post(/.*/).replyWithError({code: 'ETIMEDOUT'})
    const secondPostScope = nock(/.*/).post(/.*/).reply(200)
    const sender = new ReliableEmailSender()

    await new Promise(resolve => setTimeout(resolve, 10))
    const result = await sender.send({from: 'leo@gmail.com', to: 'abc@gmail.com', subject: 'abc'})
    expect(result.succeeded).to.equal(true)
    expect(result.tryCount).to.equal(2)
    scope.isDone()
    firstPostScope.isDone()
    secondPostScope.isDone()
    sendgridScope.isDone()
  })
})
