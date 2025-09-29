export interface FetchBaileysImageResult {
    data: Buffer;
    mimetype: string;
    fileName: string;
}

export interface FetchBaileysImageOpts {
    maxBytes?: number; // Tamaño máximo permitido
    timeoutMs?: number; // Tiempo máximo de espera
    defaultName?: string; // Nombre si no se puede deducir
}

export async function fetchBaileysImage(
    url: string,
    opts: FetchBaileysImageOpts = {},
): Promise<FetchBaileysImageResult> {
    const {
        maxBytes = 10 * 1024 * 1024, // 10MB
        timeoutMs = 20_000, // 20s
        defaultName = 'image',
    } = opts;

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            redirect: 'follow',
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} al descargar: ${url}`);
        }

        const mime = res.headers.get('content-type') ?? '';
        if (!mime.startsWith('image/')) {
            throw new Error(`Contenido no es imagen (content-type: "${mime}")`);
        }

        const lenHeader = res.headers.get('content-length');
        if (lenHeader) {
            const len = Number(lenHeader);
            if (!isNaN(len) && len > maxBytes) {
                throw new Error(
                    `Imagen demasiado grande (${len} B > ${maxBytes} B)`,
                );
            }
        }

        const reader = res.body?.getReader();
        if (!reader) {
            const ab = await res.arrayBuffer();
            const buf = Buffer.from(ab);
            if (buf.byteLength > maxBytes) {
                throw new Error(
                    `Imagen demasiado grande (${buf.byteLength} B > ${maxBytes} B)`,
                );
            }
            return {
                data: buf,
                mimetype: mime,
                fileName: deduceFileName(url, mime, defaultName),
            };
        }

        let received = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                received += value.byteLength;
                if (received > maxBytes) {
                    reader.cancel();
                    throw new Error(
                        `Imagen demasiado grande (${received} B > ${maxBytes} B)`,
                    );
                }
                chunks.push(value);
            }
        }

        const data = Buffer.concat(chunks.map((u8) => Buffer.from(u8)));
        return {
            data,
            mimetype: mime,
            fileName: deduceFileName(url, mime, defaultName),
        };
    } finally {
        clearTimeout(to);
    }
}

function deduceFileName(url: string, mime: string, fallback: string): string {
    try {
        const u = new URL(url);
        const last = u.pathname.split('/').filter(Boolean).pop() ?? '';
        const hasExt = /\.[a-z0-9]{2,5}$/i.test(last);
        if (hasExt) return last;

        const ext = mimeToExt(mime) ?? 'bin';
        return `${fallback}.${ext}`;
    } catch {
        const ext = mimeToExt(mime) ?? 'bin';
        return `${fallback}.${ext}`;
    }
}

function mimeToExt(mime: string): string | null {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/avif': 'avif',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg',
    };
    return map[mime] ?? null;
}
