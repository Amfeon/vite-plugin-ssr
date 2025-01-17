export { debug }

import type { createDebugger, Debug } from '@brillout/debug'

var _debug: undefined | typeof debug
function debug(...args: Parameters<Debug>) {
  if (!_debug) {
    // We use this trick instead of `import { createDebugger } from '../../utils/debug` in order to ensure that the `debug` mechanism is only loaded on the server-side
    _debug = (
      globalThis as any as { __brillout_debug_createDebugger?: typeof createDebugger }
    ).__brillout_debug_createDebugger?.('vps:routing')
  }
  if (_debug) {
    _debug(...args)
  }
}
