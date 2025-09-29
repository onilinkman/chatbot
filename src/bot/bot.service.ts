import { Injectable, NotFoundException } from '@nestjs/common';
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
import { logAlert } from 'src/Herramientas/herramienta.func';
import { fetchBaileysImage } from './tools/fetchBaylisImg';
import PostMethodUrlImage from 'src/registro_accion/dto/PostMethodUrlImage.dto';

@Injectable()
export class BotService {
    private mapSock: Map<String, WASocket> = new Map();
    private mapResponseText: Map<string, string> = new Map();

    constructor(
        private registroAccionService: RegistroAccionService,
        private sesionesWhatsapp: SesionWhatsappService,
    ) {
        this.conectarAlIniciar();
        this.startCleanupTask();
    }

    private startCleanupTask() {
        setInterval(
            () => {
                this.mapResponseText.clear();
            },
            5 * 60 * 1000,
        );
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

    async deleteSesionWhatsapp(id: number, eliminado: number) {
        try {
            const sw = await this.sesionesWhatsapp.findOne(id);
            if (!sw) throw new NotFoundException('Sesion no encontrada');
            await this.borrarArchivoSesion(sw.nombre_sesion);
            return await this.sesionesWhatsapp.deleteBySession(sw, eliminado);
        } catch (error) {
            throw error;
        }
    }

    async restoreSesionWhatsapp(id: number) {
        return await this.sesionesWhatsapp.deleteById(id, 0);
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

                const timeOut = statusCode === DisconnectReason.timedOut;
                const unavailableService =
                    statusCode === DisconnectReason.unavailableService;
                const connectionClosed =
                    statusCode === DisconnectReason.connectionClosed;

                logAlert('Codigo de error de caida', statusCode);

                if (unavailableService || connectionClosed) {
                    logAlert(
                        '🚧 Servicio de WhatsApp no disponible, reintentando en 2s...',
                    );
                    setTimeout(() => {
                        this.mapSock.delete(nombreSesion);
                        this.conectarWhatsapp(nombreSesion, callback);
                    }, 2000);
                }

                if (restartRequired || timeOut) {
                    logAlert(
                        `♻️ Reiniciando sesión ${nombreSesion} por error 515`,
                    );
                    this.mapSock.delete(nombreSesion);
                    await this.conectarWhatsapp(nombreSesion, callback); // reconexión completa
                }
            }
            if (connection == 'open') {
                logAlert('CONEXION ABIERTA');
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
                //console.log('chats', newChats, newContacts, newMessages);
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

    getTextoMensaje(mensaje: proto.IWebMessageInfo): string {
        const m = mensaje.message;

        if (!m) return '';
        if (m.conversation) return m.conversation;
        if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
        if (m.imageMessage?.caption) return m.imageMessage.caption;
        if (m.videoMessage?.caption) return m.videoMessage.caption;
        if (m.buttonsResponseMessage?.selectedButtonId)
            return m.buttonsResponseMessage.selectedButtonId;
        if (m.listResponseMessage?.singleSelectReply?.selectedRowId)
            return m.listResponseMessage.singleSelectReply.selectedRowId;

        return '';
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
        const msj = this.getTextoMensaje(mensaje);
        const sock = this.mapSock.get(nombreSesion);
        if (!sock || !jid) throw new Error('Error al buscar cliente');
        const rtr = new RespuestaTelefonoRegistroDto();
        rtr.nro_telefono = jid.split('@')[0];
        rtr.mensaje = msj;
        const ra = await this.registroAccionService.registroAccion(
            rtr,
            nombreSesion,
        );
        if (ra.status == 222 && typeof ra.body == 'string') {
            this.enviarArchivo(nombreSesion, jid, ra.body, ra.message);
            return;
        }

        if (ra.status == 223 && typeof ra.body == 'object') {
            this.enviarUrlImagen(
                nombreSesion,
                jid,
                ra.body.url_image,
                ra.body.descripcion,
            );
            return;
        }

        try {
            if (
                (!this.mapResponseText.get(jid) ||
                    this.mapResponseText.get(jid) != ra.body) &&
                typeof ra.body == 'string'
            ) {
                this.mapResponseText.set(jid, ra.body);
                await sock.sendMessage(jid, { text: ra.body });
            }
        } catch (err) {
            let error = err as Error;
            logAlert('Hubo un error al enviar mensaje: ' + error.message);
        }

        //mensaje.key.fromMe   --si el mensaje viene de mi mismo
    }

    async enviarUrlImagen(
        nombreSesion: string,
        nro_whatsapp: string,
        url_image: string,
        descripcion: string,
    ) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) return 'no inicio el servicio de whatsapp';

        const { data, mimetype, fileName } = await fetchBaileysImage(url_image);
        try {
            await sock.sendMessage(nro_whatsapp, {
                image: data,
                fileName,
                mimetype: mimetype,
                caption: `${descripcion} \n`,
            });
        } catch (err) {
            let error = err as Error;
            logAlert('Hubo un error al enviar mensaje: ' + error.message);
        }
    }

    async enviarArchivo(
        nombreSesion: string,
        nro_whatsapp: string,
        pathFile: string,
        nameFile: string,
    ) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) return 'no inicio el servicio de whatsapp';
        try {
            await sock.sendMessage(nro_whatsapp, {
                //document: fs.readFileSync('./public/avancesBiumsa.pdf'),
                document: fs.readFileSync('./public/' + pathFile),
                mimetype: 'application/pdf',
                fileName: pathFile,
                caption: `📄Aquí tienes el documento solicitado: \n  *${nameFile}* \n`,
            });
        } catch (err) {
            let error = err as Error;
            logAlert('Hubo un error al enviar mensaje: ' + error.message);
        }
    }

    async enviarMensaje(
        nombreSesion: string,
        nro_whatsapp: string,
        mensaje: string,
    ) {
        const sock = this.mapSock.get(nombreSesion);
        if (!sock) throw new Error('no inicio el servicio de whatsapp');

        const jid = nro_whatsapp + '@s.whatsapp.net';

        const result = await sock.onWhatsApp(jid);

        if (!result || result.length < 1)
            throw new Error('Numero no registrado en whatsapp ' + nro_whatsapp);

        try {
            await sock.sendMessage(jid, {
                text: mensaje,
            });
            return { mensaje: 'mensaje enviado' };
        } catch (err) {
            let error = err as Error;
            logAlert('Hubo un error al enviar mensaje: ' + error.message);
            throw err;
            //return { mensaje: 'Error al enviar mensaje: ' + error.message };
        }
    }
}
