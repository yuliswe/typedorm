import { parseKey } from '../parse-key';
import { SparseIndexParseError } from '@typedorm/common';

describe('parseKey()', () => {
  it('should parse key and replace interpolation values with actual value', () => {
    const parsed = parseKey('USER#{{id}}', {
      id: '1111-2222',
    });

    expect(parsed).toEqual('USER#1111-2222');
  });

  it('should parse key with number', () => {
    const parsed = parseKey('USER#{{id}}', {
      id: 1111,
    });

    expect(parsed).toEqual('USER#1111');
  });

  it('should parse sparseIndex key', () => {
    const parsed = () =>
      parseKey(
        'USER#{{id}}#{{status}}',
        {
          id: 1111,
        },
        { isSparseIndex: true }
      );

    expect(parsed).toThrowError(SparseIndexParseError);
  });

  it('should parse key multiple interpolation occurrences', () => {
    const parsed = parseKey('USER#{{id}}#CLASS#{{classId}}', {
      id: 1111,
      classId: 'class-1232',
    });

    expect(parsed).toEqual('USER#1111#CLASS#class-1232');
  });

  it('should thrown an error when no mapping found in dictionary', () => {
    expect(() => parseKey('USER#{{id}}', {})).toThrowError(
      '"id" was referenced in USER#{{id}} but it\'s value could not be resolved.'
    );
  });
});
