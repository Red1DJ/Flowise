# Trading Backtest Tool - Integration Guide

## Overview

The Trading Backtest tool is now integrated into Flowise as a custom tool. It provides multi-level backtesting capabilities for crypto and stock trading strategies.

## Architecture

```
TradingBacktest/
├── backtestEngine.js       # Core backtesting engine (JavaScript)
├── backtestEngine.ts       # Core backtesting engine (TypeScript)
├── TradingBacktest.js      # Flowise node wrapper (JavaScript)
├── TradingBacktest.ts      # Flowise node wrapper (TypeScript)
├── tradingBacktestCLI.js   # Standalone CLI script
├── trading.svg             # Node icon
├── README.md               # Main documentation
├── EXAMPLES.md             # Usage examples
├── test.js                 # Comprehensive test suite
└── INTEGRATION.md          # This file
```

## How It Works

### 1. Flowise Integration

The tool is automatically loaded by Flowise's NodesPool system:

```javascript
// packages/server/src/NodesPool.ts
// Automatically discovers and loads all nodes from:
// flowise-components/dist/nodes/tools/TradingBacktest/
```

When Flowise starts, it:
1. Scans the `nodes/tools/` directory
2. Finds `TradingBacktest.js` (or compiled `TradingBacktest.ts`)
3. Creates an instance of `TradingBacktest_Tools`
4. Registers it as a LangChain Tool

### 2. Node Structure

The Flowise node follows the standard INode interface:

```typescript
interface INode {
    label: string          // "Trading Backtest"
    name: string           // "tradingBacktest"
    type: string           // "TradingBacktest"
    icon: string           // "trading.svg"
    category: string       // "Tools"
    description: string    // Tool description
    baseClasses: string[]  // ["TradingBacktest", "Tool"]
    inputs?: INodeParams[] // Configuration inputs
    init(): Promise<any>   // Initialization function
}
```

### 3. LangChain Tool Integration

The tool extends LangChain's `Tool` class:

```javascript
class TradingBacktestTool extends Tool {
    name = 'trading_backtest'
    description = '...'
    
    async _call(input) {
        // Parse input
        // Run backtest
        // Return formatted result
    }
}
```

This makes it compatible with:
- OpenAI Functions Agent
- Conversational Agent
- ReAct Agent
- Any LangChain agent that supports tools

## Using the Tool

### In Flowise UI

1. **Add to Canvas**
   - Drag "Trading Backtest" from Tools category
   - Optionally configure data directory

2. **Connect to Agent**
   ```
   [LLM] → [Agent] → [Trading Backtest Tool]
                 ↓
            [User Input]
   ```

3. **Query Examples**
   - "Backtest BTC from 2023-01-01 to 2023-12-31"
   - "Find best strategy for ETH in Q1 2023 with minimum 0.5% profit"
   - "What indicators work best for AAPL from June to September 2023?"

### As Standalone Script

```bash
cd packages/components/nodes/tools/TradingBacktest
node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31
```

### Programmatically

```javascript
const { BacktestEngine } = require('./backtestEngine')

const engine = new BacktestEngine()
const result = await engine.runBacktest({
    symbol: 'BTC',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    minProfitLossPercent: 0.2
})
```

## Input Format

When used through an agent, the tool expects input in this format:

```
symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2
```

Parameters:
- `symbol` (required): Crypto or stock ticker symbol
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `minProfit` (optional): Minimum profit/loss % (default: 0.2)

## Output Format

The tool returns a formatted string:

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

## Backtesting Levels

### Level 1: Single Indicators
Tests individual indicators with multiple parameter sets:
- MACD with 3 different configurations
- RSI with 3 different configurations
- Bollinger Bands with 3 different configurations

### Level 2: Combined Indicators
Tests combinations of indicators:
- MACD + RSI
- MACD + BB
- RSI + BB
- MACD + RSI + BB

Signals must agree across all indicators to trigger a trade.

### Level 3: Dynamic Indicators
Adapts indicator parameters based on market volatility:
- High volatility: Wider RSI bands (75/25)
- Low volatility: Standard RSI bands (70/30)

