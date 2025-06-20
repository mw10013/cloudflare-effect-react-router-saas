import { Cause, Config, ConfigError, Data, Effect, Either, Predicate, Schedule } from 'effect'
import { dual } from 'effect/Function'
import * as ConfigEx from './ConfigEx'

// https://gist.github.com/rxliuli/be31cbded41ef7eac6ae0da9070c8ef8

export class D1Error extends Data.TaggedError('D1Error')<{
  message: string
  cause: Error
}> {}

export class D1 extends Effect.Service<D1>()('D1', {
  accessors: true,
  effect: Effect.gen(function* () {
    const d1 = yield* ConfigEx.object('D1').pipe(
      Config.mapOrFail((object) =>
        'prepare' in object && typeof object.prepare === 'function' && 'withSession' in object && typeof object.withSession === 'function'
          ? Either.right(object as D1Database)
          : Either.left(ConfigError.InvalidData([], `Expected a D1 database but received ${object}`))
      )
    )
    const tryPromise = <A>(evaluate: (signal: AbortSignal) => PromiseLike<A>) =>
      Effect.tryPromise(evaluate).pipe(
        Effect.mapError((error) =>
          // https://developers.cloudflare.com/d1/observability/debug-d1/#error-list
          Cause.isUnknownException(error) && Predicate.isError(error.error) && error.error.message.startsWith('D1_')
            ? new D1Error({ message: error.error.message, cause: error.error })
            : error
        ),
        Effect.tapError((error) => Effect.log(error)),
        Effect.retry({
          // https://www.sqlite.org/rescode.html
          while: (error) =>
            Predicate.isTagged(error, 'D1Error') &&
            !['SQLITE_CONSTRAINT', 'SQLITE_ERROR', 'SQLITE_MISMATCH'].some((pattern) => error.message.includes(pattern)),
          times: 2,
          schedule: Schedule.exponential('1 second')
        })
      )
    return {
      prepare: (query: string) => d1.prepare(query),
      batch: (statements: D1PreparedStatement[]) => tryPromise(() => d1.batch(statements)),
      run: (statement: D1PreparedStatement) => tryPromise(() => statement.run()),
      first: <T>(statement: D1PreparedStatement) => tryPromise(() => statement.first<T>())
    }
  })
}) {}

export const bind = dual<
  (...values: unknown[]) => <E, R>(self: Effect.Effect<D1PreparedStatement, E, R>) => Effect.Effect<D1PreparedStatement, E, R>,
  <E, R>(...args: [Effect.Effect<D1PreparedStatement, E, R>, ...unknown[]]) => Effect.Effect<D1PreparedStatement, E, R>
>(
  (args) => Effect.isEffect(args[0]),
  (self, ...values) => Effect.map(self, (stmt) => stmt.bind(...values))
)

// import * as D1Ns from './D1'
// import { D1 } from './D1'
// yield* D1.prepare('select userId, email from users where userId = ?').pipe(D1Ns.bind(3)),

export class D1Session extends Effect.Service<D1Session>()("D1Session", {
  accessors: true,
  effect: Effect.gen(function* () {
    const d1 = yield* ConfigEx.object("D1").pipe(
      Config.mapOrFail((object) =>
        "prepare" in object &&
        typeof object.prepare === "function" &&
        "withSession" in object &&
        typeof object.withSession === "function"
          ? Either.right(object as D1Database)
          : Either.left(
              ConfigError.InvalidData(
                [],
                `Expected a D1 database but received ${object}`,
              ),
            ),
      ),
    );
    let d1DatabaseSession: D1DatabaseSession | null = null;
    let d1SessionBookmark: D1SessionBookmark | undefined = undefined;
    const getD1DatabaseSession = () => {
      if (!d1DatabaseSession) {
        d1DatabaseSession = d1.withSession(
          d1SessionBookmark ?? "first-unconstrained",
        );
      }
      return d1DatabaseSession;
    };
    const tryPromise = <A>(evaluate: (signal: AbortSignal) => PromiseLike<A>) =>
      Effect.tryPromise(evaluate).pipe(
        Effect.mapError((error) =>
          // https://developers.cloudflare.com/d1/observability/debug-d1/#error-list
          Cause.isUnknownException(error) &&
          Predicate.isError(error.error) &&
          error.error.message.startsWith("D1_")
            ? new D1Error({ message: error.error.message, cause: error.error })
            : error,
        ),
        Effect.tapError((error) => Effect.log(error)),
        Effect.retry({
          // https://www.sqlite.org/rescode.html
          while: (error) =>
            Predicate.isTagged(error, "D1Error") &&
            !["SQLITE_CONSTRAINT", "SQLITE_ERROR", "SQLITE_MISMATCH"].some(
              (pattern) => error.message.includes(pattern),
            ),
          times: 2,
          schedule: Schedule.exponential("1 second"),
        }),
      );
    return {
      setBookmark: (bookmark: D1SessionBookmark) => {
        d1SessionBookmark = bookmark;
      },
      getBookmark: () =>
        d1DatabaseSession ? d1DatabaseSession.getBookmark() : d1SessionBookmark,
      prepare: (query: string) => getD1DatabaseSession().prepare(query),
      batch: (statements: D1PreparedStatement[]) =>
        tryPromise(() => getD1DatabaseSession().batch(statements)),
      run: (statement: D1PreparedStatement) =>
        tryPromise(() => statement.run()),
      first: <T>(statement: D1PreparedStatement) =>
        tryPromise(() => statement.first<T>()),
    };
  }),
}) {}
