import { Test, describe, given, it } from '@typed/test'

import { matchRoute } from './matchRoute'

export const test: Test = describe(`match`, [
  given(`a URL and Routes`, [
    it('should match a basic path', assert => {
      const { path, value } = matchRoute('/home/foo', {
        '/bar': () => 123,
        '/home/foo': () => 456,
      })

      assert.equal(path, '/home/foo')
      assert.equal(value, 456)
    }),

    it('should match a root base path in a nested configuration', assert => {
      const { path, value } = matchRoute('/', {
        '/': () => 123,
        '/home': {
          '/': () => 456,
          '/foo': () => 789,
        },
      })

      assert.equal(path, '/')
      assert.equal(value, 123)
    }),

    it('should match a nested root path in a very nested configuration', assert => {
      const { path, value } = matchRoute('/home', {
        '/': () => 12,
        '/home': {
          '/': () => 34,
          '/foo': {
            '/': () => 56,
          },
        },
      })

      assert.equal(path, '/home/')
      assert.equal(value, 34)
    }),

    it('should match a nested root path in a very nested configuration', assert => {
      const { path, value } = matchRoute('/home/foo/bar', {
        '/': () => 12,
        '/home': {
          '/': () => 34,
          '/foo': {
            '/': () => 56,
            '/bar': () => 78,
          },
        },
      })

      assert.equal(path, '/home/foo/bar')
      assert.equal(value, 78)
    }),

    it("should match a base path having a match in a sibling's nested configuration", assert => {
      const { path, value } = matchRoute('/bar', {
        '/bar': () => 123,
        '/home': {
          '/': () => 456,
          '/foo': () => 789,
        },
      })

      assert.equal(path, '/bar')
      assert.equal(value, 123)
    }),

    it('should match a base path in a nested configuration', assert => {
      const { path, value } = matchRoute('/home', {
        '/bar': () => 123,
        '/home': {
          '/': () => 456,
          '/foo': () => 789,
        },
      })

      assert.equal(path, '/home/')
      assert.equal(value, 456)
    }),

    it('should match a basic path in a nested configuration', assert => {
      const { path, value } = matchRoute('/home/foo', {
        '/bar': () => 123,
        '/home': {
          '/foo': () => 456,
        },
      })

      assert.equal(path, '/home/foo')
      assert.equal(value, 456)
    }),

    it('should match a path on an incomplete pattern', assert => {
      const { path, value } = matchRoute('/home/foo', {
        '/bar': () => 123,
        '/home': () => 456,
      })

      assert.equal(path, '/home')
      assert.equal(value, 456)
    }),

    it('should match an incomplete pattern on multipart path', assert => {
      const { path, value } = matchRoute('/home/foo/bar', {
        '/home': {
          '/': () => 123,
          '/foo': () => 456,
        },
      })

      assert.equal(path, '/home/foo')
      assert.equal(value, 456)
    }),

    it('should not match a path overoptimistically', assert => {
      const { path, value } = matchRoute('/home/33/books/10', {
        '/': () => 123,
        '/authors': () => 234,
        '/books': {
          '/': () => 345,
          '/:id': () => 456,
        },
      })

      assert.equal(path, null)
      assert.equal(value, null)
    }),

    it('should return match to a notFound pattern if provided', assert => {
      const { path, value } = matchRoute<any>('/home/33/books/10', {
        '/': () => 123,
        '/authors': () => 234,
        '/books': {
          '/': () => 345,
          '/:id': () => 456,
        },
        '*': () => 'Route not defined',
      })

      assert.equal(path, '/home/33/books/10')
      assert.equal(value, 'Route not defined')
    }),

    it('should not prematurely match a notFound pattern', assert => {
      const { path, value } = matchRoute('/home/foo', {
        '*': () => 0,
        '/bar': () => 123,
        '/home': () => 456,
      })

      assert.equal(path, '/home')
      assert.equal(value, 456)
    }),

    it('should match a path with an extra trailing slash', assert => {
      const { path, value } = matchRoute('/home/foo/', {
        '/bar': () => 123,
        '/home': {
          '/foo': () => 456,
        },
      })

      assert.equal(path, '/home/foo')
      assert.equal(value, 456)
    }),

    it('should match a path with a parameter', assert => {
      const { path, value } = matchRoute<any>('/home/1736', {
        '/bar': () => 123,
        '/home/:id': ({ id }: { id: number }) => `id is ${id}`,
      })

      assert.equal(path, '/home/1736')
      assert.equal(value, 'id is 1736')
    }),

    it('should match a path with a parameter in a nested configuration', assert => {
      const { path, value } = matchRoute<any>('/home/1736', {
        '/bar': () => 123,
        '/home': {
          '/:id': ({ id }: { id: number }) => `id is ${id}`,
        },
      })

      assert.equal(path, '/home/1736')
      assert.equal(value, 'id is 1736')
    }),

    it('should match the base of a path with a parameter in a nested configuration', assert => {
      const { path, value } = matchRoute<string | number>('/1736', {
        '/bar': () => 123,
        '/:id': {
          '/': ({ id }: { id: number }) => `id is ${id}`,
          '/home': () => 789,
        },
      })

      assert.equal(path, '/1736/')
      assert.equal(value, 'id is 1736')
    }),

    it('should match more specific path in case many match', assert => {
      const { path, value } = matchRoute('/home/1736', {
        '/home/:id': ({ id }: { id: number }) => `id is ${id}`,
        '/': () => 'root',
      })

      assert.equal(path, '/home/1736')
      assert.equal(value, 'id is 1736')
    }),

    it('should match exact path in case many match', assert => {
      const { path, value } = matchRoute('/', {
        '/home/:id': ({ id }: { id: number }) => `id is ${id}`,
        '/': () => 'root',
      })

      assert.equal(path, '/')
      assert.equal(value, 'root')
    }),

    it('should not match unrelated paths that have with params', assert => {
      const { path, value } = matchRoute('/home/123', {
        '/': () => 'root',
        '/home/:id': ({ id }: { id: number }) => `home is ${id}`,
        '/external/:id': ({ id }: { id: number }) => `external is ${id}`,
      })

      assert.equal(path, '/home/123')
      assert.equal(value, 'home is 123')
    }),

    it('should partially match :key type params', assert => {
      const { path, value } = matchRoute('/home/123/456', {
        '/': () => 'root',
        '/home/:id': ({ id }: { id: number }) => `home is ${id}`,
        '/external/:id': ({ id }: { id: number }) => `external is ${id}`,
      })

      assert.equal(path, '/home/123')
      assert.equal(value, 'home is 123')
    }),

    it('should partially match multiple :key type params', assert => {
      const { path, value } = matchRoute('/home/123/456/something', {
        '/': () => 'root',
        '/home/:id/:other': ({ id, other }: { id: number; other: number }) => `${id}:${other}`,
        '/external/:id/:other': () => `external`,
      })

      assert.equal(path, '/home/123/456')
      assert.equal(value, '123:456')
    }),

    it('should not match a :key type route if no params are given', assert => {
      const { path, value } = matchRoute('/', {
        '/': () => 'root',
        '/:id': ({ id }: { id: number }) => `${id}`,
      })

      assert.equal(path, '/')
      assert.equal(value, 'root')
    }),

    it('should not match root path if notFound pattern exists', ({ equal }) => {
      const { path, value } = matchRoute('/home/foo', {
        '/': () => 'root',
        '*': () => 'notFound',
      })

      equal('/home/foo', path)
      equal('notFound', value)
    }),
  ]),

  given(`a Url, Routes, and additional parameters`, [
    it(`calls matches with additional parameters`, ({ equal }, done) => {
      const additionalParameters = { id: 1 }

      const routes = {
        '/': (params: typeof additionalParameters) => {
          equal(additionalParameters, params)
          done()
        },
      }

      matchRoute('/', routes, additionalParameters)
    }),
  ]),
])
