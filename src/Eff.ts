import { HKT } from './HKT'
import { Monad } from './Monad'
import { Lazy, Function1 } from './function'

export type URI = 'Eff'

export type HKTEff<E, A> = HKT<HKT<URI, E>, A>

export type Pure<A> = Eff<never, A>

export class Eff<E, A> implements HKTEff<E, A> {
  static of = of
  __hkt: HKT<URI, E>
  __hkta: A
  constructor(private value: Lazy<A>) {}
  run(): A {
    return this.value()
  }
  map<B>(f: Function1<A, B>): Eff<E, B> {
    return new Eff<E, B>(() => f(this.run()))
  }
  ap<E2, B>(fab: Eff<E2, Function1<A, B>>): Eff<E | E2, B> {
    return new Eff<E | E2, B>(() => fab.run()(this.run()))
  }
  chain<E2, B>(f: Function1<A, Eff<E2, B>>): Eff<E | E2, B> {
    return new Eff<E | E2, B>(() => f(this.run()).run())
  }
}

export function map<E, A, B>(f: Function1<A, B>, fa: HKTEff<E, A>): Eff<E, B> {
  return (fa as Eff<E, A>).map(f)
}

export function of<E, A>(a: A): Eff<E, A> {
  return new Eff<E, A>(() => a)
}

export function ap<E, A, B>(fab: HKTEff<E, Function1<A, B>>, fa: HKTEff<E, A>): Eff<E, B> {
  return (fa as Eff<E, A>).ap(fab as Eff<E, Function1<A, B>>)
}

export function chain<E, A, B>(f: Function1<A, HKTEff<E, B>>, fa: HKTEff<E, A>): Eff<E, B> {
  return (fa as Eff<E, A>).chain(f as Function1<A, Eff<E, B>>)
}

// tslint:disable-next-line no-unused-expression
;(
  { map, of, ap, chain } as (
    Monad<HKT<URI, any>>
  )
)
