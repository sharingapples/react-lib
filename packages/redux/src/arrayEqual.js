/* global __DEV__ */

export default function arrayEqual(a1, a2) {
  if (__DEV__) {
    if (a1.length !== a2.length) {
      throw new Error('Array length for dependencies are expected to be equal. Make sure you are using the selector memoization correctly');
    }
  }

  for (let i = 0; i < a1.length; i += 1) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}
