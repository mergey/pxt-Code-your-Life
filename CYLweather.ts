
/**
 * Paket von Code your Life
 * @author Marian Mehling
 * @version 0.3
 */


/**
 * Befehle für das senden von Wetterdaten an den Code your Life Wetter-Server.
 */
//% weight=100 color=#b4009f icon="\uf1eb" block="Code your Life"
namespace custom {

    /**
     * Mit diesem Block können enventuell auftretende Fehler behoben werden.
     */
    //% blockId=custom_resetWifi block="das WLAN-Modul zurücksetzen"
    export function resetWifi(): void {
        basic.clearScreen()
        led.plot(0, 0)
        modem.init(
            SerialPin.C17,
            SerialPin.C16,
            BaudRate.BaudRate9600
        )
        modem.pushAT('+UART=115200,8,1,0,0')
        basic.pause(500)
        modem.pushAT('+RST')
        basic.pause(2000)
        led.plot(1, 0)
        modem.init(
            SerialPin.C17,
            SerialPin.C16,
            BaudRate.BaudRate56700
        )
        modem.pushAT('+UART=115200,8,1,0,0')
        basic.pause(500)
        modem.pushAT('+RST')
        basic.pause(2000)
        led.plot(2, 0)
        modem.init(
            SerialPin.C17,
            SerialPin.C16,
            BaudRate.BaudRate115200
        )
        modem.pushAT('+CWJAP="namexX00","passwordxX00"')
        basic.pause(3000)
        led.plot(3, 0)
        basic.pause(2000)
        modem.pushAT('+RST')
        led.plot(4, 0)
    }

    /**
     * Mit diesem Block wird die Verbindung zu einem "Code your Life" WLAN-Modul hergestellt.
     */
    //% blockId=custom_initWifi block="mit dem WLAN-Modul verbinden"
    export function initWifi(): void {
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
        modem.expectOK('E0');
    }

    /**
     * Mit diesem Block baut das verbundene WLAN-Modul ein Netzwerkverbindung zu einem Hotspot auf.
     * @param name Name des WLAN-Netzwerkes, eg: "Name des WLAN"
     * @param pass Passwort des WLAN-Netzwerkes, eg: "Passwort des WLAN"
     */
    //% blockId=custom_connectWifi block="mit WLAN verbinden:|Name %name|Passwort %pass"
    export function connectWifi(name: string, pass: string): void {
        let repeat = true

        while (repeat) {
            let data = modem.sendAT('+CWJAP?')
            if (data.length >= 2 && data[data.length - 2].compare('No AP') != 0 && data[data.length - 1].compare('OK') == 0) {
                repeat = false
            } else if (modem.expectOK('+CWMODE=1')) {
                modem.pushAT('+CWJAP="' + name + '","' + pass + '"')
                repeat = false
                basic.pause(10000)
            }
            basic.pause(500)
        }
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
        const url = 'momatita.kleeberg.berlin'
        const port = 80
        
        let data = '{ "key": "' + key + '", "temp": ' + temp + ', "light": ' + light + ', "wind": ' + wind + ', "rain": ' + rain + ' }'
        let msg = 'POST /upload HTTP/1.1\r\nHost: ' + url + '\r\nContent-Type: application/json \r\nContent-Length: ' + data.length + '\r\n\r\n' + data + '\r\n\r\n';

        if (modem.expectOK('+CIPMODE=0')) {
            modem.pushAT('+CIPMUX=1');
            if (modem.expectOK('+CIPSTART=4,"TCP","' + url + '",' + port)) {
                basic.pause(500)
                modem.pushAT('+CIPSEND=4,' + msg.length)
                basic.pause(500)
                serial.writeString(msg)
                basic.pause(500)
            }
        }
    }
}
