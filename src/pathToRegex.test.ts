import { Test, describe, given, it } from '@typed/test'

import { pathToRegex } from './pathToRegex'

export const test: Test = describe(`pathToRegex`, [
  given(`a path`, [
    it(`returns a Regular Expression and Params`, ({ equal }) => {
      const path = '/:id'
      const url = '/123'

      const { regex, params } = pathToRegex(path)

      const match = regex.exec(url)

      equal(url, match.input)
      equal([{ name: 'id', pattern: '[a-zA-Z0-9-_]+', required: true }], params)
    }),
  ]),
])
