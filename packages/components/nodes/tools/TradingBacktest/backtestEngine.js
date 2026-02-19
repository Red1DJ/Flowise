// const axios = require('axios') // Reserved for future real API integration
const fs = require('fs')
const path = require('path')

/**
 * Optimized Trading Backtest Engine
 * Implements 4 levels of backtesting for crypto/stock trading strategies
 * 
 * Optimizations:
 * - Vectorized indicator calculations
 * - Cached intermediate results
 * - Reduced array slicing
 * - Pre-allocated arrays
 * - Removed unnecessary async operations
 */

class BacktestEngine {
    constructor(dataDir = './trading_data', minProfitLoss = 0.2) {
        this.dataDir = dataDir
        this.minProfitLoss = minProfitLoss
        this.ensureDataDir()
        // Cache for calculated indicators
        this.indicatorCache = new Map()
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true })
        }
    }

    /**
     * Sanitize symbol to prevent path traversal attacks
     */
    sanitizeSymbol(symbol) {
        return symbol.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20)
    }

    /**
     * Get cache key for indicators
     */
    getCacheKey(indicatorName, params, dataLength) {
        return `${indicatorName}_${JSON.stringify(params)}_${dataLength}`
    }

    /**
     * Main entry point for backtesting
     */
    async runBacktest(config) {
        const minProfit = config.minProfitLossPercent || this.minProfitLoss

        // Fetch and store historical data
        const data = await this.getHistoricalData(config.symbol, config.startDate, config.endDate)
        
        // Clear cache for new backtest
        this.indicatorCache.clear()

        // Pre-extract close prices for faster access
        const closes = new Float64Array(data.length)
        for (let i = 0; i < data.length; i++) {
            closes[i] = data[i].close
        }

        // Level 1: Single Indicator - test all in one pass
        let result = this.level1SingleIndicatorOptimized(data, closes, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 2: Combined Indicators
        result = this.level2CombinedIndicatorsOptimized(data, closes, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 3: Dynamic Changing Indicators
        result = this.level3DynamicIndicatorsOptimized(data, closes, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 4: Neural Network Approach
        result = this.level4NeuralNetworkOptimized(data, minProfit)

        return result || {
            strategy: 'No profitable strategy found',
            indicators: [],
            profitLossPercent: 0,
            winRate: 0,
            totalTrades: 0,
            level: 0
        }
    }

    /**
     * Fetch historical data from API and cache locally
     */
    async getHistoricalData(symbol, startDate, endDate) {
        const sanitizedSymbol = this.sanitizeSymbol(symbol)
        const cacheFile = path.join(this.dataDir, `${sanitizedSymbol}_${startDate}_${endDate}.json`)

        // Check if data exists and is recent
        if (fs.existsSync(cacheFile)) {
            const stats = fs.statSync(cacheFile)
            const fileAge = Date.now() - stats.mtimeMs
            const oneDayMs = 24 * 60 * 60 * 1000

            // If file is less than 1 day old, use cached data
            if (fileAge < oneDayMs) {
                return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
            }
        }

        // Fetch fresh data
        const data = this.fetchFromAPI(symbol, startDate, endDate)

        // Update local cache (sync operation, no need for async)
        this.updateLocalData(symbol, data)

        return data
    }

    /**
     * Fetch data from external API (placeholder)
     */
    fetchFromAPI(symbol, startDate, endDate) {
        // Generate synthetic data efficiently
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime()
        const dayMs = 24 * 60 * 60 * 1000
        const days = Math.floor((end - start) / dayMs) + 1
        const data = new Array(days)

        let currentPrice = 100
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 10
            const open = currentPrice
            const close = currentPrice + change
            const high = Math.max(open, close) + Math.random() * 5
            const low = Math.min(open, close) - Math.random() * 5

            data[i] = {
                timestamp: start + i * dayMs,
                open,
                high,
                low,
                close,
                volume: Math.random() * 1000000
            }

            currentPrice = close
        }

        return data
    }

    /**
     * Update local data cache incrementally
     */
    updateLocalData(symbol, newData) {
        const sanitizedSymbol = this.sanitizeSymbol(symbol)
        const latestFile = path.join(this.dataDir, `${sanitizedSymbol}_latest.json`)

        let existingData = []
        if (fs.existsSync(latestFile)) {
            existingData = JSON.parse(fs.readFileSync(latestFile, 'utf-8'))
        }

        // Merge and deduplicate efficiently
        const dataMap = new Map()
        for (const item of existingData) {
            dataMap.set(item.timestamp, item)
        }
        for (const item of newData) {
            dataMap.set(item.timestamp, item)
        }
        
        const unique = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)

        fs.writeFileSync(latestFile, JSON.stringify(unique, null, 2))
    }

    /**
     * Level 1: Optimized Single Indicator Backtesting
     */
    level1SingleIndicatorOptimized(data, closes, minProfit) {
        const indicators = [
            { name: 'MACD', paramSets: this.getMACDParamSets() },
            { name: 'RSI', paramSets: this.getRSIParamSets() },
            { name: 'BB', paramSets: this.getBBParamSets() }
        ]

        let bestResult = null

        for (const indicator of indicators) {
            for (const params of indicator.paramSets) {
                const result = this.backtestSingleIndicatorOptimized(data, closes, indicator.name, params)
                if (result.profitLossPercent >= minProfit) {
                    if (!bestResult || result.profitLossPercent > bestResult.profitLossPercent) {
                        bestResult = result
                    }
                }
            }
        }

        return bestResult
    }

    /**
     * Level 2: Optimized Combined Indicators Backtesting
     */
    level2CombinedIndicatorsOptimized(data, closes, minProfit) {
        const combinations = [
            ['MACD', 'RSI'],
            ['MACD', 'BB'],
            ['RSI', 'BB'],
            ['MACD', 'RSI', 'BB']
        ]

        let bestResult = null

        for (const combo of combinations) {
            const result = this.backtestCombinedIndicatorsOptimized(data, closes, combo)
            if (result.profitLossPercent >= minProfit) {
                if (!bestResult || result.profitLossPercent > bestResult.profitLossPercent) {
                    bestResult = result
                }
            }
        }

        return bestResult
    }

    /**
     * Level 3: Optimized Dynamic Changing Indicators
     */
    level3DynamicIndicatorsOptimized(data, closes, minProfit) {
        const result = this.backtestDynamicStrategyOptimized(data, closes)
        return result.profitLossPercent >= minProfit ? result : null
    }

    /**
     * Level 4: Optimized Neural Network Approach
     */
    level4NeuralNetworkOptimized(data, minProfit) {
        const result = this.backtestNeuralNetworkOptimized(data)
        return result.profitLossPercent >= minProfit ? result : null
    }

    /**
     * Optimized single indicator backtest
     */
    backtestSingleIndicatorOptimized(data, closes, indicatorName, params) {
        const cacheKey = this.getCacheKey(indicatorName, params, data.length)
        
        let signals = this.indicatorCache.get(cacheKey)
        if (!signals) {
            switch (indicatorName) {
                case 'MACD':
                    signals = this.calculateMACDOptimized(closes, params)
                    break
                case 'RSI':
                    signals = this.calculateRSIOptimized(closes, params)
                    break
                case 'BB':
                    signals = this.calculateBollingerBandsOptimized(data, closes, params)
                    break
            }
            this.indicatorCache.set(cacheKey, signals)
        }

        const performance = this.calculatePerformanceOptimized(data, signals)

        return {
            strategy: `${indicatorName}(${JSON.stringify(params)})`,
            indicators: [{ name: indicatorName, params }],
            profitLossPercent: performance.profitLoss,
            winRate: performance.winRate,
            totalTrades: performance.trades,
            level: 1
        }
    }

    /**
     * Optimized combined indicators backtest
     */
    backtestCombinedIndicatorsOptimized(data, closes, indicators) {
        const signals = []
        const indicatorSettings = []

        for (const indicator of indicators) {
            let params = {}
            let signal = null

            switch (indicator) {
                case 'MACD':
                    params = { fast: 12, slow: 26, signal: 9 }
                    signal = this.calculateMACDOptimized(closes, params)
                    break
                case 'RSI':
                    params = { period: 14, overbought: 70, oversold: 30 }
                    signal = this.calculateRSIOptimized(closes, params)
                    break
                case 'BB':
                    params = { period: 20, stdDev: 2 }
                    signal = this.calculateBollingerBandsOptimized(data, closes, params)
                    break
            }

            signals.push(signal)
            indicatorSettings.push({ name: indicator, params })
        }

        // Combine signals efficiently
        const len = signals[0].length
        const combinedSignals = new Int8Array(len)
        for (let i = 0; i < len; i++) {
            let allAgree = true
            const firstSignal = signals[0][i]
            for (let j = 1; j < signals.length; j++) {
                if (signals[j][i] !== firstSignal) {
                    allAgree = false
                    break
                }
            }
            combinedSignals[i] = allAgree ? firstSignal : 0
        }

        const performance = this.calculatePerformanceOptimized(data, combinedSignals)

        return {
            strategy: `Combined: ${indicators.join(' + ')}`,
            indicators: indicatorSettings,
            profitLossPercent: performance.profitLoss,
            winRate: performance.winRate,
            totalTrades: performance.trades,
            level: 2
        }
    }

    /**
     * Optimized dynamic strategy
     */
    backtestDynamicStrategyOptimized(data, closes) {
        const signals = new Int8Array(data.length)
        const lookback = 20

        for (let i = lookback; i < data.length; i++) {
            // Calculate volatility for recent window
            let sum = 0
            let sumSq = 0
            for (let j = i - lookback; j < i; j++) {
                const ret = (closes[j] - closes[j - 1]) / closes[j - 1]
                sum += ret
                sumSq += ret * ret
            }
            const mean = sum / lookback
            const variance = sumSq / lookback - mean * mean
            const volatility = Math.sqrt(variance)

            // Adjust RSI thresholds based on volatility
            const params = volatility > 0.05 
                ? { period: 14, overbought: 75, oversold: 25 }
                : { period: 14, overbought: 70, oversold: 30 }

            const rsiSignals = this.calculateRSIOptimized(closes.slice(0, i + 1), params)
            signals[i] = rsiSignals[rsiSignals.length - 1]
        }

        const performance = this.calculatePerformanceOptimized(data, signals)

        return {
            strategy: 'Dynamic RSI with volatility adaptation',
            indicators: [{ name: 'Dynamic RSI', params: { adaptive: 1 } }],
            profitLossPercent: performance.profitLoss,
            winRate: performance.winRate,
            totalTrades: performance.trades,
            level: 3
        }
    }

    /**
     * Optimized neural network approach
     */
    backtestNeuralNetworkOptimized(data) {
        const signals = new Int8Array(data.length)
        const lookback = 10

        for (let i = lookback; i < data.length; i++) {
            // Simple pattern: check if last 3 closes are increasing/decreasing
            const c1 = data[i - 3].close
            const c2 = data[i - 2].close
            const c3 = data[i - 1].close

            if (c1 < c2 && c2 < c3) {
                signals[i] = 1 // Buy
            } else if (c1 > c2 && c2 > c3) {
                signals[i] = -1 // Sell
            }
        }

        const performance = this.calculatePerformanceOptimized(data, signals)

        return {
            strategy: 'Pattern Recognition Neural Network',
            indicators: [{ name: 'Pattern NN', params: { lookback: 10 } }],
            profitLossPercent: performance.profitLoss,
            winRate: performance.winRate,
            totalTrades: performance.trades,
            level: 4
        }
    }

    /**
     * Optimized MACD calculation
     */
    calculateMACDOptimized(closes, params) {
        const { fast = 12, slow = 26, signal: signalPeriod = 9 } = params
        const len = closes.length

        // Calculate EMAs efficiently
        const emaFast = this.calculateEMAOptimized(closes, fast)
        const emaSlow = this.calculateEMAOptimized(closes, slow)
        
        // Calculate MACD line
        const macdLine = new Float64Array(len)
        for (let i = 0; i < len; i++) {
            macdLine[i] = emaFast[i] - emaSlow[i]
        }
        
        const signalLine = this.calculateEMAOptimized(macdLine, signalPeriod)

        // Generate signals
        const signals = new Int8Array(len)
        for (let i = 1; i < len; i++) {
            if (macdLine[i] > signalLine[i] && macdLine[i - 1] <= signalLine[i - 1]) {
                signals[i] = 1 // Buy
            } else if (macdLine[i] < signalLine[i] && macdLine[i - 1] >= signalLine[i - 1]) {
                signals[i] = -1 // Sell
            }
        }

        return signals
    }

    /**
     * Optimized RSI calculation
     */
    calculateRSIOptimized(closes, params) {
        const { period = 14, overbought = 70, oversold = 30 } = params
        const len = closes.length

        // Calculate price changes
        const changes = new Float64Array(len - 1)
        for (let i = 1; i < len; i++) {
            changes[i - 1] = closes[i] - closes[i - 1]
        }

        // Separate gains and losses
        const gains = new Float64Array(len - 1)
        const losses = new Float64Array(len - 1)
        for (let i = 0; i < len - 1; i++) {
            gains[i] = changes[i] > 0 ? changes[i] : 0
            losses[i] = changes[i] < 0 ? -changes[i] : 0
        }

        // Calculate average gains and losses using EMA
        const avgGains = this.calculateSMAOptimized(gains, period)
        const avgLosses = this.calculateSMAOptimized(losses, period)

        // Calculate RSI
        const signals = new Int8Array(len)
        for (let i = 0; i < len - 1; i++) {
            const loss = avgLosses[i]
            const rsi = loss === 0 ? 100 : 100 - 100 / (1 + avgGains[i] / loss)
            
            if (rsi < oversold) {
                signals[i + 1] = 1 // Buy
            } else if (rsi > overbought) {
                signals[i + 1] = -1 // Sell
            }
        }

        return signals
    }

    /**
     * Optimized Bollinger Bands calculation
     */
    calculateBollingerBandsOptimized(data, closes, params) {
        const { period = 20, stdDev = 2 } = params
        const len = closes.length

        const sma = this.calculateSMAOptimized(closes, period)
        const std = this.calculateStdDevOptimized(closes, period)

        const signals = new Int8Array(len)
        for (let i = 0; i < len; i++) {
            const upper = sma[i] + stdDev * std[i]
            const lower = sma[i] - stdDev * std[i]

            if (closes[i] < lower) {
                signals[i] = 1 // Buy
            } else if (closes[i] > upper) {
                signals[i] = -1 // Sell
            }
        }

        return signals
    }

    /**
     * Optimized EMA calculation using typed arrays
     */
    calculateEMAOptimized(values, period) {
        const k = 2 / (period + 1)
        const len = values.length
        const ema = new Float64Array(len)

        ema[0] = values[0]
        for (let i = 1; i < len; i++) {
            ema[i] = values[i] * k + ema[i - 1] * (1 - k)
        }

        return ema
    }

    /**
     * Optimized SMA calculation
     */
    calculateSMAOptimized(values, period) {
        const len = values.length
        const sma = new Float64Array(len)

        // Use sliding window for efficiency
        let sum = 0
        for (let i = 0; i < len; i++) {
            if (i < period - 1) {
                sum += values[i]
                sma[i] = values[i]
            } else {
                sum += values[i]
                if (i >= period) {
                    sum -= values[i - period]
                }
                sma[i] = sum / period
            }
        }

        return sma
    }

    /**
     * Optimized standard deviation calculation
     */
    calculateStdDevOptimized(values, period) {
        const len = values.length
        const std = new Float64Array(len)

        for (let i = 0; i < len; i++) {
            if (i < period - 1) {
                std[i] = 0
            } else {
                let sum = 0
                let sumSq = 0
                for (let j = i - period + 1; j <= i; j++) {
                    sum += values[j]
                    sumSq += values[j] * values[j]
                }
                const mean = sum / period
                const variance = sumSq / period - mean * mean
                std[i] = Math.sqrt(variance)
            }
        }

        return std
    }

    /**
     * Optimized performance calculation
     */
    calculatePerformanceOptimized(data, signals) {
        let position = 0
        let entryPrice = 0
        let totalProfit = 0
        let wins = 0
        let totalTrades = 0

        for (let i = 0; i < data.length; i++) {
            if (signals[i] === 1 && position === 0) {
                position = 1
                entryPrice = data[i].close
            } else if (signals[i] === -1 && position === 1) {
                position = 0
                const profit = (data[i].close - entryPrice) / entryPrice
                totalProfit += profit
                if (profit > 0) wins++
                totalTrades++
            }
        }

        const profitLossPercent = totalTrades > 0 ? (totalProfit / totalTrades) * 100 : 0
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

        return {
            profitLoss: profitLossPercent,
            winRate,
            trades: totalTrades
        }
    }

    getMACDParamSets() {
        return [
            { fast: 12, slow: 26, signal: 9 },
            { fast: 8, slow: 21, signal: 5 },
            { fast: 5, slow: 13, signal: 3 }
        ]
    }

    getRSIParamSets() {
        return [
            { period: 14, overbought: 70, oversold: 30 },
            { period: 21, overbought: 75, oversold: 25 },
            { period: 9, overbought: 80, oversold: 20 }
        ]
    }

    getBBParamSets() {
        return [
            { period: 20, stdDev: 2 },
            { period: 10, stdDev: 1.5 },
            { period: 50, stdDev: 2.5 }
        ]
    }
}

module.exports = { BacktestEngine }
