import { lensIndex, toUpper, negate, inc, dec } from 'ramda';
import {
  chainP,
  delayMap,
  serialMap,
  overP,
  pipeP,
  tapP,
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

  test('pipeP', () => {
    const result = pipeP<number, number>([
      dec,
      (x: number) => Promise.resolve(negate(x)),
      (y: number) => Promise.resolve(inc(y)),
    ])(4);

    expect(result).resolves.toEqual(-2);
  });

  test('tapP', () => {
    const result = tapP((x: any) => Promise.resolve(x + 1))(1);

    expect(result).resolves.toEqual(1);
  });
});