import { Injectable } from '@nestjs/common';
import makeWASocket, {
    AuthenticationState,
    DisconnectReason,
    initAuthCreds,
    proto,
    SignalDataTypeMap,
    useMultiFileAuthState,
    WASocket,
} from 'baileys';
import P from 'pino';
import { toString } from 'qrcode';
import { CreateSesionWhatsappDto } from 'src/sesion_whatsapp/dto/create-sesion_whatsapp.dto';
import { UpdateSesionWhatsappDto } from 'src/sesion_whatsapp/dto/update-sesion_whatsapp.dto';
import { SesionWhatsappService } from 'src/sesion_whatsapp/sesion_whatsapp.service';

@Injectable()
export class BotService {
    private sock: WASocket | null = null;

    constructor(
        private readonly sesionWhatsappService: SesionWhatsappService,
    ) {}

    async conectarWhatsapp() {
        const { state, saveCreds } = await this.useDatabaseAuthState(1);

        this.sock = makeWASocket({
            auth: state,
            logger: P(),
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { qr } = update;
            if (typeof qr === 'string' && qr.length > 0) {
                const qrTerminal = await toString(qr, {
                    type: 'terminal',
                    small: true,
                });
                console.log(qrTerminal);
            }
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const puedeConectar =
                    (lastDisconnect?.error as any)?.output?.statusCode !==
                    DisconnectReason.restartRequired;
                if (puedeConectar) {
                    console.log('conectando....');
                    this.conectarWhatsapp();
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

    async useDatabaseAuthState(id: number): Promise<{
        state: AuthenticationState;
        saveCreds: () => Promise<void>;
    }> {
        // 1. Leer credenciales y llaves desde la base de datos
        const sesion_whatsapp =
            await this.sesionWhatsappService.findOneByName('client-one');
        const credsFromDb = sesion_whatsapp?.creds; //tuDb.obtener('wa_creds');
        const keysFromDb = sesion_whatsapp?.keys; //tuDb.obtener('wa_keys');

        let creds: AuthenticationState['creds'];
        if (credsFromDb) {
            creds =
                typeof credsFromDb === 'string'
                    ? JSON.parse(credsFromDb)
                    : credsFromDb;
        } else {
            creds = initAuthCreds();
        }
        let keys: Partial<SignalDataTypeMap> = {};
        if (keysFromDb) {
            keys =
                typeof keysFromDb === 'string'
                    ? JSON.parse(keysFromDb)
                    : keysFromDb;
        }

        const state: AuthenticationState = {
            creds,
            keys: {
                get: async (type, ids) => {
                    // Recupera las llaves del objeto keys en memoria
                    const result: any = {};
                    for (const id of ids) {
                        if (keys[type] && keys[type][id]) {
                            result[id] = keys[type][id];
                        }
                    }
                    return result;
                },
                set: async (data) => {
                    // Actualiza el objeto keys en memoria
                    for (const _type in data) {
                        if (!keys[_type]) keys[_type] = {};
                        Object.assign(keys[_type], data[_type]);
                    }
                },
            },
        };

        const saveCreds = async () => {
            if (!state.creds) {
                console.error('No hay creds para guardar');
                return;
            }
            if (!state.keys) {
                console.error('No hay keys para guardar');
                return;
            }

            const createSesionWhatsappDto: CreateSesionWhatsappDto = {
                creds: JSON.stringify(state.creds),
                keys: JSON.stringify(keys), // <-- agrega esto 
                name: 'client-one',
                telefono: '123456789',
            };
            try {
                const sw =
                    await this.sesionWhatsappService.findOneByName(
                        'client-one',
                    );
                if (sw) {
                    await this.sesionWhatsappService.update(1, {
                        creds: JSON.stringify(creds),
                        keys: JSON.stringify(keys),
                    });
                } else {
                    await this.sesionWhatsappService.create(
                        createSesionWhatsappDto,
                    );
                }
            } catch (error) {
                console.error('Error guardando sesión:', error);
            }
            // Guarda también las llaves si es necesario
        };

        return { state, saveCreds };
    }
}
