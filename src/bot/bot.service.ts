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
    private sock: WASocket | null = null;
    private mapSock: Map<String, WASocket> | null = null;

    constructor() {}

    async conectarWhatsapp(callback: (qrUrl: string) => void) {
        /* const { state, saveCreds } =
            await useMultiFileAuthState('auth_info_baileys'); */
        const { state, saveCreds } = await useMultiFileAuthState('client-one');
        //const { state, saveCreds } = await this.useDatabaseAuthState(1);

        this.sock = makeWASocket({
            auth: state,
            logger: P(),
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
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
                const puedeConectar =
                    (lastDisconnect?.error as any)?.output?.statusCode !==
                    DisconnectReason.restartRequired;
                if (puedeConectar) {
                    this.conectarWhatsapp((qrr) => {});
                }
            } else if (connection == 'open') {
                console.log('CONEXION ABIERTA');
            }
        });
        this.sock.ev.on(
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
        this.sock.ev.on('messages.upsert', ({ type, messages }) => {
            if (type == 'notify') {
                // new messages
                for (const message of messages) {
                    this.recibirMensajes(message);
                }
            } else {
                // old already seen / handled messages
                // handle them however you want to
                console.log(messages);
            }
        });
    }

    recibirMensajes(mensaje: proto.IWebMessageInfo) {
        const nro_whatsapp = mensaje.key.remoteJid;
        console.log('numero whatsapp:', nro_whatsapp);
        console.log(mensaje.message?.conversation);
        //mensaje.key.fromMe   --si el mensaje viene de mi mismo
    }

    async enviarMensaje(nro_whatsapp, mensaje: string) {
        if (!this.sock) return 'no inicio el servicio de whatsapp';

        await this.sock.sendMessage(nro_whatsapp, {
            text: mensaje,
        });
        return { mensaje: 'mensaje enviado' };
    }
}
