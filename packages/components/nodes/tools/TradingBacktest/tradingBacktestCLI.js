#!/usr/bin/env node

/**
 * Trading Backtest CLI
 * Standalone script to backtest trading strategies
 * 
 * Usage:
 *   node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31 --min-profit 0.2
 */

const { BacktestEngine } = require('./backtestEngine')
const path = require('path')

async function main() {
    const args = parseArgs(process.argv.slice(2))

    if (!args.symbol || !args.start || !args.end) {
        console.log('Usage: node tradingBacktestCLI.js --symbol <SYMBOL> --start <START_DATE> --end <END_DATE> [--min-profit <MIN_PROFIT>]')
        console.log('')
        console.log('Example:')
        console.log('  node tradingBacktestCLI.js --symbol BTC --start 2023-01-01 --end 2023-12-31 --min-profit 0.2')
        console.log('')
        console.log('Parameters:')
        console.log('  --symbol       Crypto or stock symbol (e.g., BTC, ETH, AAPL, TSLA)')
        console.log('  --start        Start date in YYYY-MM-DD format')
        console.log('  --end          End date in YYYY-MM-DD format')
        console.log('  --min-profit   Minimum profit/loss percentage (default: 0.2)')
        console.log('  --data-dir     Directory to store historical data (default: ./trading_data)')
        process.exit(1)
    }

    const dataDir = args['data-dir'] || path.join(process.cwd(), 'trading_data')
    const minProfit = parseFloat(args['min-profit'] || '0.2')

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

    console.log('='.repeat(60))
    console.log('BACKTEST RESULTS')
    console.log('='.repeat(60))

    if (result.level === 0) {
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
        console.log(`Profit/Loss: ${result.profitLossPercent.toFixed(2)}%`)
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`)
        console.log(`Total Trades: ${result.totalTrades}`)
        console.log('')
        console.log('Indicators:')
        for (const indicator of result.indicators) {
            const params = Object.entries(indicator.params)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ')
            console.log(`  • ${indicator.name}(${params})`)
        }
    }

    console.log('='.repeat(60))
}

function parseArgs(args) {
    const result = {}
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2)
            const value = args[i + 1]
            if (value && !value.startsWith('--')) {
                result[key] = value
                i++
            }
        }
    }
    return result
}

// Run if executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Error:', error.message)
        process.exit(1)
    })
}

module.exports = { main }
