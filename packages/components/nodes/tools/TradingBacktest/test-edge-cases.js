#!/usr/bin/env node

/**
 * Comprehensive Edge Case Test Suite
 * Tests all safety features and error handling
 */

const { BacktestEngine } = require('./backtestEngine')
const path = require('path')

let passedTests = 0
let failedTests = 0

function test(description, testFn) {
    try {
        testFn()
        console.log(`✓ ${description}`)
        passedTests++
    } catch (error) {
        console.log(`✗ ${description}`)
        console.log(`  Error: ${error.message}`)
        failedTests++
    }
}

async function testAsync(description, testFn) {
    try {
        await testFn()
        console.log(`✓ ${description}`)
        passedTests++
    } catch (error) {
        console.log(`✗ ${description}`)
        console.log(`  Error: ${error.message}`)
        failedTests++
    }
}

async function runTests() {
    console.log('='.repeat(70))
    console.log('Trading Backtest Tool - Comprehensive Edge Case Tests')
    console.log('='.repeat(70))
    console.log('')

    // Constructor Validation Tests
    console.log('Constructor Validation Tests:')
    console.log('-'.repeat(70))
    
    test('Rejects invalid dataDir (number)', () => {
        try {
            new BacktestEngine(123)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid dataDir')) throw e
        }
    })
    
    test('Rejects invalid dataDir (empty string)', () => {
        try {
            new BacktestEngine('')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid dataDir')) throw e
        }
    })
    
    test('Rejects invalid minProfitLoss (string)', () => {
        try {
            new BacktestEngine('./test', 'invalid')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid minProfitLoss')) throw e
        }
    })
    
    test('Rejects invalid minProfitLoss (NaN)', () => {
        try {
            new BacktestEngine('./test', NaN)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid minProfitLoss')) throw e
        }
    })
    
    test('Rejects invalid minProfitLoss (Infinity)', () => {
        try {
            new BacktestEngine('./test', Infinity)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid minProfitLoss')) throw e
        }
    })
    
    test('Accepts valid constructor parameters', () => {
        new BacktestEngine('./test_edge_cases', 0.5)
    })
    
    console.log('')

    // Symbol Validation Tests
    console.log('Symbol Validation Tests:')
    console.log('-'.repeat(70))
    
    const engine = new BacktestEngine('./test_edge_cases')
    
    test('Rejects empty symbol', () => {
        try {
            engine.sanitizeSymbol('')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid symbol')) throw e
        }
    })
    
    test('Rejects non-string symbol', () => {
        try {
            engine.sanitizeSymbol(123)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid symbol')) throw e
        }
    })
    
    test('Rejects symbol with only special characters', () => {
        try {
            engine.sanitizeSymbol('!@#$%')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid symbol')) throw e
        }
    })
    
    test('Accepts valid symbol', () => {
        const result = engine.sanitizeSymbol('BTC-USD')
        if (result !== 'BTC-USD') throw new Error('Symbol not sanitized correctly')
    })
    
    test('Truncates long symbols', () => {
        const result = engine.sanitizeSymbol('A'.repeat(30))
        if (result.length !== 20) throw new Error('Symbol not truncated')
    })
    
    console.log('')

    // Date Validation Tests
    console.log('Date Validation Tests:')
    console.log('-'.repeat(70))
    
    test('Rejects invalid date format', () => {
        try {
            engine.validateDate('invalid', 'testDate')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be in YYYY-MM-DD format')) throw e
        }
    })
    
    test('Rejects non-existent date', () => {
        try {
            engine.validateDate('2023-02-30', 'testDate')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('not a valid date')) throw e
        }
    })
    
    test('Rejects date too far in past', () => {
        try {
            engine.validateDate('1800-01-01', 'testDate')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be between')) throw e
        }
    })
    
    test('Rejects date too far in future', () => {
        try {
            const futureDate = new Date()
            futureDate.setFullYear(futureDate.getFullYear() + 2)
            engine.validateDate(futureDate.toISOString().split('T')[0], 'testDate')
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be between')) throw e
        }
    })
    
    test('Accepts valid date', () => {
        const result = engine.validateDate('2023-01-01', 'testDate')
        if (!(result instanceof Date)) throw new Error('Should return Date object')
    })
    
    console.log('')

    // Backtest Configuration Tests
    console.log('Backtest Configuration Tests:')
    console.log('-'.repeat(70))
    
    await testAsync('Rejects missing config', async () => {
        try {
            await engine.runBacktest()
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Invalid config')) throw e
        }
    })
    
    await testAsync('Rejects missing symbol', async () => {
        try {
            await engine.runBacktest({ startDate: '2023-01-01', endDate: '2023-12-31' })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Missing required parameter: symbol')) throw e
        }
    })
    
    await testAsync('Rejects missing startDate', async () => {
        try {
            await engine.runBacktest({ symbol: 'BTC', endDate: '2023-12-31' })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Missing required parameter: startDate')) throw e
        }
    })
    
    await testAsync('Rejects missing endDate', async () => {
        try {
            await engine.runBacktest({ symbol: 'BTC', startDate: '2023-01-01' })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('Missing required parameter: endDate')) throw e
        }
    })
    
    await testAsync('Rejects reversed date range', async () => {
        try {
            await engine.runBacktest({ 
                symbol: 'BTC', 
                startDate: '2023-12-31', 
                endDate: '2023-01-01' 
            })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('startDate must be before endDate')) throw e
        }
    })
    
    await testAsync('Rejects date range too large', async () => {
        try {
            await engine.runBacktest({ 
                symbol: 'BTC', 
                startDate: '2010-01-01', 
                endDate: '2025-01-01' 
            })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('maximum range is 10 years')) throw e
        }
    })
    
    await testAsync('Rejects date range too small', async () => {
        try {
            await engine.runBacktest({ 
                symbol: 'BTC', 
                startDate: '2023-01-01', 
                endDate: '2023-01-01' 
            })
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('startDate and endDate cannot be the same')) throw e
        }
    })
    
    await testAsync('Accepts valid backtest configuration', async () => {
        const result = await engine.runBacktest({
            symbol: 'TEST',
            startDate: '2023-01-01',
            endDate: '2023-03-31',
            minProfitLossPercent: 0.1
        })
        if (!result) throw new Error('Should return result')
        if (typeof result.profitLossPercent !== 'number') throw new Error('Invalid result')
    })
    
    console.log('')

    // Calculation Edge Cases
    console.log('Calculation Edge Cases:')
    console.log('-'.repeat(70))
    
    test('Handles all same values (no variance)', () => {
        const closes = new Float64Array([100, 100, 100, 100, 100])
        const rsi = engine.calculateRSIOptimized(closes, { period: 2, overbought: 70, oversold: 30 })
        if (!rsi) throw new Error('Should return signals')
    })
    
    test('Handles increasing sequence', () => {
        const closes = new Float64Array([100, 101, 102, 103, 104, 105])
        const rsi = engine.calculateRSIOptimized(closes, { period: 2, overbought: 70, oversold: 30 })
        if (!rsi) throw new Error('Should return signals')
    })
    
    test('Handles decreasing sequence', () => {
        const closes = new Float64Array([105, 104, 103, 102, 101, 100])
        const rsi = engine.calculateRSIOptimized(closes, { period: 2, overbought: 70, oversold: 30 })
        if (!rsi) throw new Error('Should return signals')
    })
    
    test('Handles volatile data', () => {
        const closes = new Float64Array([100, 150, 75, 200, 50, 175])
        const rsi = engine.calculateRSIOptimized(closes, { period: 2, overbought: 70, oversold: 30 })
        if (!rsi) throw new Error('Should return signals')
    })
    
    console.log('')

    // Data Integrity Tests
    console.log('Data Integrity Tests:')
    console.log('-'.repeat(70))
    
    test('Rejects invalid data (missing close)', () => {
        try {
            const invalidData = [{ timestamp: 123, open: 100, high: 110, low: 90 }]
            engine.extractCloses(invalidData)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('missing or invalid close price')) throw e
        }
    })
    
    test('Rejects invalid data (negative close)', () => {
        try {
            const invalidData = [{ timestamp: 123, open: 100, high: 110, low: 90, close: -50, volume: 1000 }]
            engine.extractCloses(invalidData)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be a positive finite number')) throw e
        }
    })
    
    test('Rejects invalid data (NaN close)', () => {
        try {
            const invalidData = [{ timestamp: 123, open: 100, high: 110, low: 90, close: NaN, volume: 1000 }]
            engine.extractCloses(invalidData)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be a positive finite number')) throw e
        }
    })
    
    test('Rejects invalid data (Infinity close)', () => {
        try {
            const invalidData = [{ timestamp: 123, open: 100, high: 110, low: 90, close: Infinity, volume: 1000 }]
            engine.extractCloses(invalidData)
            throw new Error('Should have thrown')
        } catch (e) {
            if (!e.message.includes('must be a positive finite number')) throw e
        }
    })
    
    test('Accepts valid data', () => {
        const validData = [
            { timestamp: 123, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
            { timestamp: 456, open: 105, high: 115, low: 95, close: 110, volume: 1200 }
        ]
        const closes = engine.extractCloses(validData)
        if (closes.length !== 2) throw new Error('Should extract all closes')
    })
    
    console.log('')

    // Print Results
    console.log('='.repeat(70))
    console.log('Test Results:')
    console.log('-'.repeat(70))
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(`Total:  ${passedTests + failedTests}`)
    console.log('='.repeat(70))
    
    if (failedTests === 0) {
        console.log('')
        console.log('🎉 ALL TESTS PASSED! 🎉')
        console.log('')
        console.log('The Trading Backtest Tool is production-ready with:')
        console.log('  ✓ Comprehensive input validation')
        console.log('  ✓ Robust error handling')
        console.log('  ✓ Protection against edge cases')
        console.log('  ✓ Safe mathematical operations')
        console.log('  ✓ Data integrity checks')
        console.log('')
        process.exit(0)
    } else {
        console.log('')
        console.log('❌ Some tests failed. Please review.')
        process.exit(1)
    }
}

runTests().catch(error => {
    console.error('Test suite error:', error)
    process.exit(1)
})
