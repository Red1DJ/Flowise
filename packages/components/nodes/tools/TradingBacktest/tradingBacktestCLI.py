#!/usr/bin/env python3
"""
Trading Backtest CLI - Pure Python
Standalone script to backtest trading strategies

Usage:
  python tradingBacktestCLI.py --symbol BTC --start 2023-01-01 --end 2023-12-31 --min-profit 0.2
"""

import sys
import argparse
from backtestEngine import BacktestEngine


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description='Trading Strategy Backtest',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --symbol BTC --start 2023-01-01 --end 2023-12-31
  %(prog)s --symbol ETH --start 2023-06-01 --end 2023-09-30 --min-profit 0.5
  %(prog)s --symbol AAPL --start 2023-01-01 --end 2023-12-31 --data-dir /tmp/data
        '''
    )
    
    parser.add_argument('--symbol', required=True,
                       help='Trading symbol (e.g., BTC, ETH, AAPL, TSLA)')
    parser.add_argument('--start', required=True,
                       help='Start date in YYYY-MM-DD format')
    parser.add_argument('--end', required=True,
                       help='End date in YYYY-MM-DD format')
    parser.add_argument('--min-profit', type=float, default=0.2,
                       help='Minimum profit/loss percentage (default: 0.2)')
    parser.add_argument('--data-dir', default='./trading_data',
                       help='Directory to store historical data (default: ./trading_data)')
    
    args = parser.parse_args()
    
    print('=' * 60)
    print('Trading Strategy Backtest')
    print('=' * 60)
    print(f'Symbol: {args.symbol}')
    print(f'Start Date: {args.start}')
    print(f'End Date: {args.end}')
    print(f'Minimum P/L: {args.min_profit}%')
    print(f'Data Directory: {args.data_dir}')
    print('=' * 60)
    print('')
    
    try:
        engine = BacktestEngine(args.data_dir, args.min_profit)
        
        print('Running multi-level backtest...')
        print('Level 1: Single indicator strategies...')
        print('Level 2: Combined indicator strategies...')
        print('Level 3: Dynamic indicator strategies...')
        print('Level 4: Neural network approach...')
        print('')
        
        result = engine.run_backtest({
            'symbol': args.symbol,
            'startDate': args.start,
            'endDate': args.end,
            'minProfitLossPercent': args.min_profit
        })
        
        print('=' * 60)
        print('BACKTEST RESULTS')
        print('=' * 60)
        print('')
        
        if result['level'] == 0:
            print('❌ No profitable strategy found with the given criteria.')
            print('')
            print('Try:')
            print('  - Adjusting the date range')
            print('  - Lowering the minimum profit requirement')
            print('  - Testing a different symbol')
        else:
            print(f"✅ Most Effective Strategy Found (Level {result['level']})")
            print('')
            print(f"Strategy: {result['strategy']}")
            print(f"Profit/Loss: {result['profitLossPercent']:.2f}%")
            print(f"Win Rate: {result['winRate']:.2f}%")
            print(f"Total Trades: {result['totalTrades']}")
            print('')
            
            if result['indicators']:
                print('Indicators:')
                for indicator in result['indicators']:
                    params = ', '.join(f"{k}={v}" for k, v in indicator['params'].items())
                    print(f"  • {indicator['name']}({params})")
        
        print('=' * 60)
        return 0
        
    except ValueError as e:
        print('')
        print('=' * 60)
        print('❌ BACKTEST FAILED')
        print('=' * 60)
        print('')
        print(f'Error: {e}')
        print('')
        
        # Provide helpful suggestions
        error_msg = str(e)
        if 'Invalid symbol' in error_msg:
            print('Suggestion: Use only letters, numbers, hyphens, and underscores')
            print('Example: BTC, ETH, AAPL, MSFT-USD')
        elif 'Invalid date' in error_msg or 'date range' in error_msg:
            print('Suggestion: Ensure dates are in YYYY-MM-DD format')
            print('Example: --start 2023-01-01 --end 2023-12-31')
        elif 'Insufficient data' in error_msg:
            print('Suggestion: Try a longer date range or different symbol')
        elif 'data directory' in error_msg:
            print('Suggestion: Ensure the data directory is writable')
            print('Check permissions or specify a different directory with --data-dir')
        
        print('')
        return 1
    except Exception as e:
        print('')
        print(f'Unexpected error: {e}')
        print('')
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
