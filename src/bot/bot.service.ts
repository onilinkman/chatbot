import { Injectable } from '@nestjs/common';
import makeWASocket, {
    DisconnectReason,
    proto,
    useMultiFileAuthState,
    WASocket,
} from 'baileys';
import P from 'pino';
import { toDataURL, toString } from 'qrcode';
import { RespuestaTelefonoRegistroDto } from 'src/registro_accion/dto/respuesta-telefono-registro.dto';
import { RegistroAccionService } from 'src/registro_accion/registro_accion.service';
import { SesionWhatsappService } from 'src/sesion_whatsapp/sesion_whatsapp.service';
import * as fs from 'fs';

@Injectable()
export class BotService {
    private mapSock: Map<String, WASocket> = new Map();

    constructor(
        private registroAccionService: RegistroAccionService,
        private sesionesWhatsapp: SesionWhatsappService,
    ) {
        this.conectarAlIniciar();
    }

    async conectarAlIniciar() {
        const sw = await this.sesionesWhatsapp.findAll();
        sw.forEach((value) => {
            this.conectarWhatsapp(value.nombre_sesion, (qrUrl) => {});
        });
    }

    async generarNuevoQr(
        nombreSesion: string,
        callback: (qrUrl: string) => void,
    ) {
        await this.borrarArchivoSesion(nombreSesion);
        await this.conectarWhatsapp(nombreSesion, callback);
    }

    async borrarArchivoSesion(nombreSesion: string) {
        const sock = this.mapSock.get(nombreSesion);
        if (sock) {
            try {
                await sock.logout();
            } catch {}
            this.mapSock.delete(nombreSesion);
        }

        const fs = require('fs');
        const path = `./${nombreSesion}`;
        if (fs.existsSync(path)) {
            fs.rmSync(path, { recursive: true, force: true });
        }
    }

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
            console.log('conectando update :', nombreSesion, update);
            console.log('estado ', nombreSesion, update.connection);
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
                const statusCode = (lastDisconnect?.error as any)?.output
                    ?.statusCode;
                const restartRequired =
                    statusCode === DisconnectReason.restartRequired;

                if (restartRequired) {
                    console.log(
                        `♻️ Reiniciando sesión ${nombreSesion} por error 515`,
                    );
                    this.mapSock.delete(nombreSesion);
                    await this.conectarWhatsapp(nombreSesion, callback); // reconexión completa
                }
            }
            if (connection == 'open') {
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
                    await this.recibirMensajes(message, nombreSesion);
                }
            } else {
                // old already seen / handled messages
                // handle them however you want to
                console.log('antiguos', messages);
            }
        });
    }

    async recibirMensajes(
        mensaje: proto.IWebMessageInfo,
        nombreSesion: string,
    ) {
        const nro_whatsapp = mensaje.key.remoteJid;
        const jid = mensaje.key.remoteJid;
        /* console.log('numero whatsapp:', nro_whatsapp, jid);
        console.log('nuevo', mensaje.message);
        console.log('mensaje', mensaje.message?.conversation); */
        const msj = mensaje.message?.conversation ?? '';
        const sock = this.mapSock.get(nombreSesion);
        if (!sock || !jid) throw new Error('Error al buscar cliente');
        const rtr = new RespuestaTelefonoRegistroDto();
        rtr.nro_telefono = jid.split('@')[0];
        rtr.mensaje = msj;
        const ra = await this.registroAccionService.registroAccion(rtr);
        //this.enviarArchivo(nombreSesion, jid, 'hola');

        await sock.sendMessage(jid, { text: ra.body });

        //mensaje.key.fromMe   --si el mensaje viene de mi mismo
    }

    async enviarArchivo(
        nombreSesion: string,
        nro_whatsapp: string,
        pathFile: string,
    ) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) return 'no inicio el servicio de whatsapp';
        await sock.sendMessage(nro_whatsapp, {
            //document: fs.readFileSync('./public/avancesBiumsa.pdf'),
            document: fs.readFileSync('./public/' + pathFile),
            mimetype: 'application/pdf',
            fileName: 'avancesBiumsa.pdf',
        });
    }

    async enviarMensaje(
        nombreSesion: string,
        nro_whatsapp: string,
        mensaje: string,
    ) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) return 'no inicio el servicio de whatsapp';

        const jid = nro_whatsapp + '@s.whatsapp.net';

        await sock.sendMessage(jid, {
            text: mensaje,
        });
        return { mensaje: 'mensaje enviado' };
    }
}
