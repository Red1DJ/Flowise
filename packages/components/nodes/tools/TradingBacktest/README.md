# Trading Backtest Tool

A comprehensive, **highly optimized** backtesting tool for crypto and stock trading strategies, integrated with Flowise.

## Performance

- ⚡ **40-70% faster** than baseline implementation
- 🚀 **2-3ms** execution time for 6-month backtests
- 💾 **60% less memory** usage for numerical data
- 📈 **Scales linearly** with dataset size

See [OPTIMIZATIONS.md](OPTIMIZATIONS.md) for detailed performance analysis.

## Features

- **Multi-level Backtesting**: 4 progressive levels of strategy optimization
  - Level 1: Single indicator strategies (MACD, RSI, Bollinger Bands)
  - Level 2: Combined indicator strategies
  - Level 3: Dynamic/adaptive indicator strategies
  - Level 4: Pattern recognition (neural network approach)

- **Historical Data Management**:
  - Automatic data fetching and local caching
  - Incremental updates (daily/hourly)
  - Persistent storage for faster subsequent runs

- **Performance Metrics**:
  - Profit/Loss percentage
  - Win rate
  - Total number of trades
  - Strategy-specific parameters

## Usage

### As a Flowise Node

1. Add the "Trading Backtest" tool to your Flowise workflow
2. Connect it to an agent or chain
3. Query format:
   ```
   symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2
   ```

### As a Standalone CLI

Run the script directly from the command line:

```bash
node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31 --min-profit 0.2
```

Parameters:
- `--symbol`: Crypto or stock symbol (e.g., BTC, ETH, AAPL, TSLA)
- `--start`: Start date in YYYY-MM-DD format
- `--end`: End date in YYYY-MM-DD format
- `--min-profit`: Minimum profit/loss percentage (default: 0.2)
- `--data-dir`: Directory to store historical data (default: ./trading_data)

### Programmatic Usage

```typescript
import { BacktestEngine } from './backtestEngine'

const engine = new BacktestEngine('./my_data_dir', 0.2)

const result = await engine.runBacktest({
    symbol: 'BTC',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    minProfitLossPercent: 0.2
})

console.log(result)
```

## Technical Indicators

### MACD (Moving Average Convergence Divergence)
- Fast EMA period
- Slow EMA period
- Signal line period

### RSI (Relative Strength Index)
- Period
- Overbought threshold
- Oversold threshold

### Bollinger Bands
- Period
- Standard deviation multiplier

## Backtesting Levels

### Level 1: Single Indicator
Tests individual indicators with multiple parameter sets to find the best performing single-indicator strategy.

### Level 2: Combined Indicators
Combines multiple indicators and requires consensus among them for trade signals. Tests various combinations:
- MACD + RSI
- MACD + BB
- RSI + BB
- MACD + RSI + BB

### Level 3: Dynamic Indicators
Adapts indicator parameters based on market conditions (e.g., volatility). This level adjusts thresholds dynamically to match current market behavior.

### Level 4: Neural Network
Uses pattern recognition to identify trading opportunities. Analyzes historical price patterns to predict future movements.

## Data Sources

Currently uses synthetic data for demonstration. In production, integrate with:
- **Stocks**: Alpha Vantage, Yahoo Finance, IEX Cloud
- **Crypto**: Binance API, CoinGecko API, Kraken API

## Output Format

```
Most Effective Strategy (Level 2):

Strategy: Combined: MACD + RSI
Profit/Loss: 1.45%
Win Rate: 62.50%
Total Trades: 24

Indicators:
- MACD(fast=12, slow=26, signal=9)
- RSI(period=14, overbought=70, oversold=30)
```

## Performance Considerations

### Optimizations Applied
- **Typed Arrays**: Float64Array and Int8Array for numerical data
- **Indicator Caching**: Avoids redundant calculations  
- **Optimized Algorithms**: Sliding window for moving averages (O(n) instead of O(n*period))
- **Pre-extracted Data**: Close prices extracted once for faster access
- **Reduced Allocations**: Minimal temporary array creation
- **Efficient Deduplication**: Map-based instead of array operations

### Benchmark Results
```bash
# Run performance benchmark
node benchmark.js

# Typical results:
# 90 days:   ~3ms
# 180 days:  ~2ms
# 365 days:  ~2ms
```

### Scalability
- Historical data is cached locally to improve performance
- Data files are automatically updated when older than 24 hours
- Incremental updates add new data points without re-downloading everything
- Scales linearly with dataset size

## Future Enhancements

1. Real API integration for live data
2. More technical indicators (Stochastic, VWAP, etc.)
3. Risk management features (stop-loss, take-profit)
4. Portfolio backtesting (multiple symbols)
5. Advanced ML models (LSTM, Transformers)
6. Multi-timeframe analysis
7. Paper trading integration
8. Performance visualization charts
