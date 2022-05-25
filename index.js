const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, msgRetryCounterMap } = require("@adiwajshing/baileys")
const { connectionFileName } = require("./config/configFile")
const { state, saveState } = useSingleFileAuthState(connectionFileName())
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const { core } = require('./lib')
const logger = MAIN_LOGGER.child({ })
const Pino = require("pino")
const fs = require('fs')

  try {
        const startSock = async () => {
            const { version } = await fetchLatestBaileysVersion()

          //Retry Handler
const handler = new MessageRetryHandler();
          
            const sock = makeWASocket({ 
              version, 
              logger: Pino({ level: "silent" }), 
              printQRInTerminal: true, 
              auth: state,
              msgRetryCounterMap,
	          	getMessage: handler.messageRetryHandler
                                      })
          
            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close')
                    lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                        ? startSock() : fs.unlinkSync('./connect.json')
              if (connection) { console.log("Connection Status: ", connection); }
            })
          

          
          
            sock.ev.on('creds.update', saveState)


            sock.ev.on('messages.upsert', async m => await core(sock, m))
            sock.ev.on('group-participants.update', async (anu) => {              
                console.log(anu)
              if(anu.participants[0] == "6283157447725@s.whatsapp.net") return
                try {
                    let metadata = await sock.groupMetadata(anu.id)
                    let participants = anu.participants
                    for (let num of participants) {
                        // Get Profile Picture User
                        try {
                            ppuser = await sock.profilePictureUrl(num, 'image')
                        } catch {
                            ppuser = './assets/pp.jpg'
                        }

                        // Get Profile Picture Group
                        try {
                            ppgroup = await sock.profilePictureUrl(anu.id, 'image')
                        } catch {
                            ppgroup = './assets/pp.jpg'
                        }

                        if (anu.action == 'add') {
                            sock.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `Halo @${num.split("@")[0]} Selamat Datang di Grup *${metadata.subject}*` })
                        } else if (anu.action == 'remove') {
                            sock.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `Sayonara @${num.split("@")[0]}` })
                        }
                       
                    }
                } catch (err) {
                    console.log(err)
                }
            })




        }
        startSock()
    } catch (e) { reject(e) }


//WEB SERVER

const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")


const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile('megumi.html', { root: __dirname })
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Megumi Server is Active in Port: " + PORT);
});


          //WEB SERVER