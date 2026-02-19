#!/usr/bin/env node

/**
 * Trading Backtest CLI - Production Grade
 * Standalone script to backtest trading strategies
 * 
 * Features:
 * - Comprehensive input validation
 * - Graceful error handling
 * - Helpful error messages
 * - Progress indicators
 * 
 * Usage:
 *   node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31 --min-profit 0.2
 */

const { BacktestEngine } = require('./backtestEngine')
const path = require('path')

/**
 * Main CLI function
 */
async function main() {
    const args = parseArgs(process.argv.slice(2))

    // Show help if no arguments or help flag
    if (args.help || Object.keys(args).length === 0) {
        showHelp()
        process.exit(0)
    }

    // Validate required arguments
    const validation = validateArgs(args)
    if (!validation.valid) {
        console.error('Error:', validation.error)
        console.error('')
        showHelp()
        process.exit(1)
    }

    const dataDir = args['data-dir'] || path.join(process.cwd(), 'trading_data')
    const minProfit = parseFloat(args['min-profit'] || '0.2')

    // Validate minProfit is a valid number
    if (isNaN(minProfit) || !isFinite(minProfit)) {
        console.error('Error: min-profit must be a valid number')
        process.exit(1)
    }

    printHeader(args, dataDir, minProfit)

    try {
        const engine = new BacktestEngine(dataDir, minProfit)

        console.log('Running multi-level backtest...')
        console.log('Level 1: Single indicator strategies...')
        console.log('Level 2: Combined indicator strategies...')
        console.log('Level 3: Dynamic indicator strategies...')
        console.log('Level 4: Neural network approach...')
        console.log('')

        const result = await engine.runBacktest({
            symbol: args.symbol,
            startDate: args.start,
            endDate: args.end,
            minProfitLossPercent: minProfit
        })

        printResults(result)
        process.exit(0)
        
    } catch (error) {
        console.error('')
        console.error('='.repeat(60))
        console.error('❌ BACKTEST FAILED')
        console.error('='.repeat(60))
        console.error('')
        console.error('Error:', error.message)
        console.error('')
        
        // Provide helpful suggestions based on error type
        if (error.message.includes('Invalid symbol')) {
            console.error('Suggestion: Use only letters, numbers, hyphens, and underscores')
            console.error('Example: BTC, ETH, AAPL, MSFT-USD')
        } else if (error.message.includes('Invalid date') || error.message.includes('date range')) {
            console.error('Suggestion: Ensure dates are in YYYY-MM-DD format')
            console.error('Example: --start 2023-01-01 --end 2023-12-31')
        } else if (error.message.includes('Insufficient data')) {
            console.error('Suggestion: Try a longer date range or different symbol')
        } else if (error.message.includes('data directory')) {
            console.error('Suggestion: Ensure the data directory is writable')
            console.error('Check permissions or specify a different directory with --data-dir')
        }
        
        console.error('')
        process.exit(1)
    }
}

/**
 * Validate command line arguments
 * @param {Object} args - Parsed arguments
 * @returns {Object} Validation result with {valid: boolean, error: string}
 */
function validateArgs(args) {
    if (!args.symbol) {
        return { valid: false, error: 'Missing required argument: --symbol' }
    }
    
    if (!args.start) {
        return { valid: false, error: 'Missing required argument: --start' }
    }
    
    if (!args.end) {
        return { valid: false, error: 'Missing required argument: --end' }
    }
    
    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(args.start)) {
        return { valid: false, error: 'Invalid start date format. Use YYYY-MM-DD' }
    }
    
    if (!dateRegex.test(args.end)) {
        return { valid: false, error: 'Invalid end date format. Use YYYY-MM-DD' }
    }
    
    // Validate date values
    const startDate = new Date(args.start)
    const endDate = new Date(args.end)
    
    if (isNaN(startDate.getTime())) {
        return { valid: false, error: `Invalid start date: ${args.start}` }
    }
    
    if (isNaN(endDate.getTime())) {
        return { valid: false, error: `Invalid end date: ${args.end}` }
    }
    
    if (startDate >= endDate) {
        return { valid: false, error: 'Start date must be before end date' }
    }
    
    return { valid: true }
}

