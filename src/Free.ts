import { HKT } from './HKT'
import { Functor } from './Functor'
import { Monad } from './Monad'
import { Function1 } from './function'

// Adapted from http://okmij.org/ftp/Computation/free-monad.html
// see test/Free.ts for a working example

export type URI = 'Free'

export type FreeF<F> = HKT<URI, F>

export type HKTFree<F, A> = HKT<FreeF<F>, A>

export type Free<F, A> = Pure<F, A> | Impure<F, A>

export interface FreeI<F, A> extends HKTFree<F, A> {
  map<B>(f: Function1<A, B>): Free<F, B>
  ap<B>(fab: Free<F, Function1<A, B>>): Free<F, B>
  chain<B>(f: Function1<A, Free<F, B>>): Free<F, B>
  fold<B>(of: Function1<A, B>, chain: Function1<HKT<F, Free<F, A>>, B>): B
}

export class Pure<F, A> implements FreeI<F, A> {
  static of = of
  __tag: 'Of' // tslint:disable-line variable-name
  __hkt: FreeF<F> // tslint:disable-line variable-name
  __hkta: A // tslint:disable-line variable-name
  constructor(public value: A) {}
  map<B>(f: Function1<A, B>): Free<F, B> {
    return new Pure<F, B>(f(this.value))
  }
  ap<B>(fab: Free<F, Function1<A, B>>): Free<F, B> {
    return fab.map(f => f(this.value))
  }
  chain<B>(f: Function1<A, Free<F, B>>): Free<F, B> {
    return f(this.value)
  }
  fold<B>(of: Function1<A, B>, chain: Function1<HKT<F, Free<F, A>>, B>): B {
    return of(this.value)
  }
  inspect() {
    return this.toString()
  }
  toString() {
    return `Of(${this.value})`
  }
}

export class Impure<F, A> implements FreeI<F, A> {
  static of = of
  __tag: 'Chain' // tslint:disable-line variable-name
  __hkt: FreeF<F> // tslint:disable-line variable-name
  __hkta: A // tslint:disable-line variable-name
  constructor(private functor: Functor<F>, public value: HKT<F, Free<F, A>>) {}
  map<B>(f: Function1<A, B>): Free<F, B> {
    return new Impure(this.functor, this.functor.map(x => x.map(f), this.value))
  }
  ap<B>(fab: Free<F, Function1<A, B>>): Free<F, B> {
    return new Impure(this.functor, this.functor.map(fa => fa.ap(fab), this.value))
  }
  chain<B>(f: Function1<A, Free<F, B>>): Free<F, B> {
    return new Impure(this.functor, this.functor.map(fa => fa.chain(f), this.value))
  }
  fold<B>(of: Function1<A, B>, chain: Function1<HKT<F, Free<F, A>>, B>): B {
    return chain(this.value)
  }
  inspect() {
    return this.toString()
  }
  toString() {
    return `Chain(${this.value})`
  }
}

export function pure<F, A>(a: A): Free<F, A> {
  return new Pure<F, A>(a)
}

export function impure<F, A>(functor: Functor<F>, ffa: HKT<F, Free<F, A>>): Free<F, A> {
  return new Impure<F, A>(functor, ffa)
}

export function fold<F, A, B>(of: Function1<A, B>, chain: Function1<HKT<F, Free<F, A>>, B>, fa: HKTFree<F, A>): B {
  return (fa as Free<F, A>).fold(of, chain)
}

export function of<F, A>(a: A): Free<F, A> {
  return new Pure<F, A>(a)
}

export function eta<F>(functor: Functor<F>): <A>(fa: HKT<F, A>) => Free<F, A> {
  return <A>(fa: HKT<F, A>) => new Impure(functor, functor.map(a => new Pure<F, A>(a), fa))
}

export function getMonad<F>(functor: Functor<F>): Monad<FreeF<F>> {

  function map<F, A, B>(f: Function1<A, B>, fa: HKTFree<F, A>): Free<F, B> {
    return (fa as Free<F, A>).map(f)
  }

  function ap<F, A, B>(fab: HKTFree<F, Function1<A, B>>, fa: HKTFree<F, A>): Free<F, B> {
    return (fa as Free<F, A>).ap(fab as Free<F, Function1<A, B>>)
  }

  function chain<F, A, B>(f: Function1<A, HKTFree<F, B>>, fa: HKTFree<F, A>): Free<F, B> {
    return (fa as Free<F, A>).chain(f as Function1<A, Free<F, B>>)
  }

  return {
    map,
    of,
    ap,
    chain
  }

}
