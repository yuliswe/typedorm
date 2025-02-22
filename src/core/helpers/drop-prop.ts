export function dropProp<T, K extends keyof T>(object: T, prop: K): Omit<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [prop]: propToDrop, ...updatedObj } = object;
  return updatedObj;
}
