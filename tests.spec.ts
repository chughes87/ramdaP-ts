import { lensIndex, toUpper, negate, inc, dec } from 'ramda';
import {
  chainP,
  delayMap,
  serialMap,
  overP,
  pipeP,
  tapP,
  sleep,
} from './index';

describe('ramdaP-ts', () => {
  test('chainP', () => {
    const duplicate = (n: any) => Promise.resolve([n, n]);
    const result = chainP(duplicate)([1, 2, 3]);

    expect(result).resolves.toEqual([1, 1, 2, 2, 3, 3]);
  });

  test('overP', () => {
    const headLens = lensIndex(0);
    const toUpperP = (x: any): Promise<any> => Promise.resolve(toUpper(x));
    const result = overP(headLens, toUpperP)(['foo', 'bar', 'baz']);

    expect(result).resolves.toEqual(['FOO', 'bar', 'baz']);
  });

  describe('pipeP', () => {
    it('should handle resolves', () => {
      const result = pipeP<number, number>([
        dec,
        (x: number) => Promise.resolve(negate(x)),
        (y: number) => Promise.resolve(inc(y)),
      ])(4);

      expect(result).resolves.toEqual(-2);
    });

    it('should handle rejects', () => {
      const mockError = 'oops';
      const mockMod = 'ie';
      const result = pipeP<number, number>([
          dec,
          () => Promise.reject(new Error(mockError)),
          (y: number) => Promise.resolve(inc(y)),
        ],
        ((e: Error) => Promise.reject(e.message + mockMod))
      )(4);

      expect(result).rejects.toEqual(mockError + mockMod);
    });
  });

  test('tapP', () => {
    const result = tapP((x: any) => Promise.resolve(x + 1))(1);

    expect(result).resolves.toEqual(1);
  });
  jest.useFakeTimers();

  describe('serialMap', () => {
    it('should execute the promise returning functions provided in a strictly serial manner', async () => {
      const resolvers: ((value?: string) => void)[] = [];
      let latestCall = null;

      // const result = serialMap((x: number, index: number) => {
      //   console.log('in the map');
      //   latestCall = index;
      //   return new Promise((resolve: (value: string) => void) => resolvers.push(resolve));
      // })([1, 2, 3]);
      await sleep(0);
      console.log(JSON.stringify(resolvers));
      // expect(latestCall).toBe(0);
      // console.log('end');
      // resolvers[0]();
      // expect(latestCall).toBe(1);
      // resolvers[1]();
      // expect(latestCall).toBe(2);
      // resolvers[2]('woot');
      // expect(result).resolves.toEqual('woot');
    });
  });

  // describe("delayMap", () => {
  //   test("does something after 200ms", () => {
  //     const doSomething = jest.fn();


  //     jest.advanceTimersByTime(1);

  //     expect(doSomething).toHaveBeenCalled();
  //   });
  // });
});