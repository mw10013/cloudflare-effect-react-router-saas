import {
  Cause,
  Config,
  ConfigError,
  Data,
  Effect,
  Either,
  Predicate,
  Schedule,
} from "effect";
import * as ConfigEx from "./ConfigEx";
import { D1Error } from "./D1";

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
