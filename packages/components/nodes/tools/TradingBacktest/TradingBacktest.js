const { Tool } = require('langchain/tools')
const { BacktestEngine } = require('./backtestEngine')
const path = require('path')

/**
 * Trading Backtest Tool for LangChain
 * Provides safe, validated backtesting of trading strategies
 */
class TradingBacktestTool extends Tool {
    /**
     * Create a new TradingBacktestTool instance
     * @param {string} [dataDir] - Directory for storing historical data
     */
    constructor(dataDir) {
        super()
        this.name = 'trading_backtest'
        this.description = `Useful for backtesting trading strategies on crypto or stock symbols. 
    Input should be in format: "symbol:BTC,startDate:2023-01-01,endDate:2023-12-31,minProfit:0.2"
    Returns the most effective trading strategy with specific indicator settings (MACD, RSI, BB).
    The tool uses 4 levels of backtesting: single indicators, combined indicators, dynamic indicators, and neural network approach.
    
    Requirements:
    - symbol: Trading symbol (alphanumeric, 1-20 characters)
    - startDate: Start date in YYYY-MM-DD format
    - endDate: End date in YYYY-MM-DD format (must be after startDate)
    - minProfit: (optional) Minimum profit percentage (default: 0.2)`

        try {
            // Use a directory in the server's data folder
            const defaultDataDir = path.join(process.cwd(), 'trading_data')
            this.engine = new BacktestEngine(dataDir || defaultDataDir)
        } catch (error) {
            throw new Error(`Failed to initialize backtest engine: ${error.message}`)
        }
    }

    /**
     * Execute the backtesting tool
     * @param {string} input - Comma-separated parameters
     * @returns {Promise<string>} Formatted backtest results
     */
    async _call(input) {
        try {
            // Validate input
            if (typeof input !== 'string' || input.trim().length === 0) {
                return 'Error: Input must be a non-empty string in format: symbol:BTC,startDate:2023-01-01,endDate:2023-12-31'
            }

            // Parse input
            const params = this.parseInput(input)

            // Validate required parameters
            if (!params.symbol) {
                return 'Error: Missing required parameter "symbol". Format: symbol:BTC,startDate:2023-01-01,endDate:2023-12-31'
            }
            if (!params.startDate) {
                return 'Error: Missing required parameter "startDate". Format: symbol:BTC,startDate:2023-01-01,endDate:2023-12-31'
            }
            if (!params.endDate) {
                return 'Error: Missing required parameter "endDate". Format: symbol:BTC,startDate:2023-01-01,endDate:2023-12-31'
            }

            // Validate minProfit if provided
            if (params.minProfit !== undefined && params.minProfit !== null) {
                if (isNaN(params.minProfit) || !isFinite(params.minProfit)) {
                    return 'Error: Invalid minProfit value. Must be a valid number.'
                }
            }

            // Run backtest with validated parameters
            const result = await this.engine.runBacktest({
                symbol: params.symbol,
                startDate: params.startDate,
                endDate: params.endDate,
                minProfitLossPercent: params.minProfit !== undefined ? params.minProfit : 0.2
            })

            // Format and return result
            return this.formatResult(result)
            
        } catch (error) {
            // Provide helpful error messages
            if (error.message.includes('Invalid symbol')) {
                return `Error: ${error.message}\nSymbol must contain only letters, numbers, hyphens, and underscores (1-20 characters).`
            }
            if (error.message.includes('Invalid date') || error.message.includes('date range')) {
                return `Error: ${error.message}\nDates must be in YYYY-MM-DD format, and endDate must be after startDate.`
            }
            if (error.message.includes('Insufficient data')) {
                return `Error: ${error.message}\nTry using a longer date range or different symbol.`
            }
            
            return `Error running backtest: ${error.message}`
        }
    }

