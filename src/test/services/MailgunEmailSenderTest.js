import {expect} from 'chai'
import nock from 'nock'
import MailgunEmailSender from '../../services/MailgunEmailSender'

describe('# MailgunEmailSender', () => {
  const env = Object.assign({}, process.env)

  beforeEach(() => {
    process.env.MAILGUN_API_KEY = 'testapikey'
    process.env.MAILGUN_SENDER_DOMAIN = 'testdomain'
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  it('will not be successfully configured if apiKey is absent', async () => {
    delete process.env.MAILGUN_API_KEY
    const mg = new MailgunEmailSender()
    expect(await mg.successfullyConfigured()).to.equal(false)
  })

  it('will not be successfully configured if domain is absent', async () => {
    delete process.env.MAILGUN_SENDER_DOMAIN
    const mg = new MailgunEmailSender()
    expect(await mg.successfullyConfigured()).to.equal(false)
  })

  it('will be successfully configured if apiKey and domain are present', async () => {
    const mg = new MailgunEmailSender()

    const scope = nock(/.*/).get(/.*/).reply(200)
    expect(await mg.successfullyConfigured()).to.equal(true)
    scope.isDone()
  })

  it('will send email successfully if configured correctly', async () => {
    const mg = new MailgunEmailSender()

    const scope = nock(/.*/).get(/.*/).reply(200)
    const postScope = nock(/.*/).post(/.*/).reply(200)
    const result = await mg.send({from: 'leo@gmail.com', subject: 'abc'})
    scope.isDone()
    postScope.isDone()

    expect(result.succeeded).to.equal(true)
  })
})
