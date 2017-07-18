import { Match, Params, Route, Routes } from './types'
import { Param, pathToRegex } from './pathToRegex'

export function matchRoute<A>(
  url: Route,
  routes: Routes<A>,
  parameters: Record<string, any> = {}
): Match<A> {
  return match(url, routes, { ...parameters }, { path: null, value: null })
}

function match<A>(
  url: Route,
  routes: Routes<A>,
  parameters: Record<string, any>,
  returnValue: { path: string | null; value: A | null }
): Match<A> {
  for (const route in routes) {
    if (isLessAccurateRoute(returnValue.path, route)) continue

    const { regex, params } = pathToRegex(route)

    const matches = regex.exec(url)

    if (!matches) continue

    findParams(params, parameters, matches)

    const fn = routes[route]
    const matchedUrl = matches[0]

    returnValue = findMatch(url, matchedUrl, parameters, fn)
  }

  returnValue.path = pathJoin(['/', returnValue.path])

  if (returnValue.path === '/' && url !== '/') returnValue = { path: null, value: null }

  if (!returnValue.path && routes['*'])
    returnValue = { path: url, value: (routes['*'] as Function)(parameters) }

  return returnValue
}

function findMatch(
  url: string,
  matchedUrl: string,
  parameters: Params,
  fn: Routes<any> | Function
) {
  if (typeof fn === 'object') {
    const nestedUrl = pathJoin(['/', url.replace(matchedUrl, '')])
    const { path, value } = matchRoute(nestedUrl, fn, parameters)

    return { path: pathJoin([matchedUrl, path]), value }
  }

  return { path: matchedUrl, value: fn(parameters) }
}

function isLessAccurateRoute(path: string, route: string): boolean {
  return path !== null && path.length > route.length
}

function findParams(
  params: Array<Param>,
  parameters: Record<string, any>,
  matches: RegExpExecArray
) {
  for (let i = 0; i < params.length; ++i) {
    const { name, pattern } = params[i]

    const paramMatches = new RegExp(pattern).exec(matches[i + 1])

    if (paramMatches) parameters[name] = parseParam(paramMatches[0])
  }
}

function parseParam(param: any): any {
  try {
    return JSON.parse(param)
  } catch (e) {
    return param
  }
}

function pathJoin(parts: Array<Route>): Route {
  const replace = new RegExp('/{1,}', 'g')

  return parts.join('/').replace(replace, '/')
}
