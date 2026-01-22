/**
 * Utility types for the SplitSync application
 * Provides TypeScript utility types for common transformations
 */

/**
 * Makes all properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

/**
 * Makes all properties optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Makes specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Makes specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Makes all properties deeply readonly
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P]
}

/**
 * Makes all properties deeply writable (removes readonly)
 */
export type WritableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WritableDeep<T[P]> : T[P]
}

/**
 * Extracts the return type of a function
 */
export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any

/**
 * Extracts the argument types of a function
 */
export type ArgumentsType<T extends (...args: any) => any> = T extends (
  ...args: infer A
) => any
  ? A
  : never

/**
 * Makes all properties of an object mutable (for arrays of objects)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * Creates a type by picking specific keys from T
 */
export type PickByValue<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
>

/**
 * Creates a type by omitting specific keys from T
 */
export type OmitByValue<T, V> = Omit<
  T,
  { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
>

/**
 * Makes all properties of T nullable except K
 */
export type NullableExcept<T, K extends keyof T> = PartialBy<T, K> & {
  [P in K]: T[P]
}

/**
 * Extracts the promise type from a Promise
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T

/**
 * Extracts the array type from an array
 */
export type ArrayType<T> = T extends (infer U)[] ? U : T

/**
 * Creates a union type of all property values in T
 */
export type ValueOf<T> = T[keyof T]

/**
 * Creates a type that is either T or an array of T
 */
export type OneOrMany<T> = T | T[]

/**
 * Creates a deep partial type (nested objects become partial)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Creates a type with only the required properties
 */
export type OnlyRequired<T> = {
  [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K]
}

/**
 * Creates a type with only the optional properties
 */
export type OnlyOptional<T> = {
  [K in keyof T as {} extends Pick<T, K> ? K : never]?: T[K]
}

/**
 * Merges two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U

/**
 * Conditionally apply a type
 */
export type ConditionalType<T, U, V> = T extends U ? V : never

/**
 * Creates a type where keys are prefixed
 */
export type PrefixedKeys<T, P extends string> = {
  [K in keyof T as `${P}${K & string}`]: T[K]
}

/**
 * Creates a type where keys are suffixed
 */
export type SuffixedKeys<T, S extends string> = {
  [K in keyof T as `${K & string}${S}`]: T[K]
}

/**
 * Extracts keys of T that match type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Creates a tuple of length N
 */
export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N
  ? R
  : Tuple<T, N, [...R, T]>

/**
 * Adds methods to a type
 */
export type WithMethods<T, M extends Record<string, any>> = T & M

/**
 * Removes null and undefined from a type
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * Makes specific properties readonly
 */
export type ReadonlyBy<T, K extends keyof T> = Omit<T, K> & {
  readonly [P in K]: T[P]
}

/**
 * Makes specific properties writable
 */
export type WritableBy<T, K extends keyof T> = Omit<T, K> & {
  -readonly [P in K]: T[P]
}

/**
 * Extracts the instance type of a class
 */
export type InstanceType<T extends new (...args: any) => any> = T extends new (
  ...args: any
) => infer R
  ? R
  : any

/**
 * Extracts the parameters of a constructor
 */
export type ConstructorParameters<T extends new (...args: any) => any> = T extends new (
  ...args: infer P
) => any
  ? P
  : never

/**
 * Creates a type that matches any of the provided types
 */
export type OneOf<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First | OneOf<Rest>
  : never

/**
 * Creates a type that matches all of the provided types (intersection)
 */
export type AllOf<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First & AllOf<Rest>
  : {}

/**
 * Extracts the error type from a promise that might reject
 */
export type PromiseErrorType<T> = T extends Promise<any>
  ? never
  : T extends Error
  ? T
  : Error

/**
 * Creates a type for a record with specific value types
 */
export type TypedRecord<K extends string | number, V> = Record<K, V>

/**
 * Creates a type that enforces exact property types
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : Shape
  : never

/**
 * Type guard for checking if a value is not null/undefined
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

/**
 * Type guard for checking if a value is not undefined
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * Type guard for checking if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value != null
}

/**
 * Type guard for checking if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null
}

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Type guard for checking if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard for checking if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard for checking if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Type guard for checking if a value is a function
 */
export function isFunction<T extends (...args: any) => any>(
  value: unknown
): value is T {
  return typeof value === 'function'
}

/**
 * Type guard for checking if a value is a date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * Type guard for checking if a value is a promise
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return isNonNullObject(value) && 'then' in value && typeof value.then === 'function'
}

/**
 * Asserts that a value is not null/undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value == null) {
    throw new Error(message || 'Expected value to be defined')
  }
}

/**
 * Asserts that a value is of a specific type
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message?: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message || 'Type assertion failed')
  }
}

/**
 * Narrows a type using a type guard
 */
export function narrowType<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): T | null {
  return guard(value) ? value : null
}

/**
 * Safely gets a nested property from an object
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  return obj?.[key]
}

/**
 * Safely gets a deeply nested property from an object
 */
export function safeGetDeep<T, K1 extends keyof T>(
  obj: T | null | undefined,
  key1: K1
): T[K1] | undefined
export function safeGetDeep<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2
): T[K1][K2] | undefined
export function safeGetDeep<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2,
  key3: K3
): T[K1][K2][K3] | undefined
export function safeGetDeep(obj: any, ...keys: (string | number | symbol)[]): any {
  return keys.reduce((acc, key) => acc?.[key], obj)
}

/**
 * Creates a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any
  }

  if (obj instanceof Object) {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * Deep merges two objects
 */
export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const output = { ...target } as T & U

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key as keyof U])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof U] })
        } else {
          ;(output as any)[key] = deepMerge(
            target[key as keyof T],
            source[key as keyof U]
          )
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof U] })
      }
    })
  }

  return output
}

/**
 * Checks if a value is a plain object
 */
function isObject(item: unknown): item is Record<string, any> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Omit keys from an object (runtime version of Omit type)
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

/**
 * Pick keys from an object (runtime version of Pick type)
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Creates a type-safe enum from an object
 */
export function createEnum<T extends Record<string, string | number>>(
  obj: T
): Readonly<T> {
  return Object.freeze(obj)
}

/**
 * Creates a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Creates a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
