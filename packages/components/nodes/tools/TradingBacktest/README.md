# Trading Backtest Tool

A comprehensive backtesting tool for crypto and stock trading strategies, integrated with Flowise.

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

- Historical data is cached locally to improve performance
- Data files are automatically updated when older than 24 hours
- Incremental updates add new data points without re-downloading everything

## Future Enhancements

1. Real API integration for live data
2. More technical indicators (Stochastic, VWAP, etc.)
3. Risk management features (stop-loss, take-profit)
4. Portfolio backtesting (multiple symbols)
5. Advanced ML models (LSTM, Transformers)
6. Multi-timeframe analysis
7. Paper trading integration
8. Performance visualization charts
