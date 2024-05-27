import { KeyAliasSchema } from 'packages/common';

export function isKeyOfTypeAliasSchema<Entity = any>(
  key: any
): key is KeyAliasSchema<Entity> {
  return !!(
    typeof (key as KeyAliasSchema<Entity>) === 'object' &&
    (key as KeyAliasSchema<Entity>).alias
  );
}
