import { buildRegexForKeyMatch } from 'packages/core/src/helpers/build-regex-for-key-match';

export function keyMatchesSchema(
  pattern: string,
  key: string,
  interpolations: string[]
) {
  const { exp: keySchemaExp } = buildRegexForKeyMatch(pattern, interpolations);

  const values = keySchemaExp.exec(key);
  return !!values;
}
