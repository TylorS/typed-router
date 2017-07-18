export type Params = Readonly<object>

export type Routes<A> = {
  readonly [route: string]: ((parameters: Params) => A) | Routes<A>
}

export type Route = string

export type Match<A> = {
  readonly path: string | null
  readonly value: A | null
}
