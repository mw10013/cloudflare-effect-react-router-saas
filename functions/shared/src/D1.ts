import {
  Cause,
  Config,
  ConfigError,
  Effect,
  Either,
  Predicate,
  Schedule,
  Schema,
} from "effect";
import * as ConfigEx from "./ConfigEx";

// Journey to Optimized D1 Queries: https://gist.github.com/rxliuli/be31cbded41ef7eac6ae0da9070c8ef8

export class D1Error extends Schema.TaggedError<D1Error>()("D1Error", {
  message: Schema.String,
  cause: Schema.Defect,
}) {}

export class D1 extends Effect.Service<D1>()("D1", {
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
    let databaseSession: D1DatabaseSession | null = null;
    let sessionBookmark: D1SessionBookmark | undefined = undefined;
    const getDatabaseSession = () => {
      if (!databaseSession) {
        databaseSession = d1.withSession(
          sessionBookmark ?? "first-unconstrained",
        );
      }
      return databaseSession;
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
        sessionBookmark = bookmark;
      },
      getBookmark: () =>
        databaseSession ? databaseSession.getBookmark() : sessionBookmark,
      prepare: (query: string) => getDatabaseSession().prepare(query),
      batch: (statements: D1PreparedStatement[]) =>
        tryPromise(() => getDatabaseSession().batch(statements)),
      run: (statement: D1PreparedStatement) =>
        tryPromise(() => statement.run()),
      first: <T>(statement: D1PreparedStatement) =>
        tryPromise(() => statement.first<T>()),
    } as const;
  }),
}) {}
