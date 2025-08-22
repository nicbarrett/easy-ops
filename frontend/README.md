# Sweet Swirls Operations App - Frontend

A mobile-first React TypeScript application for managing ice cream production and inventory operations.

## Features

- **Mobile-First Design**: Optimized for 360px - 1280px viewports
- **Role-Based Access Control**: Admin, Production Lead, Shift Lead, Team Member roles
- **Real-Time Dashboard**: Low stock alerts, production requests, batch tracking
- **Inventory Management**: Item library, stock tracking, inventory sessions
- **Production Tracking**: Request workflow, batch recording, waste management
- **Responsive Layout**: Adaptive navigation and touch-friendly interfaces

## Tech Stack

- **React 19** with TypeScript
- **CSS Modules** for component styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **Date-fns** for date handling

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Running Sweet Swirls API backend on port 8080

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Default Login

Since this connects to the backend API, you'll need to create users through the backend or use seeded test data.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── layout/         # Layout components
│   ├── inventory/      # Inventory-specific components
│   └── production/     # Production-specific components
├── pages/              # Route-level page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard page
│   ├── inventory/     # Inventory management pages
│   └── production/    # Production management pages
├── services/           # API client and external services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── styles/             # Global styles and CSS modules
└── utils/              # Utility functions
```

## API Integration

The frontend connects to the Spring Boot backend API at `http://localhost:8080/api` by default.

### Environment Configuration

```bash
# .env file
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=Sweet Swirls Operations
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- Settings configuration

### Production Lead  
- Production planning and approval
- Recipe management
- Batch recording

### Shift Lead
- Daily operations
- Inventory sessions
- Task assignment

### Team Member
- View tasks
- Basic inventory counts
- Production status updates

## Design System

The app uses a custom CSS design system with:

- **Color Palette**: Ice cream inspired colors with semantic naming
- **Typography Scale**: Responsive text sizing (xs to 3xl)
- **Spacing System**: Consistent spacing units (4px base)
- **Component Tokens**: Reusable design tokens for consistency

### CSS Modules Usage

```tsx
import styles from './Component.module.css';
import globals from '../../styles/globals.module.css';

function Component() {
  return (
    <div className={`${styles.container} ${globals.flex} ${globals.gap4}`}>
      {/* Component content */}
    </div>
  );
}
```

## Mobile Responsive Features

- **Touch-Friendly**: 44px minimum touch targets
- **Adaptive Navigation**: Collapsible sidebar on mobile
- **Optimized Forms**: Large input fields and buttons
- **Gesture Support**: Swipe navigation where appropriate

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML and ARIA labels
- **High Contrast**: Support for high contrast mode
- **Focus Management**: Visible focus indicators

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is proprietary software for Sweet Swirls ice cream operations.
