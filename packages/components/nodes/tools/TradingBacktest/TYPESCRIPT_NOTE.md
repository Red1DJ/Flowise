# TypeScript Version Note

## Status

The JavaScript version (`backtestEngine.js`) has been fully optimized with all performance improvements.

The TypeScript version (`backtestEngine.ts`) serves as the source for type definitions and IDE support. 

## For Production Use

When building the Flowise components:

1. The TypeScript version should be updated to match the optimized JavaScript implementation
2. Run `tsc` to compile the optimized TypeScript code
3. The compiled output will have the same optimizations as the current JavaScript version

## Key Differences in Optimized Version

The optimized JavaScript version includes:
- Typed arrays (Float64Array, Int8Array)
- Indicator caching with Map
- Optimized algorithms for moving averages
- Pre-extracted close prices
- Reduced async/await overhead
- Efficient data structures

## Compatibility

The API remains 100% compatible. All function signatures are the same:
```typescript
runBacktest(config: BacktestConfig): Promise<BacktestResult>
```

No breaking changes to the external interface.

## Updating TypeScript Version

To update the TypeScript version with optimizations:

1. Add type definitions for typed arrays:
```typescript
const closes: Float64Array = new Float64Array(data.length)
const signals: Int8Array = new Int8Array(data.length)
```

2. Add cache property:
```typescript
private indicatorCache: Map<string, Int8Array> = new Map()
```

3. Update method signatures to use typed arrays where appropriate
4. Ensure all optimizations from JS version are applied

The current JavaScript version is production-ready and includes all optimizations.
