---
name: "Modern React Project Template"
description: "A comprehensive development guide for modern frontend projects based on React 18 + TypeScript + Vite, including complete development standards and best practices"
category: "Frontend Framework"
author: "Agents.md Collection"
authorUrl: "https://github.com/gakeez/agents_md_collection"
tags: ["react", "typescript", "vite", "frontend", "spa"]
lastUpdated: "2024-12-19"
---

# Modern React Project Development Guide

## Project Overview

This is a modern frontend project template based on React 18, TypeScript, and Vite. It's suitable for building high-performance Single Page Applications (SPA) with integrated modern development toolchain and best practices.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand / Redux Toolkit
- **Routing**: React Router v6
- **UI Components**: Ant Design / Material-UI
- **Styling**: Tailwind CSS / Styled-components
- **Testing Framework**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky

## Project Structure
```
app/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── components/         # Reusable components
│   │   ├── common/        # Common components (to be created)
│   │   ├── ui/            # UI components (to be created)
│   │   └── Navbar.tsx     # Existing navbar
│   ├── pages/             # Page components (to be created)
│   │   ├── HomePage.tsx
│   │   ├── CanvasPage.tsx
│   │   └── EditorPage.tsx
│   ├── hooks/             # Custom Hooks (to be created)
│   │   └── useAuth.ts
│   ├── store/             # State management (to be created)
│   │   └── appStore.ts
│   ├── services/          # API services (to be created)
│   │   └── api.ts
│   ├── utils/             # Utility functions (to be created)
│   │   └── helpers.ts
│   ├── types/             # TypeScript type definitions (to be created)
│   │   └── index.ts
│   ├── styles/            # Global styles (to be created)
│   │   └── globals.css
│   ├── constants/         # Constants (to be created)
│   │   └── routes.ts
│   ├── App.tsx            # Existing
│   ├── App.css            # Existing
│   ├── main.tsx           # Existing
│   └── index.css          # Existing
├── tests/                 # Test files (to be created)
│   └── components/
│       └── Navbar.test.tsx
├── docs/                  # Project documentation (to be created)
│   └── API.md
├── .env.example           # Environment variables example (to be created)
├── package.json           # Existing
├── tsconfig.json          # Existing
├── tsconfig.app.json      # Existing
├── tsconfig.node.json     # Existing
├── vite.config.ts         # Existing
├── eslint.config.js       # Existing
└── README.md              # Existing
```

## Development Guidelines

### Component Development Standards

1. **Function Components First**: Use function components and Hooks
2. **TypeScript Types**: Define interfaces for all props
3. **Component Naming**: Use PascalCase, file name matches component name
4. **Single Responsibility**: Each component handles only one functionality

```tsx
// Example: Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'medium',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### State Management Standards

Using Zustand for state management:

```tsx
// store/userStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

## Environment Setup

### Development Requirements
- Node.js >= 18.0.0
- npm >= 8.0.0 or yarn >= 1.22.0

### Installation Steps
```bash
# 1. Create project
npm create vite@latest my-react-app -- --template react-ts

# 2. Navigate to project directory
cd my-react-app

# 3. Install dependencies
npm install

# 4. Install additional dependencies
npm install zustand react-router-dom
npm install -D @types/node

# 5. Start development server
npm run dev
```

### Environment Variables Configuration
```env
# .env.local
VITE_APP_TITLE=ERD Studio
VITE_ENABLE_MOCK=false
```

## Routing Configuration

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Testing Strategy

### Unit Testing Example
```tsx
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Click me
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Optimization

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memory Optimization
```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Deployment Configuration

### Build Production Version
```bash
npm run build
```

### Vite Configuration Optimization
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

## Common Issues

### Issue 1: Vite Development Server Slow Startup
**Solution**:
- Check dependency pre-build cache
- Use `npm run dev -- --force` to force rebuild
- Optimize optimizeDeps configuration in vite.config.ts

### Issue 2: TypeScript Type Errors
**Solution**:
- Ensure correct type definition packages are installed
- Check tsconfig.json configuration
- Use `npm run type-check` for type checking

## Reference Resources

- [React Official Documentation](https://react.dev/)
- [Vite Official Documentation](https://vitejs.dev/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)