export const ROUTES = {
    HOME: '/',
    CANVAS: '/canvas',
    EDITOR: '/editor',
} as const;

export type RouteKey = keyof typeof ROUTES;