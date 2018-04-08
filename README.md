Aftership Reliable Emailer
=========
[![Build Status](https://travis-ci.com/leoskyrocker/aftership-reliable-emailer.svg?token=yX2wHppsYTF4kzifxutq&branch=master)](https://travis-ci.com/leoskyrocker/aftership-reliable-emailer)

A module that allows emails to be sent reliably by picking available services.

## How it works
This module is designed to hide away from users what email services it is using under the hood.

##### Module Lifecycle
1. Check for the supported email services which are correctly configured
2. Choose one of them to use upon user request to send emails
3. If there's network issues, then the server will retry with another email service

## Retry Mechanism

By default, it will retry 3 times for each configured email services.

If there's network error working with one service, it will rotate to the next service and retry.

If the error is something other than network errors, it will not retry.

## Supported Email Services
- Sendgrid
- Mailgun
- Coming Soon..

## Installation

1. Append this line to .npmrc in your app's root directory, or globally per your needs. \*
`@leoskyrocker:registry=https://my-npm-registry.herokuapp.com`
2. Run `npm install`
3. Follow below guides to enable the services you need

	##### Enable Mailgun
	Set `MAILGUN_API_KEY` and `MAILGUN_SENDER_DOMAIN` in your system's env variables.

	##### Enable Sendgrid
	Set `SENDGRID_API_KEY` in your system's env variables.

**Note** By default, the module will only enable a service if it is correctly configured upon initializing a `ReliableEmailSender` instance. If you changed the configuration in runtime, you'd need to initialize a new `ReliableEmailSender`.

\* This is because the module (and all the scoped `@leoskyrocker` modules) is located in the above private npm registry.

## Usage

In all places you need the sender:

```
import ReliableMailer from '@leoskyrocker/aftership-reliable-emailer'

const mailer = new ReliableMailer()

const result = mailer.send({
  from: 'YOUR NAME <YOURNAME@aftership.com>',
  subject: "HEY MAN",
  text: "I'm from AfterCar",
  to: "dearfriend@afterrocket.com"
})

if (result.succeeded) { console.log("Your email has been sent successfully") }
```

\* A email will then be magically sent via an available service.

## API

#### Mailer#send(email_data)
##### email_data
```
{
  from: 'YOUR NAME <YOURNAME@aftership.com>',
  subject: "HEY MAN",
  text: "I'm from AfterCar",
  to: "dearfriend@afterrocket.com"
}
```
##### Returns
```
{succeeded: <boolean>, tryCount: <int>, error: [undefined, obj, String]}
```

## Running Locally

Run `npm start`. See more detail on what it does in package.json.

## Deployment on Heroku

In general, follow the [standard instructions](https://devcenter.heroku.com/articles/deploying-nodejs) on deploying NodeJS app.

In a nutshell, it boils down to:
1. Create a Heroku account
2. Run in terminal:
	```
	heroku login
	heroku create
    git push heroku master
	```

## Tests

Our tests use [Mocha](https://github.com/mochajs/mocha) (Framework), [Chai](https://github.com/chaijs/chai) (Assertions), and [Nock](https://github.com/node-nock/nock) (HTTP Requests Mock).

Run  `npm test` under the project root. See more detail on what it does in package.json.

## Setup Linting

We follow the airbnb styles with a number of overrides. Check .eslint.yml for more details.

Please check out the [integration docs](https://eslint.org/docs/user-guide/integrations) for setting up eslint in your favorite IDE.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Future Work
##### More Supported Email Services
One can simply add a new email service class that abstracts the interaction with the specific 3rd party, and add it to the list of senders in the `ReliableEmailService` class.