/**
 * Print header with configuration
 */
function printHeader(args, dataDir, minProfit) {
    console.log('='.repeat(60))
    console.log('Trading Strategy Backtest')
    console.log('='.repeat(60))
    console.log(`Symbol: ${args.symbol}`)
    console.log(`Start Date: ${args.start}`)
    console.log(`End Date: ${args.end}`)
    console.log(`Minimum P/L: ${minProfit}%`)
    console.log(`Data Directory: ${dataDir}`)
    console.log('='.repeat(60))
    console.log('')
}

/**
 * Print backtest results
 */
function printResults(result) {
    console.log('='.repeat(60))
    console.log('BACKTEST RESULTS')
    console.log('='.repeat(60))
    console.log('')

    if (!result || result.level === 0) {
        console.log('❌ No profitable strategy found with the given criteria.')
        console.log('')
        console.log('Try:')
        console.log('  - Adjusting the date range')
        console.log('  - Lowering the minimum profit requirement')
        console.log('  - Testing a different symbol')
    } else {
        console.log(`✅ Most Effective Strategy Found (Level ${result.level})`)
        console.log('')
        console.log(`Strategy: ${result.strategy}`)
        console.log(`Profit/Loss: ${safeToFixed(result.profitLossPercent, 2)}%`)
        console.log(`Win Rate: ${safeToFixed(result.winRate, 2)}%`)
        console.log(`Total Trades: ${result.totalTrades}`)
        console.log('')
        
        if (result.indicators && result.indicators.length > 0) {
            console.log('Indicators:')
            for (const indicator of result.indicators) {
                if (indicator && indicator.name && indicator.params) {
                    const params = Object.entries(indicator.params)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(', ')
                    console.log(`  • ${indicator.name}(${params})`)
                }
            }
        }
    }

    console.log('='.repeat(60))
}

/**
 * Safely format number to fixed decimal places
 */
function safeToFixed(value, decimals) {
    if (typeof value !== 'number' || !isFinite(value)) {
        return '0.00'
    }
    try {
        return value.toFixed(decimals)
    } catch (error) {
        return '0.00'
    }
}

/**
 * Show help message
 */
function showHelp() {
    console.log('Usage: node tradingBacktestCLI.js --symbol <SYMBOL> --start <START_DATE> --end <END_DATE> [OPTIONS]')
    console.log('')
    console.log('Required Arguments:')
    console.log('  --symbol       Trading symbol (e.g., BTC, ETH, AAPL, TSLA)')
    console.log('  --start        Start date in YYYY-MM-DD format')
    console.log('  --end          End date in YYYY-MM-DD format')
    console.log('')
    console.log('Optional Arguments:')
    console.log('  --min-profit   Minimum profit/loss percentage (default: 0.2)')
    console.log('  --data-dir     Directory to store historical data (default: ./trading_data)')
    console.log('  --help         Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31')
    console.log('  node tradingBacktestCLI.js --symbol ETH --start 2023-06-01 --end 2023-09-30 --min-profit 0.5')
    console.log('  node tradingBacktestCLI.js --symbol AAPL --start 2023-01-01 --end 2023-12-31 --data-dir /tmp/data')
    console.log('')
}

/**
 * Parse command line arguments
 * @param {Array<string>} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
    const result = {}
    
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2)
            
            // Check for flags without values
            if (key === 'help' || key === 'version') {
                result[key] = true
                continue
            }
            
            const value = args[i + 1]
            if (value && !value.startsWith('--')) {
                result[key] = value
                i++
            } else {
                console.warn(`Warning: No value provided for --${key}`)
            }
        }
    }
    
    return result
}

// Run if executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('')
        console.error('Unexpected error:', error.message)
        console.error('')
        if (error.stack) {
            console.error('Stack trace:')
            console.error(error.stack)
        }
        process.exit(1)
    })
}

module.exports = { main }
