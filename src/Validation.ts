import { Applicative } from './Applicative'
import { Semigroup } from './Semigroup'
import { Either, EitherF, isLeft, Left, map, of } from './Either'
import { Function1 } from './function'

export function getApplicative<L>(semigroup: Semigroup<L>): Applicative<EitherF<any>> {

  function ap<A, B>(fab: Either<L, Function1<A, B>>, fa: Either<L, A>): Either<L, B> {
    if (isLeft(fab) && isLeft(fa)) {
      return new Left<L, B>(semigroup.concat(fab.value, fa.value))
    }
    return fa.ap(fab)
  }

  return { map, of, ap }
}
