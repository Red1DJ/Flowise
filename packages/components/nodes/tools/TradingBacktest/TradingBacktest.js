const { Tool } = require('langchain/tools')
const { BacktestEngine } = require('./backtestEngine')
const path = require('path')

class TradingBacktestTool extends Tool {
    constructor(dataDir) {
        super()
        this.name = 'trading_backtest'
        this.description = `Useful for backtesting trading strategies on crypto or stock symbols. 
    Input should be in format: "symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2"
    Returns the most effective trading strategy with specific indicator settings (MACD, RSI, BB).
    The tool uses 4 levels of backtesting: single indicators, combined indicators, dynamic indicators, and neural network approach.`

        // Use a directory in the server's data folder
        const defaultDataDir = path.join(process.cwd(), 'trading_data')
        this.engine = new BacktestEngine(dataDir || defaultDataDir)
    }

    async _call(input) {
        try {
            // Parse input
            const params = this.parseInput(input)

            if (!params.symbol || !params.startDate || !params.endDate) {
                return 'Error: Missing required parameters. Please provide symbol, startDate, and endDate.'
            }

            // Run backtest
            const result = await this.engine.runBacktest({
                symbol: params.symbol,
                startDate: params.startDate,
                endDate: params.endDate,
                minProfitLossPercent: params.minProfit || 0.2
            })

            // Format result
            return this.formatResult(result)
        } catch (error) {
            return `Error running backtest: ${error.message}`
        }
    }

    parseInput(input) {
        const params = {}
        const pairs = input.split(',')

        for (const pair of pairs) {
            const [key, value] = pair.split(':').map((s) => s.trim())
            if (key && value) {
                params[key] = value
            }
        }

        // Convert minProfit to number if present
        if (params.minProfit) {
            params.minProfit = parseFloat(params.minProfit)
        }

        return params
    }

    formatResult(result) {
        if (!result || result.level === 0) {
            return 'No profitable strategy found with the given criteria.'
        }

        let output = `Most Effective Strategy (Level ${result.level}):\n\n`
        output += `Strategy: ${result.strategy}\n`
        output += `Profit/Loss: ${result.profitLossPercent.toFixed(2)}%\n`
        output += `Win Rate: ${result.winRate.toFixed(2)}%\n`
        output += `Total Trades: ${result.totalTrades}\n\n`
        output += `Indicators:\n`

        for (const indicator of result.indicators) {
            output += `- ${indicator.name}(`
            const paramStr = Object.entries(indicator.params)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ')
            output += `${paramStr})\n`
        }

        return output
    }
}

class TradingBacktest_Tools {
    constructor() {
        this.label = 'Trading Backtest'
        this.name = 'tradingBacktest'
        this.type = 'TradingBacktest'
        this.icon = 'trading.svg'
        this.category = 'Tools'
        this.description = 'Backtest trading strategies on crypto/stock data with multi-level optimization'
        this.baseClasses = [this.type, 'Tool']
        this.inputs = [
            {
                label: 'Data Directory',
                name: 'dataDir',
                type: 'string',
                placeholder: './trading_data',
                optional: true,
                additionalParams: true,
                description: 'Directory to store historical trading data'
            }
        ]
    }

    async init(nodeData) {
        const dataDir = nodeData.inputs?.dataDir
        return new TradingBacktestTool(dataDir)
    }
}

module.exports = { nodeClass: TradingBacktest_Tools }
