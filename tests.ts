input.onButtonPressed(Button.A, () => {
    basic.showNumber(3)
    custom.sendData(
        "123456789",
        input.temperature(),
        input.lightLevel(),
        0,
        0
    )
    basic.showNumber(4)
})
basic.showNumber(0)
custom.initWifi()
basic.showNumber(1)
custom.connectWifi("WLAN-SSID", "WLAN-PASSWORT")
basic.showNumber(2)
