
/**
 * Paket um den Wetter-Dienst von Code your Life anzusprechen.
 * @author Marian Mehling
 * @version 0.3
 */

/**
 * Befehle für das senden von Wetterdaten an den Code your Life Wetter-Server.
 */
//% weight=2 color=#b4009f icon="\uf1eb" block="Code your Life"
//% parts="Code your Life"
namespace cyl {

    /*
    let wifiPass = ""
    let wifiName = ""
    let wUrl = "momatita.kleeberg.berlin"
    let port = "3001"
    let initDone = false
    let connDone = false
    */

    /**
     * Mit diesem Block wird die Verbindung zu einem "Code your Life" WLAN-Modul hergestellt.
     */
    //% blockId=custom_initWifi block="mit dem WLAN-Modul verbinden"
    export function initWifi(): void {
        modem.init(
            SerialPin.C17,
            SerialPin.C16,
            BaudRate.BaudRate9600
        )
        // switch to 115200, 8N1 and reset, just to be sure
        modem.pushAT("+UART=115200,8,1,0,0")
        basic.pause(500)
        modem.pushAT("+RST")
        basic.pause(2000)
        modem.init(
            SerialPin.C17,
            SerialPin.C16,
            BaudRate.BaudRate115200
        )
        let tmp = input.lightLevel() // erste messung ergibt immer 255, deswegen hier ne messung um fehler zu vermeiden
        // allocate as much memory as possible, or we will lose data
        serial.setReceiveBufferSize(254)
        // clear buffer
        serial.readString();
        modem.expectOK("E0");

        // init wurde durchgefuehrt
        //initDone = true
    }

    /**
     * Mit diesem Block baut das verbundene WLAN-Modul ein Netzwerkverbindung zu einem Hotspot auf.
     * @param name Name des WLAN-Netzwerkes, eg: "Name des WLAN"
     * @param pass Passwort des WLAN-Netzwerkes, eg: "Passwort des WLAN"
     */
    //% blockId=custom_connectWifi block="mit WLAN verbinden:|Name %name|Passwort %pass"
    export function connectWifi(name: string, pass: string): void {
        /*if (!initDone) {
            // pruefen ob init durchgefuehrt wurde
            basic.showString("FEHLER")
            return
        }*/

        let repeat = true
        //wifiName = name
        //wifiPass = pass
        while (repeat) {
            if (modem.expectOK("+CWMODE=1")) {
                modem.pushAT("+CWJAP=\"" + name + "\",\"" + pass + "\"")
                repeat = false
                basic.pause(10000)
                // connect wurde durchgefuehrt
            }
            basic.pause(500)
        }
        //connDone = true
    }

    /**
     * Mit diesem Block werden Wetterdaten an den Code your Life Wetter-Server gesendent. 
     * Dafür wird eine Wetter-ID benötigt, welche Schulen und andere Einrichtungen von Code your Life erhalten können.
     * @param key Wetter-ID der die Wetterdaten zugeordnet werden sollen, eg: "deine Wetter-ID"
     * @param temp Temperatur die gesendet werden soll, eg: 0
     * @param light Helligkeit die gesendet werden soll, eg: 0
     * @param wind Windstärke die gesendet werden soll, eg: 0
     * @param rain Niederschlagshöhe die gesendet werden soll, eg: 0
     */
    //% blockId=custom_sendData block="Wetterdaten an den Server senden|Wetter-ID %key|Temperatur %temp|Helligkeit %light|Windstärke %wind|Niederschlag %rain"
    export function sendData(key: string, temp: number, light: number, wind: number, rain: number): void {
        /*if (!connDone) {
            // pruefen ob connect durchgefuehrt wurde
            basic.showString("FEHLER")
            return
        }*/
        let message = "{ \"key\": \"" + key + "\", \"temp\": " + temp + ", \"light\": " + light + ", \"wind\": " + wind + ", \"rain\": " + rain + " }"

        /*
        let repeat = true
        while (repeat) {
            let data = modem.sendAT("+CWJAP?")
            if (data.length >= 2 && data[data.length - 2].compare("No AP") != 0 && data[data.length - 1].compare("OK") == 0) {
                repeat = false
            } else {
                let repeat1 = true
                while (repeat1) {
                    if (modem.expectOK("+CWMODE=1")) {
                        modem.pushAT("+CWJAP=\"" + wifiName + "\",\"" + wifiPass + "\"")
                        repeat1 = false
                        basic.pause(10000)
                    }
                }
            }
        }
        */
        let fail = true
        while (fail) {
            if (modem.expectOK("+CIPMODE=0")) {
                if (modem.expectOK("+CIPSTART=\"TCP\",\"" + wUrl + "\"," + port + "")) {
                    basic.pause(500)
                    modem.pushAT("+CIPSEND=" + message.length)
                    basic.pause(500)
                    serial.writeString(message)
                    basic.pause(500)
                    fail = !(modem.expectOK("+CIPCLOSE"))
                }
            }
        }
    }
}
