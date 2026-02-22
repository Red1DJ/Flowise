# Trading Backtest Tool - Usage Examples

## Standalone CLI Usage

### Basic Example
```bash
node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31
```

### With Custom Minimum Profit
```bash
node tradingBacktestCLI.js --symbol ETH --start 2023-01-01 --end 2023-12-31 --min-profit 0.5
```

### With Custom Data Directory
```bash
node tradingBacktestCLI.js --symbol AAPL --start 2023-01-01 --end 2023-12-31 --data-dir /path/to/data
```

## Flowise Node Usage

### 1. Add the Tool to Your Workflow
1. Open Flowise UI
2. Add the "Trading Backtest" tool from the Tools category
3. Optionally configure the data directory

### 2. Connect to an Agent
The tool works best when connected to an agent (like OpenAI Functions Agent or Conversational Agent).

### 3. Query Examples

Ask your agent:
- "Backtest BTC from January 1, 2023 to December 31, 2023"
- "Find the best trading strategy for ETH from June to September 2023"
- "What's the most profitable trading strategy for AAPL from Q1 2023?"

The agent will automatically format the query in the correct format:
```
symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2
```

## Programmatic Usage

```javascript
const { BacktestEngine } = require('./backtestEngine')

const engine = new BacktestEngine('./my_data', 0.2)

async function runBacktest() {
    const result = await engine.runBacktest({
        symbol: 'BTC',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        minProfitLossPercent: 0.2
    })

    console.log('Strategy:', result.strategy)
    console.log('Profit/Loss:', result.profitLossPercent + '%')
    console.log('Win Rate:', result.winRate + '%')
    console.log('Total Trades:', result.totalTrades)
    console.log('Level:', result.level)
    
    result.indicators.forEach(ind => {
        console.log(`Indicator: ${ind.name}`, ind.params)
    })
}

runBacktest()
```

## Understanding Output

### Example Output
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

### Fields Explained

- **Level**: Indicates which backtesting level found the strategy (1-4)
  - Level 1: Single indicator
  - Level 2: Combined indicators
  - Level 3: Dynamic indicators
  - Level 4: Neural network approach

- **Strategy**: Name and configuration of the winning strategy

- **Profit/Loss**: Average profit/loss percentage per trade

- **Win Rate**: Percentage of profitable trades

- **Total Trades**: Number of trades executed during backtest period

- **Indicators**: List of technical indicators used with their parameters

## Tips for Best Results

1. **Date Range**: Use at least 3 months of data for meaningful results
2. **Minimum Profit**: Start with 0.2% and adjust based on your risk tolerance
3. **Data Updates**: The tool automatically caches data and updates it daily
4. **Multiple Symbols**: Test different symbols to find the best opportunities
5. **Combine with Research**: Use backtest results as one input in your decision-making process

## Customization

### Adding New Indicators
Edit `backtestEngine.js` and add your custom indicator calculation:

```javascript
calculateMyIndicator(data, params) {
    // Your indicator logic here
    const signals = []
    // ...
    return signals
}
```

### Adjusting Parameters
Modify parameter sets in the getter methods:
- `getMACDParamSets()`
- `getRSIParamSets()`
- `getBBParamSets()`

## Limitations

1. **Synthetic Data**: Currently uses synthetic data for demonstration
   - For production, integrate with real APIs (see README.md)

2. **Simple Strategies**: The neural network approach is simplified
   - Can be enhanced with proper ML libraries

3. **No Transaction Costs**: Backtest doesn't account for fees
   - Real trading includes slippage and commissions

4. **Past Performance**: Historical results don't guarantee future performance
   - Use as a research tool, not investment advice

## Next Steps

1. Integrate with real data providers:
   - Alpha Vantage for stocks
   - Binance/CoinGecko for crypto

2. Add risk management:
   - Stop-loss orders
   - Position sizing
   - Drawdown limits

3. Enhance ML models:
   - Use TensorFlow.js or brain.js
   - Train on historical patterns

4. Add visualization:
   - Chart equity curves
   - Show indicator plots
   - Display trade history
