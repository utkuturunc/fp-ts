import * as assert from 'assert'
import { eta, Free, of } from '../src/Free'
import * as state from '../src/State'
import { StateF } from '../src/State'

export type FState<S, A> = Free<StateF<S>, A>

export function getF<S>(): FState<S, S> {
  return eta<StateF<S>>(state)(state.get<S>())
}

export function putF<S>(s: S): FState<S, undefined> {
  return eta<StateF<S>>(state)(state.put<S>(s))
}

export function runFState<S, A>(sa: FState<S, A>, s: S): [A, S] {
  return sa.fold<[A, S]>(
    a => [a, s],
    ffa => {
      const [sa1, s1] = state.runState(ffa, s)
      return runFState(sa1, s1)
    }
  )
}

describe('Free', () => {

  it('run example', () => {
    const testState = putF(10)
      .chain(() => getF<number>())
      .chain(of)
    assert.deepEqual(runFState(testState, 0), [10, 10])
  })
})
