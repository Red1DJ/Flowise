const axios = require('axios')
const fs = require('fs')
const path = require('path')

/**
 * Trading Backtest Engine
 * Implements 4 levels of backtesting for crypto/stock trading strategies
 */

class BacktestEngine {
    constructor(dataDir = './trading_data', minProfitLoss = 0.2) {
        this.dataDir = dataDir
        this.minProfitLoss = minProfitLoss
        this.ensureDataDir()
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true })
        }
    }

    /**
     * Main entry point for backtesting
     */
    async runBacktest(config) {
        const minProfit = config.minProfitLossPercent || this.minProfitLoss

        // Fetch and store historical data
        const data = await this.getHistoricalData(config.symbol, config.startDate, config.endDate)

        // Level 1: Single Indicator Backtesting
        let result = await this.level1SingleIndicator(data, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 2: Combined Indicators
        result = await this.level2CombinedIndicators(data, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 3: Dynamic Changing Indicators
        result = await this.level3DynamicIndicators(data, minProfit)
        if (result && result.profitLossPercent >= minProfit) {
            return result
        }

        // Level 4: Neural Network Approach
        result = await this.level4NeuralNetwork(data, minProfit)

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
        const cacheFile = path.join(this.dataDir, `${symbol}_${startDate}_${endDate}.json`)

        // Check if data exists and is recent
        if (fs.existsSync(cacheFile)) {
            const stats = fs.statSync(cacheFile)
            const fileAge = Date.now() - stats.mtimeMs
            const oneDayMs = 24 * 60 * 60 * 1000

            // If file is less than 1 day old, use cached data
            if (fileAge < oneDayMs) {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
                return cached
            }
        }

        // Fetch fresh data
        const data = await this.fetchFromAPI(symbol, startDate, endDate)

        // Update local cache
        await this.updateLocalData(symbol, data)

        return data
    }

    /**
     * Fetch data from external API (placeholder - use real API in production)
     */
    async fetchFromAPI(symbol, startDate, endDate) {
        // This is a placeholder. In production, use real APIs like:
        // - Alpha Vantage for stocks
        // - CoinGecko/Binance for crypto
        // - Yahoo Finance API

        // For demonstration, generate synthetic data
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime()
        const dayMs = 24 * 60 * 60 * 1000
        const data = []

        let currentPrice = 100
        for (let time = start; time <= end; time += dayMs) {
            const change = (Math.random() - 0.5) * 10
            const open = currentPrice
            const close = currentPrice + change
            const high = Math.max(open, close) + Math.random() * 5
            const low = Math.min(open, close) - Math.random() * 5

            data.push({
                timestamp: time,
                open,
                high,
                low,
                close,
                volume: Math.random() * 1000000
            })

            currentPrice = close
        }

        return data
    }

    /**
     * Update local data cache incrementally
     */
    async updateLocalData(symbol, newData) {
        const latestFile = path.join(this.dataDir, `${symbol}_latest.json`)

        let existingData = []
        if (fs.existsSync(latestFile)) {
            existingData = JSON.parse(fs.readFileSync(latestFile, 'utf-8'))
        }

        // Merge and deduplicate
        const combined = [...existingData, ...newData]
        const unique = Array.from(
            new Map(combined.map((item) => [item.timestamp, item])).values()
        ).sort((a, b) => a.timestamp - b.timestamp)

        fs.writeFileSync(latestFile, JSON.stringify(unique, null, 2))
    }

    /**
     * Level 1: Single Indicator Backtesting
     */
    async level1SingleIndicator(data, minProfit) {
        const indicators = [
            { name: 'MACD', paramSets: this.getMACDParamSets() },
            { name: 'RSI', paramSets: this.getRSIParamSets() },
            { name: 'BB', paramSets: this.getBBParamSets() }
        ]

        let bestResult = null

        for (const indicator of indicators) {
            for (const params of indicator.paramSets) {
                const result = await this.backtestSingleIndicator(data, indicator.name, params)
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
     * Level 2: Combined Indicators Backtesting
     */
    async level2CombinedIndicators(data, minProfit) {
        const combinations = [
            ['MACD', 'RSI'],
            ['MACD', 'BB'],
            ['RSI', 'BB'],
            ['MACD', 'RSI', 'BB']
        ]

        let bestResult = null

        for (const combo of combinations) {
            const result = await this.backtestCombinedIndicators(data, combo)
            if (result.profitLossPercent >= minProfit) {
                if (!bestResult || result.profitLossPercent > bestResult.profitLossPercent) {
                    bestResult = result
                }
            }
        }

        return bestResult
    }

    /**
     * Level 3: Dynamic Changing Indicators
     */
    async level3DynamicIndicators(data, minProfit) {
        // Dynamic approach: adjust indicator parameters based on market conditions
        const result = await this.backtestDynamicStrategy(data)
        return result.profitLossPercent >= minProfit ? result : null
    }

    /**
     * Level 4: Neural Network Approach
     */
    async level4NeuralNetwork(data, minProfit) {
        // Simplified neural network approach using pattern recognition
        const result = await this.backtestNeuralNetwork(data)
        return result.profitLossPercent >= minProfit ? result : null
    }

    /**
     * Backtest a single indicator with specific parameters
     */
    async backtestSingleIndicator(data, indicatorName, params) {
        let signals = []

        switch (indicatorName) {
            case 'MACD':
                signals = this.calculateMACD(data, params)
                break
            case 'RSI':
                signals = this.calculateRSI(data, params)
                break
            case 'BB':
                signals = this.calculateBollingerBands(data, params)
                break
        }

        const performance = this.calculatePerformance(data, signals)

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
     * Backtest combined indicators
     */
    async backtestCombinedIndicators(data, indicators) {
        const signals = []
        const indicatorSettings = []

        for (const indicator of indicators) {
            let params = {}
            let signal = []

            switch (indicator) {
                case 'MACD':
                    params = { fast: 12, slow: 26, signal: 9 }
                    signal = this.calculateMACD(data, params)
                    break
                case 'RSI':
                    params = { period: 14, overbought: 70, oversold: 30 }
                    signal = this.calculateRSI(data, params)
                    break
                case 'BB':
                    params = { period: 20, stdDev: 2 }
                    signal = this.calculateBollingerBands(data, params)
                    break
            }

            signals.push(signal)
            indicatorSettings.push({ name: indicator, params })
        }

        // Combine signals (all must agree)
        const combinedSignals = signals[0].map((_, i) => {
            const allAgree = signals.every((sig) => sig[i] === signals[0][i])
            return allAgree ? signals[0][i] : 0
        })

        const performance = this.calculatePerformance(data, combinedSignals)

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
     * Backtest dynamic strategy
     */
    async backtestDynamicStrategy(data) {
        // Adaptive strategy that changes parameters based on volatility
        const signals = []

        for (let i = 20; i < data.length; i++) {
            const recentData = data.slice(i - 20, i)
            const volatility = this.calculateVolatility(recentData)

            // Adjust RSI thresholds based on volatility
            const params =
                volatility > 0.05 ? { period: 14, overbought: 75, oversold: 25 } : { period: 14, overbought: 70, oversold: 30 }

            const rsiSignals = this.calculateRSI(data.slice(0, i + 1), params)
            signals.push(rsiSignals[rsiSignals.length - 1])
        }

        // Pad beginning with neutral signals
        const paddedSignals = new Array(20).fill(0).concat(signals)

        const performance = this.calculatePerformance(data, paddedSignals)

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
     * Backtest neural network approach
     */
    async backtestNeuralNetwork(data) {
        // Simplified pattern recognition approach
        const signals = []
        const lookback = 10

        for (let i = lookback; i < data.length; i++) {
            const pattern = data.slice(i - lookback, i)
            const signal = this.predictWithPattern(pattern, data[i])
            signals.push(signal)
        }

        // Pad beginning with neutral signals
        const paddedSignals = new Array(lookback).fill(0).concat(signals)

        const performance = this.calculatePerformance(data, paddedSignals)

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
     * Calculate MACD indicator
     */
    calculateMACD(data, params) {
        const { fast = 12, slow = 26, signal: signalPeriod = 9 } = params
        const closes = data.map((d) => d.close)

        const emaFast = this.calculateEMA(closes, fast)
        const emaSlow = this.calculateEMA(closes, slow)
        const macdLine = emaFast.map((f, i) => f - emaSlow[i])
        const signalLine = this.calculateEMA(macdLine, signalPeriod)

        // Generate buy/sell signals
        const signals = []
        for (let i = 1; i < macdLine.length; i++) {
            if (macdLine[i] > signalLine[i] && macdLine[i - 1] <= signalLine[i - 1]) {
                signals.push(1) // Buy
            } else if (macdLine[i] < signalLine[i] && macdLine[i - 1] >= signalLine[i - 1]) {
                signals.push(-1) // Sell
            } else {
                signals.push(0) // Hold
            }
        }

        return [0, ...signals] // Pad first element
    }

    /**
     * Calculate RSI indicator
     */
    calculateRSI(data, params) {
        const { period = 14, overbought = 70, oversold = 30 } = params
        const closes = data.map((d) => d.close)

        const changes = closes.slice(1).map((close, i) => close - closes[i])
        const gains = changes.map((c) => (c > 0 ? c : 0))
        const losses = changes.map((c) => (c < 0 ? -c : 0))

        const avgGains = this.calculateSMA(gains, period)
        const avgLosses = this.calculateSMA(losses, period)

        const rsi = avgGains.map((gain, i) => {
            const loss = avgLosses[i]
            if (loss === 0) return 100
            const rs = gain / loss
            return 100 - 100 / (1 + rs)
        })

        // Generate signals
        const signals = rsi.map((r) => {
            if (r < oversold) return 1 // Buy
            if (r > overbought) return -1 // Sell
            return 0 // Hold
        })

        return [0, ...signals] // Pad for first element
    }

    /**
     * Calculate Bollinger Bands
     */
    calculateBollingerBands(data, params) {
        const { period = 20, stdDev = 2 } = params
        const closes = data.map((d) => d.close)

        const sma = this.calculateSMA(closes, period)
        const std = this.calculateStdDev(closes, period)

        const signals = []
        for (let i = 0; i < closes.length; i++) {
            const upper = sma[i] + stdDev * std[i]
            const lower = sma[i] - stdDev * std[i]

            if (closes[i] < lower) {
                signals.push(1) // Buy
            } else if (closes[i] > upper) {
                signals.push(-1) // Sell
            } else {
                signals.push(0) // Hold
            }
        }

        return signals
    }

    /**
     * Calculate Exponential Moving Average
     */
    calculateEMA(values, period) {
        const k = 2 / (period + 1)
        const ema = []

        ema[0] = values[0]
        for (let i = 1; i < values.length; i++) {
            ema[i] = values[i] * k + ema[i - 1] * (1 - k)
        }

        return ema
    }

    /**
     * Calculate Simple Moving Average
     */
    calculateSMA(values, period) {
        const sma = []

        for (let i = 0; i < values.length; i++) {
            if (i < period - 1) {
                sma.push(values[i])
            } else {
                const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
                sma.push(sum / period)
            }
        }

        return sma
    }

    /**
     * Calculate Standard Deviation
     */
    calculateStdDev(values, period) {
        const std = []

        for (let i = 0; i < values.length; i++) {
            if (i < period - 1) {
                std.push(0)
            } else {
                const slice = values.slice(i - period + 1, i + 1)
                const mean = slice.reduce((a, b) => a + b, 0) / period
                const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
                std.push(Math.sqrt(variance))
            }
        }

        return std
    }

    /**
     * Calculate volatility
     */
    calculateVolatility(data) {
        const returns = []
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].close - data[i - 1].close) / data[i - 1].close)
        }

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
        return Math.sqrt(variance)
    }

    /**
     * Predict using pattern recognition
     */
    predictWithPattern(pattern, current) {
        // Simple pattern: if last 3 closes are increasing, buy; if decreasing, sell
        const recentCloses = pattern.slice(-3).map((d) => d.close)

        if (recentCloses[0] < recentCloses[1] && recentCloses[1] < recentCloses[2]) {
            return 1 // Buy
        } else if (recentCloses[0] > recentCloses[1] && recentCloses[1] > recentCloses[2]) {
            return -1 // Sell
        }

        return 0 // Hold
    }

    /**
     * Calculate performance metrics
     */
    calculatePerformance(data, signals) {
        let position = 0 // 0 = no position, 1 = long
        let entryPrice = 0
        let totalProfit = 0
        let wins = 0
        let totalTrades = 0

        for (let i = 0; i < data.length; i++) {
            if (signals[i] === 1 && position === 0) {
                // Buy signal
                position = 1
                entryPrice = data[i].close
            } else if (signals[i] === -1 && position === 1) {
                // Sell signal
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

    /**
     * Get MACD parameter sets to test
     */
    getMACDParamSets() {
        return [
            { fast: 12, slow: 26, signal: 9 },
            { fast: 8, slow: 21, signal: 5 },
            { fast: 5, slow: 13, signal: 3 }
        ]
    }

    /**
     * Get RSI parameter sets to test
     */
    getRSIParamSets() {
        return [
            { period: 14, overbought: 70, oversold: 30 },
            { period: 21, overbought: 75, oversold: 25 },
            { period: 9, overbought: 80, oversold: 20 }
        ]
    }

    /**
     * Get Bollinger Bands parameter sets to test
     */
    getBBParamSets() {
        return [
            { period: 20, stdDev: 2 },
            { period: 10, stdDev: 1.5 },
            { period: 50, stdDev: 2.5 }
        ]
    }
}

module.exports = { BacktestEngine }
