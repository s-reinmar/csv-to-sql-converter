import { defineConfig } from 'vite';
import * as fs from 'fs/promises';
import * as path from 'path';

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        {
            name: 'sql-file-saver-middleware',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url === '/api/save-sql' && req.method === 'POST') {
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

                                // Zapis pliku
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
                });
            },
        },
    ],
});