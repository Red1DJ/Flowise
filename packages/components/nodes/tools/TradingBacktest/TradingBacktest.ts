import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Tool } from 'langchain/tools'
import { BacktestEngine } from './backtestEngine'
import * as path from 'path'

class TradingBacktestTool extends Tool {
    name = 'trading_backtest'
    description = `Useful for backtesting trading strategies on crypto or stock symbols. 
    Input should be in format: "symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2"
    Returns the most effective trading strategy with specific indicator settings (MACD, RSI, BB).
    The tool uses 4 levels of backtesting: single indicators, combined indicators, dynamic indicators, and neural network approach.`

    private engine: BacktestEngine

    constructor(dataDir?: string) {
        super()
        // Use a directory in the server's data folder
        const defaultDataDir = path.join(process.cwd(), 'trading_data')
        this.engine = new BacktestEngine(dataDir || defaultDataDir)
    }

    async _call(input: string): Promise<string> {
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
        } catch (error: any) {
            return `Error running backtest: ${error.message}`
        }
    }

    private parseInput(input: string): Record<string, any> {
        const params: Record<string, any> = {}
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

    private formatResult(result: any): string {
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

class TradingBacktest_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Trading Backtest'
        this.name = 'tradingBacktest'
        this.type = 'TradingBacktest'
        this.icon = 'trading.svg'
        this.category = 'Tools'
        this.description = 'Backtest trading strategies on crypto/stock data with multi-level optimization'
        this.baseClasses = [this.type, ...getBaseClasses(TradingBacktestTool)]
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

    async init(nodeData: INodeData): Promise<any> {
        const dataDir = nodeData.inputs?.dataDir as string
        return new TradingBacktestTool(dataDir)
    }
}

module.exports = { nodeClass: TradingBacktest_Tools }
