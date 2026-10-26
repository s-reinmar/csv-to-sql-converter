import { defineConfig, Plugin, ViteDevServer } from 'vite';
import type { PreviewServer } from 'vite';
import * as fs from 'fs/promises';
import * as path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Uniwersalny middleware obsługujący zapis pliku SQL na dysku (w folderze public/resources).
 */
const createSqlSaverMiddleware = () => {
    return async (req: any, res: any, next: () => void) => {
        if (req.url && req.url.includes('/api/save-sql') && req.method === 'POST') {
            let body = '';

            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const { fileName, sqlContent } = data;

                    if (!fileName || !sqlContent) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ message: 'Brak nazwy pliku lub treści SQL.' }));
                        return;
                    }

                    // Zabezpieczenie przed Path Traversal
                    const sanitizedFileName = path.basename(fileName);
                    const targetDir = path.resolve(process.cwd(), 'public/resources');
                    const fullPath = path.join(targetDir, sanitizedFileName);

                    // Upewnienie się, że katalog istnieje
                    await fs.mkdir(targetDir, { recursive: true });

                    // Zapis pliku .sql na dysku
                    await fs.writeFile(fullPath, sqlContent, 'utf-8');

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ filePath: fullPath }));
                } catch (error: unknown) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    const message = error instanceof Error ? error.message : 'Nieznany błąd zapisu.';
                    res.end(JSON.stringify({ message }));
                }
            });
        } else {
            next();
        }
    };
};

export default defineConfig({
    base: './', // Względne ścieżki dla buildu produkcyjnego
    server: {
        port: 3000,
    },
    preview: {
        port: 4173,
    },
    plugins: [
        {
            name: 'sql-file-saver-middleware',
            configureServer(server: ViteDevServer) {
                server.middlewares.use(createSqlSaverMiddleware() as any);
            },
            configurePreview(server: PreviewServer) {
                server.middlewares.use(createSqlSaverMiddleware() as any);
            }
        } as Plugin,
        // Konfiguracja PWA
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Moja Aplikacja TypeScript PWA',
                short_name: 'AppPWA',
                description: 'Opis Twojej aplikacji działającej jako PWA',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
});