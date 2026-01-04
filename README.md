# ProbData - Prediction Market Data Platform

A professional prediction market data platform focused on Polymarket, providing deep analytics and professional trading insights.

## Features

- **Trending Page**: Real-time market data with volume, OI, depth analysis
- **Event Detail**: Price charts, order book, market stats, holder/trader analysis
- **User Detail**: Trading stats, profit curves, behavior analysis with radar charts
- **Search**: Search events and user addresses

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark theme)
- **State**: Zustand + TanStack Query
- **Routing**: React Router v7
- **Animation**: Framer Motion
- **Charts**: TradingView Lightweight Charts (coming soon)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── api/                # API layer (Polymarket CLOB/Gamma)
├── components/
│   ├── common/         # Shared UI components
│   ├── layout/         # Header, PageLayout
│   ├── charts/         # Price/Radar charts
│   ├── orderbook/      # Order book component
│   └── tables/         # Data tables
├── pages/
│   ├── Trending/       # Market list
│   ├── EventDetail/    # Event details
│   ├── UserDetail/     # User profile
│   └── Search/         # Search results
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── utils/              # Helper functions
└── types/              # TypeScript types
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Trending markets |
| `/trending` | Trending markets |
| `/event/:eventId` | Event detail page |
| `/user/:address` | User detail page |
| `/search?q=` | Search results |

## Development Roadmap

- [x] **M1**: Project setup, routing, layout, placeholder pages
- [x] **M2**: API integration (Polymarket CLOB/Gamma) - API layer implemented with types, hooks, and utilities
- [x] **M3**: Trending page with real data - Full market list with sorting, filtering, and live data
- [x] **M4**: Event detail with charts & order book - Complete event page with OrderBook, price charts, and stats
- [x] **M5**: User detail with radar charts - Complete user profile with stats, profit chart, and behavior analysis
- [x] **M6**: Polish & animations - Search page, error boundaries, responsive design, and final polish

## API Integration

The project includes complete API integration layer for Polymarket:

- **Gamma API** (`src/api/polymarket/gamma.ts`): Market listings, event details
- **CLOB API** (`src/api/polymarket/clob.ts`): Order books, price history, trades, user positions
- **WebSocket** (`src/api/polymarket/websocket.ts`): Real-time order book updates
- **Mock Data** (`src/api/mock/markets.ts`): Enhanced mock data service simulating real Polymarket responses
- **React Hooks** (`src/hooks/`): Data fetching with TanStack Query
- **Utils** (`src/utils/`): Formatting, calculations, constants

**Note**: Currently using mock data service due to Polymarket API access restrictions. The API layer is fully implemented and can switch to real data by changing `USE_MOCK_DATA = false` in API files.

## Features Implemented

### Trending Page ✓
- Market list with 100+ simulated markets
- Real-time data with TanStack Query
- Sortable columns (Volume, OI, Price Change, Name)
- Category filtering (Crypto, Politics, Sports, Entertainment)
- Calculated metrics:
  - 24h Volume & Open Interest
  - Bid/Ask Depth
  - Depth Skew
  - Price changes (1h, 6h, 24h)
  - OI change percentage
- Click to navigate to event details
- Loading states and error handling
- Smooth animations with Framer Motion

### Event Detail Page ✓
- Complete event header with status, category, and countdown
- **OrderBook component** with real-time bid/ask display
  - Visual depth bars showing order size
  - Spread calculation and display
  - Support for 15+ price levels
- **Price Chart** with custom canvas rendering
  - Historical price data visualization
  - Time interval selection (1s - 1w)
  - Gradient fill and smooth animations
- **Market Stats panel** with comprehensive metrics:
  - Volume & Open Interest
  - Bid/Ask depth from live order book
  - Depth Skew calculation
  - Price changes (1h, 6h, 24h)
- Interactive tabs (Holders, Top Traders, Activity)
- Direct link to trade on Polymarket
- Full integration with useMarket, useOrderBook, usePriceHistory hooks

### User Detail Page ✓
- User header with address, total P&L, ROI, and win rate
- **Three stats cards** displaying comprehensive user metrics:
  - Account info (address, balance)
  - P&L overview (realized, unrealized, ROI across timeframes)
  - Trading statistics (markets, trades, volume, win rate, best/worst trades)
- **Profit Chart** with custom canvas rendering
  - 30-day profit/loss curve visualization
  - Color-coded (green for profit, red for loss)
  - Zero-line reference with gradient fills
- **Two Radar Charts** for behavioral analysis:
  - Category distribution (Crypto, Politics, Sports, Entertainment, Finance)
  - Trader behavior profile (Smart Money, Trend Follower, Contrarian, Noise Trader)
- Interactive tabs (Holdings, Trade History, Activity)
- Smooth animations with Framer Motion
- Full integration with useUserProfile hook and mock data service

### Search Page ✓
- **Event search** with real-time filtering
  - Search by event name, description, or category tags
  - Display up to 10 matching events with prices and volumes
  - Click to navigate to event detail page
  - Animated result cards with hover effects
- **User/Address search** with smart detection
  - Auto-detect wallet addresses (0x format)
  - Display user profile preview with balance, P&L, and ROI
  - Click to navigate to user detail page
- **Empty states** with helpful tips and guidance
- Loading states and smooth animations
- Responsive design for all screen sizes

### Polish & Quality ✓
- **Error Boundaries**: Graceful error handling with reload option
- **Responsive Design**: Full mobile/tablet adaptation with breakpoints
  - Mobile-first approach with stacked layouts on small screens
  - Tablet optimization with 2-column grids
  - Desktop experience with full 12-column grid system
- **Performance**: Optimized rendering and data fetching
- **Dark Theme**: Consistent color scheme across all pages
- **Animations**: Smooth transitions with Framer Motion
- **Type Safety**: Full TypeScript coverage

## License

MIT
