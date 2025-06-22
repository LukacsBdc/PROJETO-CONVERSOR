const convertButton = document.querySelector(".convert-button")
const currencyFrom = document.querySelector(".currency-from")
const currencyTo = document.querySelector(".currency-to")
const currencyValueToConvert = document.querySelector(".currency-value-to-convert")
const currencyValueConverted = document.querySelector(".currency-value")

const currencyDetails = {
    real: { name: "Real Brasileiro", img: "./assets/real.png", alt: "Bandeira do Brasil", code: "BRL", locale: "pt-BR", type: "fiat" },
    dolar: { name: "Dólar Americano", img: "./assets/dollar.png", alt: "Bandeira dos EUA", code: "USD", locale: "en-US", type: "fiat" },
    euro: { name: "Euro", img: "./assets/euro.png", alt: "Bandeira da União Europeia", code: "EUR", locale: "de-DE", type: "fiat" },
    libra: { name: "Libra Esterlina", img: "./assets/libra.png", alt: "Bandeira do Reino Unido", code: "GBP", locale: "en-GB", type: "fiat" },
    bitcoin: { name: "Bitcoin", img: "./assets/bitcoin.png", alt: "Símbolo do Bitcoin", code: "BTC", locale: "en-US", type: "crypto" }
}

let exchangeRates = null // taxas para moedas fiat, base BRL
let bitcoinPriceBRL = null // preço BTC em BRL

async function fetchFiatRates() {
    const apiKey = "a1c642bbad1c589bb45c8cf1" // <=== coloque sua chave aqui
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/BRL`

    try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.result === "success") {
            exchangeRates = data.conversion_rates
            console.log("Taxas fiat atualizadas:", exchangeRates)
        } else {
            console.error("Erro API fiat:", data["error-type"])
        }
    } catch (error) {
        console.error("Erro fetch fiat:", error)
    }
}

async function fetchBitcoinPrice() {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl"

    try {
        const response = await fetch(url)
        const data = await response.json()
        bitcoinPriceBRL = data.bitcoin.brl
        console.log("Preço BTC atualizado:", bitcoinPriceBRL)
    } catch (error) {
        console.error("Erro fetch BTC:", error)
    }
}

async function updateRates() {
    await Promise.all([fetchFiatRates(), fetchBitcoinPrice()])
}

function formatCurrency(value, currencyKey) {
    const details = currencyDetails[currencyKey]
    // Se crypto e for bitcoin, formata com 8 casas decimais, por exemplo
    if (details.type === "crypto") {
        return value.toFixed(8) + " " + details.code
    } else {
        return new Intl.NumberFormat(details.locale, {
            style: "currency",
            currency: details.code
        }).format(value)
    }
}

async function convertValues() {
    const inputCurrencyValue = parseFloat(document.querySelector(".input-currency").value)
    if (isNaN(inputCurrencyValue) || inputCurrencyValue <= 0) {
        alert("Por favor, insira um valor válido maior que zero.")
        return
    }

    const from = currencyFrom.value
    const to = currencyTo.value

    if (!exchangeRates || bitcoinPriceBRL === null) {
        alert("As taxas ainda não foram carregadas, por favor aguarde e tente novamente.")
        return
    }

    // Converter tudo para BRL primeiro
    let valueInBRL

    if (currencyDetails[from].type === "fiat") {
        valueInBRL = inputCurrencyValue / exchangeRates[currencyDetails[from].code]
    } else if (from === "bitcoin") {
        // converter bitcoin para BRL
        valueInBRL = inputCurrencyValue * bitcoinPriceBRL
    }

    // Converter de BRL para moeda destino
    let convertedValue
    if (currencyDetails[to].type === "fiat") {
        convertedValue = valueInBRL * exchangeRates[currencyDetails[to].code]
    } else if (to === "bitcoin") {
        convertedValue = valueInBRL / bitcoinPriceBRL
    }

    // Atualiza valores formatados na tela
    currencyValueToConvert.innerHTML = formatCurrency(inputCurrencyValue, from)
    currencyValueConverted.innerHTML = formatCurrency(convertedValue, to)

    // Atualiza nomes e imagens
    document.getElementById("from-currency-name").innerText = currencyDetails[from].name
    document.querySelector(".from-currency-img").src = currencyDetails[from].img
    document.querySelector(".from-currency-img").alt = currencyDetails[from].alt

    document.getElementById("to-currency-name").innerText = currencyDetails[to].name
    document.querySelector(".to-currency-img").src = currencyDetails[to].img
    document.querySelector(".to-currency-img").alt = currencyDetails[to].alt
}

// Atualiza taxas na inicialização e a cada 1 minutos
updateRates()
setInterval(updateRates, 60000) // 60000) ms = 1 min

convertButton.addEventListener("click", convertValues)
