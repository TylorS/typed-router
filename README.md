# @typed/router

A simple functional router for TypeScript.

## Get It
```sh
npm install --save @typed/router
# or
yarn add @typed/router
```

## API

<details>
  <summary id="matchRoute">matchRoute&ltA&gt(url: Route, routes: Routes&ltA&gt, parameters: Record&ltstring, any&gt = {}): Match&ltA&gt</summary>
  <p>Matches a url against a series of routes. Routes can be nested as needed.<br>Additional parameters can be passed in to be used with matched callbacks.</p>


  <p><strong>Example:</strong></p>

```typescript
import { matchRoute } from '@typed/router'

const { path, value } = matchRoute('/home/foo', {
  '/bar': () => 123,
  '/home/foo': () => 456,
})
```

</details>
