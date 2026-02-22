#!/usr/bin/env python3
"""
Comprehensive Edge Case Test Suite - Pure Python
Tests all safety features and error handling
"""

import unittest
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backtestEngine import BacktestEngine


class TestBacktestEngine(unittest.TestCase):
    """Test suite for BacktestEngine"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.engine = BacktestEngine('./test_edge_cases', 0.2)
    
    # Constructor Validation Tests
    def test_invalid_datadir_number(self):
        """Rejects invalid dataDir (number)"""
        with self.assertRaises(ValueError) as cm:
            BacktestEngine(123)
        self.assertIn('Invalid data_dir', str(cm.exception))
    
    def test_invalid_datadir_empty(self):
        """Rejects invalid dataDir (empty string)"""
        with self.assertRaises(ValueError) as cm:
            BacktestEngine('')
        self.assertIn('Invalid data_dir', str(cm.exception))
    
    def test_invalid_min_profit_string(self):
        """Rejects invalid minProfitLoss (string)"""
        with self.assertRaises(ValueError) as cm:
            BacktestEngine('./test', 'invalid')
        self.assertIn('Invalid min_profit_loss', str(cm.exception))
    
    def test_invalid_min_profit_nan(self):
        """Rejects invalid minProfitLoss (NaN)"""
        with self.assertRaises(ValueError) as cm:
            BacktestEngine('./test', float('nan'))
        self.assertIn('Invalid min_profit_loss', str(cm.exception))
    
    def test_invalid_min_profit_infinity(self):
        """Rejects invalid minProfitLoss (Infinity)"""
        with self.assertRaises(ValueError) as cm:
            BacktestEngine('./test', float('inf'))
        self.assertIn('Invalid min_profit_loss', str(cm.exception))
    
    def test_valid_constructor(self):
        """Accepts valid constructor parameters"""
        engine = BacktestEngine('./test_valid', 0.5)
        self.assertIsNotNone(engine)
    
    # Symbol Validation Tests
    def test_empty_symbol(self):
        """Rejects empty symbol"""
        with self.assertRaises(ValueError) as cm:
            self.engine.sanitize_symbol('')
        self.assertIn('Invalid symbol', str(cm.exception))
    
    def test_non_string_symbol(self):
        """Rejects non-string symbol"""
        with self.assertRaises(ValueError) as cm:
            self.engine.sanitize_symbol(123)
        self.assertIn('Invalid symbol', str(cm.exception))
    
    def test_symbol_special_chars_only(self):
        """Rejects symbol with only special characters"""
        with self.assertRaises(ValueError) as cm:
            self.engine.sanitize_symbol('!@#$%')
        self.assertIn('Invalid symbol', str(cm.exception))
    
    def test_valid_symbol(self):
        """Accepts valid symbol"""
        result = self.engine.sanitize_symbol('BTC-USD')
        self.assertEqual(result, 'BTC-USD')
    
    def test_long_symbol_truncation(self):
        """Truncates long symbols"""
        result = self.engine.sanitize_symbol('A' * 30)
        self.assertEqual(len(result), 20)
    
    # Date Validation Tests
    def test_invalid_date_format(self):
        """Rejects invalid date format"""
        with self.assertRaises(ValueError) as cm:
            self.engine.validate_date('invalid', 'testDate')
        self.assertIn('YYYY-MM-DD format', str(cm.exception))
    
    def test_nonexistent_date(self):
        """Rejects non-existent date"""
        with self.assertRaises(ValueError) as cm:
            self.engine.validate_date('2023-02-30', 'testDate')
        self.assertIn('not a valid date', str(cm.exception))
    
    def test_date_too_far_past(self):
        """Rejects date too far in past"""
        with self.assertRaises(ValueError) as cm:
            self.engine.validate_date('1800-01-01', 'testDate')
        self.assertIn('must be between', str(cm.exception))
    
    def test_date_too_far_future(self):
        """Rejects date too far in future"""
        future_date = (datetime.now() + timedelta(days=730)).strftime('%Y-%m-%d')
        with self.assertRaises(ValueError) as cm:
            self.engine.validate_date(future_date, 'testDate')
        self.assertIn('must be between', str(cm.exception))
    
    def test_valid_date(self):
        """Accepts valid date"""
        result = self.engine.validate_date('2023-01-01', 'testDate')
        self.assertIsInstance(result, datetime)
    
    # Configuration Validation Tests
    def test_missing_config(self):
        """Rejects missing config"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest(None)
        self.assertIn('Invalid config', str(cm.exception))
    
    def test_missing_symbol(self):
        """Rejects missing symbol"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({'startDate': '2023-01-01', 'endDate': '2023-12-31'})
        self.assertIn('Missing required parameter: symbol', str(cm.exception))
    
    def test_missing_start_date(self):
        """Rejects missing startDate"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({'symbol': 'BTC', 'endDate': '2023-12-31'})
        self.assertIn('Missing required parameter: startDate', str(cm.exception))
    
    def test_missing_end_date(self):
        """Rejects missing endDate"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({'symbol': 'BTC', 'startDate': '2023-01-01'})
        self.assertIn('Missing required parameter: endDate', str(cm.exception))
    
    def test_reversed_date_range(self):
        """Rejects reversed date range"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({
                'symbol': 'BTC',
                'startDate': '2023-12-31',
                'endDate': '2023-01-01'
            })
        self.assertIn('startDate must be before endDate', str(cm.exception))
    
    def test_date_range_too_large(self):
        """Rejects date range too large"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({
                'symbol': 'BTC',
                'startDate': '2010-01-01',
                'endDate': '2025-01-01'
            })
        self.assertIn('maximum range is 10 years', str(cm.exception))
    
    def test_same_start_end_date(self):
        """Rejects same start/end date"""
        with self.assertRaises(ValueError) as cm:
            self.engine.run_backtest({
                'symbol': 'BTC',
                'startDate': '2023-01-01',
                'endDate': '2023-01-01'
            })
        self.assertIn('startDate and endDate cannot be the same', str(cm.exception))
    
    def test_valid_backtest_config(self):
        """Accepts valid backtest configuration"""
        result = self.engine.run_backtest({
            'symbol': 'TEST',
            'startDate': '2023-01-01',
            'endDate': '2023-03-31',
            'minProfitLossPercent': 0.1
        })
        self.assertIsInstance(result, dict)
        self.assertIn('profitLossPercent', result)
    
    # Calculation Edge Cases
    def test_no_variance_data(self):
        """Handles all same values (no variance)"""
        closes = [100.0] * 5
        signals = self.engine.calculate_rsi(closes, {'period': 2, 'overbought': 70, 'oversold': 30})
        self.assertIsNotNone(signals)
    
    def test_increasing_sequence(self):
        """Handles increasing sequence"""
        closes = [100.0, 101.0, 102.0, 103.0, 104.0, 105.0]
        signals = self.engine.calculate_rsi(closes, {'period': 2, 'overbought': 70, 'oversold': 30})
        self.assertIsNotNone(signals)
    
    def test_decreasing_sequence(self):
        """Handles decreasing sequence"""
        closes = [105.0, 104.0, 103.0, 102.0, 101.0, 100.0]
        signals = self.engine.calculate_rsi(closes, {'period': 2, 'overbought': 70, 'oversold': 30})
        self.assertIsNotNone(signals)
    
    def test_volatile_data(self):
        """Handles volatile data"""
        closes = [100.0, 150.0, 75.0, 200.0, 50.0, 175.0]
        signals = self.engine.calculate_rsi(closes, {'period': 2, 'overbought': 70, 'oversold': 30})
        self.assertIsNotNone(signals)
    
    # Data Integrity Tests
    def test_invalid_data_missing_close(self):
        """Rejects invalid data (missing close)"""
        invalid_data = [{'timestamp': 123, 'open': 100, 'high': 110, 'low': 90}]
        with self.assertRaises(ValueError) as cm:
            self.engine.extract_closes(invalid_data)
        self.assertIn('missing or invalid close price', str(cm.exception))
    
    def test_invalid_data_negative_close(self):
        """Rejects invalid data (negative close)"""
        invalid_data = [{'timestamp': 123, 'open': 100, 'high': 110, 'low': 90, 'close': -50, 'volume': 1000}]
        with self.assertRaises(ValueError) as cm:
            self.engine.extract_closes(invalid_data)
        self.assertIn('must be a positive finite number', str(cm.exception))
    
    def test_invalid_data_nan_close(self):
        """Rejects invalid data (NaN close)"""
        invalid_data = [{'timestamp': 123, 'open': 100, 'high': 110, 'low': 90, 'close': float('nan'), 'volume': 1000}]
        with self.assertRaises(ValueError) as cm:
            self.engine.extract_closes(invalid_data)
        self.assertIn('must be a positive finite number', str(cm.exception))
    
    def test_invalid_data_infinity_close(self):
        """Rejects invalid data (Infinity close)"""
        invalid_data = [{'timestamp': 123, 'open': 100, 'high': 110, 'low': 90, 'close': float('inf'), 'volume': 1000}]
        with self.assertRaises(ValueError) as cm:
            self.engine.extract_closes(invalid_data)
        self.assertIn('must be a positive finite number', str(cm.exception))
    
    def test_valid_data(self):
        """Accepts valid data"""
        valid_data = [
            {'timestamp': 123, 'open': 100, 'high': 110, 'low': 90, 'close': 105, 'volume': 1000},
            {'timestamp': 456, 'open': 105, 'high': 115, 'low': 95, 'close': 110, 'volume': 1200}
        ]
        closes = self.engine.extract_closes(valid_data)
        self.assertEqual(len(closes), 2)


def main():
    """Run all tests"""
    print('=' * 70)
    print('Trading Backtest Tool - Comprehensive Edge Case Tests (Python)')
    print('=' * 70)
    print('')
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestBacktestEngine)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print('')
    print('=' * 70)
    print('Test Results:')
    print('-' * 70)
    print(f'Passed: {result.testsRun - len(result.failures) - len(result.errors)}')
    print(f'Failed: {len(result.failures) + len(result.errors)}')
    print(f'Total:  {result.testsRun}')
    print('=' * 70)
    
    if result.wasSuccessful():
        print('')
        print('🎉 ALL TESTS PASSED! 🎉')
        print('')
        print('The Trading Backtest Tool (Python) is production-ready with:')
        print('  ✓ Comprehensive input validation')
        print('  ✓ Robust error handling')
        print('  ✓ Protection against edge cases')
        print('  ✓ Safe mathematical operations')
        print('  ✓ Data integrity checks')
        print('')
        return 0
    else:
        print('')
        print('❌ Some tests failed. Please review.')
        return 1


if __name__ == '__main__':
    sys.exit(main())
