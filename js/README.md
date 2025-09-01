# JavaScript Architecture Documentation

## Overview
The JavaScript codebase has been refactored from a single 4,000+ line `script.js` file into a modular, maintainable architecture. This document outlines the structure and responsibilities of each module.

## File Structure

```
js/
├── README.md                 # This documentation
├── config.js                # Configuration and constants
├── utils.js                 # Utility functions
├── auth.js                  # Authentication functions
├── data-processing.js       # Data processing and CSV handling
├── filters.js              # Filter management and UI
├── charts.js               # Chart management (location charts)
├── dashboard.js            # Dashboard metrics and updates
├── date-handlers.js        # Date picker and filter handlers
└── main.js                 # Main application entry point
```

## Module Responsibilities

### 1. `config.js`
**Purpose**: Central configuration and global state management
- `excludedTransactions`: List of transactions to exclude from analysis
- `AppState`: Global application state (data, filters, date ranges)
- `Charts`: Chart instance references
- `DatePickers`: Date picker instance references

### 2. `utils.js`
**Purpose**: Utility functions used across the application
- `parseDate()`: Parse various date formats
- `formatYearMonth()`: Format dates for chart labels
- `parseCSVLine()`: Parse CSV with quoted fields
- `extractLocation()`: Extract location from business names
- `extractBusinessName()`: Extract business name without location
- `getDaysBetween()`: Calculate days between dates
- `shouldExcludeTransaction()`: Check if transaction should be excluded
- `safeSetText()`, `safeSetClass()`: Safe DOM manipulation

### 3. `auth.js`
**Purpose**: Authentication and user session management
- `isAuthenticated()`: Check user authentication status
- `initializeAuth()`: Initialize auth-related functionality
- Logout handling and user display management

### 4. `data-processing.js`
**Purpose**: Data processing, CSV parsing, and business logic
- `calculateFirstVisitDates()`: Track user first visits
- `processData()`: Parse and process CSV data
- `filterAndUpdateDashboard()`: Apply filters and update dashboard
- `findLatestTransactionDate()`: Find most recent transaction
- `updateLatestTransactionDate()`: Update date display

### 5. `filters.js`
**Purpose**: Filter management and UI interactions
- `initializeBusinessSearch()`: Business filter with keyboard navigation
- `initializeSearchableSelect()`: Generic searchable dropdown
- `updateBusinessFilter()`: Update business filter options
- `updateLocationFilter()`: Update location filter options
- `clearDashboardData()`: Reset dashboard metrics

### 6. `charts.js`
**Purpose**: Chart management (currently location charts)
- `safeDestroyChart()`: Safely destroy chart instances
- `cleanupAllCharts()`: Clean up all chart instances
- `initLocationUsersChart()`: Initialize users by location chart
- `initLocationGMVChart()`: Initialize GMV by location chart
- Canvas management and error handling

### 7. `dashboard.js`
**Purpose**: Dashboard metrics calculation and display
- `calculateGrowth()`: Calculate percentage growth
- `formatGrowth()`: Format growth for display
- `updateComparisonDisplay()`: Update growth indicators
- `calculateAverageVisits()`: Calculate user visit averages
- `updateDashboard()`: Main dashboard update function
- `updateCharts()`: Chart data processing and updates

### 8. `date-handlers.js`
**Purpose**: Date picker initialization and filter handling
- `initializeDatePickers()`: Initialize Flatpickr instances
- `setupQuickDateFilter()`: Handle quick date filter changes
- `setupFilterListeners()`: Setup all filter event listeners
- `setDefaultFilters()`: Set default 90-day filter

### 9. `main.js`
**Purpose**: Main application entry point and initialization
- Application initialization sequence
- API data loading
- Global variable setup for backward compatibility
- File upload handling (for development)

## Legacy Code

### `script.js` (Legacy)
Contains remaining functions that haven't been refactored yet:
- Chart initialization functions (`initMetricsCharts`, `initDailySalesChart`, etc.)
- Projection chart logic
- Modal chart functionality
- Anomaly detection
- Complex chart configurations

**Next Steps**: Continue refactoring `script.js` by moving chart functions to appropriate modules.

## Data Flow

```
1. Page Load
   ↓
2. main.js initializes application
   ↓
3. auth.js checks authentication
   ↓
4. data-processing.js loads and processes CSV data
   ↓
5. filters.js initializes filter UI
   ↓
6. date-handlers.js sets up date filters and applies defaults
   ↓
7. dashboard.js updates metrics and calls chart functions
   ↓
8. charts.js renders location charts
```

## Global Variables

For backward compatibility, key objects are exposed globally:
- `window.AppState`: Application state
- `window.Charts`: Chart instances
- `window.DatePickers`: Date picker instances
- `window.transactionData`: Main data array
- `window.locationChartInitialized`: Chart initialization flag

## Best Practices

### Adding New Features
1. Identify the appropriate module based on functionality
2. Add new functions to the relevant module
3. Update global exports if needed for compatibility
4. Update this documentation

### Debugging
- Each module logs its operations with descriptive prefixes
- Use browser dev tools to inspect `AppState` for current state
- Chart instances are accessible via `Charts` object

### Performance
- Charts are destroyed and recreated to prevent memory leaks
- Data filtering is optimized with early returns
- DOM operations use safe accessor functions

## Migration Status

### ✅ Completed
- Configuration management
- Utility functions
- Authentication
- Data processing
- Filter management
- Location charts
- Dashboard metrics
- Date handling
- Main application flow

### 🔄 In Progress
- Chart initialization functions (partial)
- Modal functionality
- Projection calculations

### 📝 TODO
- Complete chart module refactoring
- Add TypeScript definitions
- Implement unit tests
- Add error boundary handling
- Optimize bundle size

## Dependencies

### External Libraries
- **Chart.js**: Chart rendering
- **chartjs-plugin-datalabels**: Chart data labels
- **Flatpickr**: Date picker functionality

### Internal Dependencies
- Each module depends on `config.js` for state management
- `utils.js` is used across all modules
- Modules are loaded in dependency order in `index.html`

## Future Improvements

1. **TypeScript Migration**: Add type safety
2. **Module Bundling**: Use webpack/rollup for optimization
3. **Unit Testing**: Add comprehensive test coverage
4. **Error Boundaries**: Implement proper error handling
5. **Performance Monitoring**: Add performance metrics
6. **Code Splitting**: Lazy load chart modules
