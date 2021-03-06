import { pipeWith, pipe, map, andThen, flatten, view, set, PipeWithFns, Lens } from 'ramda';

export const resolve = <T>(x: T): Promise<T> => Promise.resolve(x);

export const promiseAll = <T>(ps: Promise<T>[]): Promise<T[]> => Promise.all(ps);

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const pipeP = <I, O>(fns: PipeWithFns<I, Promise<O>>, onError?: (reason: Error) => Promise<O>) => (
    input: I,
  ) =>
    pipeWith<I, Promise<O>>(
      (fn: (value: unknown) => unknown, res: unknown) =>
        res instanceof Promise ? res.then((x) => fn(x)) : Promise.resolve(fn(res)),
      fns,
    )(input).catch(onError);

export const tapP = <T>(fn: (x: T) => Promise<unknown>) => (data: T): Promise<unknown> =>
  fn(data).then(() => data);

export const errorLogTapP = (message: string) => (error: Error): Promise<Error> => {
  console.log(`${message}, ${error.message}, ${error.stack}`);
  return Promise.reject(error);
};

export const serialMap = <I, O>(fn: (arg: I, index?: number) => Promise<O>) => (xs: I[]): Promise<Promise<O>[]> =>
  xs.reduce(
    (responses: Promise<Promise<O>[]>, x, index) =>
      responses.then((rs: Promise<O>[]) => {
        const promise = fn(x, index);
        return promise
          .then(() => [...rs, promise])
          .catch((e) => [...rs, Promise.reject(e)]);
      }),
    Promise.resolve([]),
  );

export const delayMap =
  <I, O>(sleepMs: number, fn: (arg: I, index?: number) => Promise<O>) =>
  (xs: I[]): Promise<Promise<O>[]> =>
    xs.reduce(
      (responses: Promise<Promise<O>[]>, x, index) =>
        responses.then(async (rs: Promise<O>[]) => {
          const promise = fn(x, index);
          if (sleepMs > 0) {
            await sleep(sleepMs);
          }

          return [...rs, promise];
        }),
      Promise.resolve([]),
    );

export const chainP = <I, O>(fn: (x: I) => Promise<O>) =>
  pipe(map(fn), promiseAll, andThen(flatten));

export const overP =
  <I, V>(lens: Lens<I, V>, fn: (x: unknown) => Promise<V>) => (obj: I): Promise<I> =>
    pipe(
      view(lens),
      fn,
      andThen((value: V): I => set<I, V>(lens, value, obj)),
    )(obj);