### Level 4: Neural Network
Pattern recognition approach:
- Analyzes price patterns over 10-period lookback
- Identifies uptrends and downtrends
- Simple pattern matching (can be enhanced with ML libraries)

## Data Storage

### Cache Structure
```
trading_data/
├── BTC_2023-01-01_2023-12-31.json  # Date-specific cache
├── ETH_2023-01-01_2023-12-31.json
├── BTC_latest.json                  # Continuously updated
└── ETH_latest.json
```

### Cache Behavior
- Files older than 24 hours are refreshed
- New data is merged with existing data
- Deduplication by timestamp
- Sorted chronologically

## Performance Considerations

### Optimization
1. **Caching**: Historical data is cached locally
2. **Incremental Updates**: Only new data is fetched
3. **Parallel Execution**: Multiple backtests can run simultaneously

### Scalability
- Each symbol's data is cached independently
- File-based storage (can be upgraded to database)
- Configurable data directory

## Customization

### Adding New Indicators

1. Add calculation method:
```javascript
calculateMyIndicator(data, params) {
    // Calculate indicator values
    const signals = []
    // Generate buy/sell signals
    return signals
}
```

2. Add to parameter sets:
```javascript
getMyIndicatorParamSets() {
    return [
        { param1: value1, param2: value2 },
        // More configurations
    ]
}
```

3. Include in backtesting levels:
```javascript
case 'MyIndicator':
    signals = this.calculateMyIndicator(data, params)
    break
```

### Integrating Real Data APIs

Replace `fetchFromAPI()` method:

```javascript
async fetchFromAPI(symbol, startDate, endDate) {
    // Example: Alpha Vantage
    const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            apikey: process.env.ALPHA_VANTAGE_KEY
        }
    })
    
    // Transform to standard format
    return transformData(response.data)
}
```

### Enhancing ML Capabilities

Use TensorFlow.js for advanced pattern recognition:

```javascript
const tf = require('@tensorflow/tfjs-node')

async backtestNeuralNetwork(data) {
    // Create and train a model
    const model = tf.sequential({
        layers: [
            tf.layers.dense({ units: 50, activation: 'relu', inputShape: [10] }),
            tf.layers.dense({ units: 3, activation: 'softmax' })
        ]
    })
    
    // Train on historical patterns
    // Make predictions
}
```

## Testing

Run comprehensive tests:
```bash
node test.js
```

Test coverage:
- Single indicator strategies
- Combined indicators
- Data caching
- Multiple symbols
- Different date ranges
- Edge cases (no profitable strategy)

## Security Considerations

1. **Input Validation**
   - Date format validation
   - Symbol sanitization
   - Parameter bounds checking

2. **File System**
   - Configurable data directory
   - Path traversal prevention
   - File size limits (future enhancement)

3. **Rate Limiting**
   - API call throttling (when using real APIs)
   - Cache-first strategy

## Future Enhancements

### Short Term
1. Real API integration (Alpha Vantage, Binance, etc.)
2. Additional technical indicators (Stochastic, VWAP, etc.)
3. Risk management (stop-loss, take-profit)
4. Transaction cost simulation

### Medium Term
1. Multi-timeframe analysis (1h, 4h, 1d, etc.)
2. Portfolio backtesting (multiple symbols)
3. Advanced ML models (LSTM, Transformers)
4. Performance visualization

### Long Term
1. Paper trading integration
2. Real-time signal generation
3. Automated strategy optimization
4. Social trading features

## Troubleshooting

### Tool Not Appearing in Flowise

1. Check build output:
   ```bash
   cd packages/components
   yarn build
   ```

2. Verify file structure:
   ```bash
   ls dist/nodes/tools/TradingBacktest/
   ```

3. Check server logs for errors

### Backtest Not Finding Strategies

1. Lower minimum profit requirement
2. Use longer date range (3+ months)
3. Try different symbols
4. Check data quality

### Performance Issues

1. Clear old cache files
2. Reduce date range
3. Limit concurrent backtests
4. Consider database instead of file storage

## Support

For issues or questions:
1. Check EXAMPLES.md for usage patterns
2. Run test.js to verify functionality
3. Review Flowise documentation for node integration
4. Open GitHub issue with details

## License

Same as Flowise - MIT License