    /**
     * Parse comma-separated input into parameters
     * @param {string} input - Input string to parse
     * @returns {Object} Parsed parameters
     */
    parseInput(input) {
        const params = {}
        
        try {
            const pairs = input.split(',')

            for (const pair of pairs) {
                const trimmedPair = pair.trim()
                if (!trimmedPair) continue
                
                const colonIndex = trimmedPair.indexOf(':')
                if (colonIndex === -1) {
                    console.warn(`Invalid parameter format (missing colon): ${trimmedPair}`)
                    continue
                }
                
                const key = trimmedPair.substring(0, colonIndex).trim()
                const value = trimmedPair.substring(colonIndex + 1).trim()
                
                if (key && value) {
                    params[key] = value
                }
            }

            // Convert minProfit to number if present
            if (params.minProfit) {
                const parsed = parseFloat(params.minProfit)
                params.minProfit = isNaN(parsed) ? null : parsed
            }
        } catch (error) {
            console.error(`Failed to parse input: ${error.message}`)
        }

        return params
    }

    /**
     * Format backtest results into readable string
     * @param {Object} result - Backtest result object
     * @returns {string} Formatted result string
     */
    formatResult(result) {
        if (!result || typeof result !== 'object') {
            return 'Error: Invalid backtest result'
        }
        
        if (result.level === 0) {
            return 'No profitable strategy found with the given criteria.\n\nSuggestions:\n' +
                   '- Try a longer date range\n' +
                   '- Lower the minimum profit requirement\n' +
                   '- Test a different trading symbol'
        }

        try {
            let output = `Most Effective Strategy (Level ${result.level}):\n\n`
            output += `Strategy: ${result.strategy}\n`
            output += `Profit/Loss: ${this.safeToFixed(result.profitLossPercent, 2)}%\n`
            output += `Win Rate: ${this.safeToFixed(result.winRate, 2)}%\n`
            output += `Total Trades: ${result.totalTrades || 0}\n\n`
            
            if (result.indicators && Array.isArray(result.indicators) && result.indicators.length > 0) {
                output += `Indicators:\n`
                
                for (const indicator of result.indicators) {
                    if (indicator && indicator.name) {
                        output += `- ${indicator.name}(`
                        
                        if (indicator.params && typeof indicator.params === 'object') {
                            const paramStr = Object.entries(indicator.params)
                                .map(([k, v]) => `${k}=${v}`)
                                .join(', ')
                            output += `${paramStr}`
                        }
                        
                        output += `)\n`
                    }
                }
            }

            return output
        } catch (error) {
            return `Error formatting result: ${error.message}`
        }
    }

    /**
     * Safely format number to fixed decimal places
     * @param {number} value - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number or '0.00'
     */
    safeToFixed(value, decimals) {
        if (typeof value !== 'number' || !isFinite(value)) {
            return '0.00'
        }
        try {
            return value.toFixed(decimals)
        } catch (error) {
            return '0.00'
        }
    }
}

/**
 * Flowise Node Class for Trading Backtest Tool
 */
class TradingBacktest_Tools {
    constructor() {
        this.label = 'Trading Backtest'
        this.name = 'tradingBacktest'
        this.type = 'TradingBacktest'
        this.icon = 'trading.svg'
        this.category = 'Tools'
        this.description = 'Backtest trading strategies on crypto/stock data with multi-level optimization and comprehensive safety checks'
        this.baseClasses = [this.type, 'Tool']
        this.inputs = [
            {
                label: 'Data Directory',
                name: 'dataDir',
                type: 'string',
                placeholder: './trading_data',
                optional: true,
                additionalParams: true,
                description: 'Directory to store historical trading data (must be writable)'
            }
        ]
    }

    /**
     * Initialize the tool
     * @param {Object} nodeData - Node configuration data
     * @returns {Promise<TradingBacktestTool>} Initialized tool instance
     */
    async init(nodeData) {
        try {
            const dataDir = nodeData.inputs?.dataDir
            
            // Validate dataDir if provided
            if (dataDir && typeof dataDir !== 'string') {
                throw new Error('Invalid data directory: must be a string')
            }
            
            return new TradingBacktestTool(dataDir)
        } catch (error) {
            throw new Error(`Failed to initialize Trading Backtest tool: ${error.message}`)
        }
    }
}

module.exports = { nodeClass: TradingBacktest_Tools }
