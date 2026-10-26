import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';

/**
 * Adapter przeglądarkowy implementujący zapis pliku SQL (pobieranie przez Blob w PWA).
 */
export class BrowserSqlFileRepository implements ISqlFileRepository {
    public async saveSql(fileName: string, sqlContent: string): Promise<string> {
        const safeFileName = fileName.trim() || 'query.sql';
        const downloadName = safeFileName.toLowerCase().endsWith('.sql')
            ? safeFileName
            : `${safeFileName}.sql`;
        const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = downloadName;
        link.hidden = true;

        try {
            document.body.appendChild(link);
            link.click();
        } finally {
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        return downloadName;
    }

    public saveSqlFile(fileName: string, sqlContent: string): Promise<string> {
        return this.saveSql(fileName, sqlContent);
    }
}