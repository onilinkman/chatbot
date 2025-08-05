import { Injectable } from '@nestjs/common';
import makeWASocket, {
    DisconnectReason,
    proto,
    useMultiFileAuthState,
    WASocket,
} from 'baileys';
import P from 'pino';
import { toDataURL, toString } from 'qrcode';

@Injectable()
export class BotService {
    private mapSock: Map<String, WASocket> = new Map();

    constructor() {}

    async conectarWhatsapp(
        nombreSesion: string,
        callback: (qrUrl: string) => void,
    ) {
        /* const { state, saveCreds } =
            await useMultiFileAuthState('auth_info_baileys'); */
        const { state, saveCreds } = await useMultiFileAuthState(nombreSesion);
        //const { state, saveCreds } = await this.useDatabaseAuthState(1);

        let sock: WASocket | null | undefined = null;

        if (!this.mapSock?.get(nombreSesion)) {
            sock = makeWASocket({
                auth: state,
                logger: P(),
            });
            this.mapSock?.set(nombreSesion, sock);
        } else {
            sock = this.mapSock.get(nombreSesion);
        }

        if (!sock) return;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { qr } = update;
            if (typeof qr === 'string' && qr.length > 0) {
                /* const qrTerminal = await toString(qr, {
                    type: 'terminal',
                    small: true,
                });
                console.log(qrTerminal); */

                const qrUrl = await toDataURL(qr);
                callback(qrUrl);
            }
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                this.mapSock.delete(nombreSesion);
                const puedeConectar =
                    (lastDisconnect?.error as any)?.output?.statusCode !==
                    DisconnectReason.restartRequired;
                if (puedeConectar) {
                    this.conectarWhatsapp(nombreSesion, callback);
                }
            } else if (connection == 'open') {
                console.log('CONEXION ABIERTA');
            }
        });
        sock.ev.on(
            'messaging-history.set',
            ({
                chats: newChats,
                contacts: newContacts,
                messages: newMessages,
                syncType,
            }) => {
                console.log('chats', newChats, newContacts, newMessages);
            },
        );
        sock.ev.on('messages.upsert', async ({ type, messages }) => {
            const message = messages[0];
            const id = message.key.remoteJid;
            if (
                type != 'notify' ||
                message.key.fromMe ||
                id?.includes('@broadcast') ||
                id?.includes('@g.us')
            ) {
                return;
            }
            await sock.readMessages([message.key]);
            if (type == 'notify') {
                // new messages
                for (const message of messages) {
                    await this.recibirMensajes(message);
                }
            } else {
                // old already seen / handled messages
                // handle them however you want to
                console.log('antiguos', messages);
            }
        });
    }

    async recibirMensajes(mensaje: proto.IWebMessageInfo) {
        const nro_whatsapp = mensaje.key.remoteJid;
        console.log('numero whatsapp:', nro_whatsapp);
        console.log('nuevo', mensaje.message);
        //mensaje.key.fromMe   --si el mensaje viene de mi mismo
    }

    async enviarMensaje(nombreSesion: string, nro_whatsapp, mensaje: string) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) throw new Error('Error al buscar cliente');
        if (!sock) return 'no inicio el servicio de whatsapp';

        await sock.sendMessage(nro_whatsapp, {
            text: mensaje,
        });
        return { mensaje: 'mensaje enviado' };
    }
}
