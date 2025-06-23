const convertButton = document.querySelector('.convert-button');
const invertButton = document.querySelector('.invert-button');
const currencyFrom = document.querySelector('.currency-from');
const currencyTo = document.querySelector('.currency-to');
const currencyValueToConvert = document.querySelector('.currency-value-to-convert');
const currencyValueConverted = document.querySelector('.currency-value');

const fromCurrencyName = document.getElementById('from-currency-name');
const toCurrencyName = document.getElementById('to-currency-name');

const fromCurrencyImg = document.querySelector('.from-currency-img');
const toCurrencyImg = document.querySelector('.to-currency-img');

function atualizarRelogio() {
    const agora = new Date();

    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();

    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const segundos = agora.getSeconds().toString().padStart(2, '0');

    const dataHoraFormatada = `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;

    document.getElementById('relogio').textContent = dataHoraFormatada;
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();



const currencyDetails = {
  real: { name: "Real Brasileiro", img: "./assets/real.png", alt: "Bandeira do Brasil", code: "BRL", locale: "pt-BR", type: "fiat" },
  dolar: { name: "Dólar Americano", img: "./assets/dollar.png", alt: "Bandeira dos EUA", code: "USD", locale: "en-US", type: "fiat" },
  euro: { name: "Euro", img: "./assets/euro.png", alt: "Bandeira da União Europeia", code: "EUR", locale: "de-DE", type: "fiat" },
  libra: { name: "Libra Esterlina", img: "./assets/libra.png", alt: "Bandeira do Reino Unido", code: "GBP", locale: "en-GB", type: "fiat" },
  bitcoin: { name: "Bitcoin", img: "./assets/bitcoin.png", alt: "Símbolo do Bitcoin", code: "BTC", locale: "en-US", type: "crypto" }
};

let exchangeRates = null;
let bitcoinPriceBRL = null;

// 🔄 Função inverter moedas
invertButton.addEventListener('click', () => {
  const temp = currencyFrom.value;
  currencyFrom.value = currencyTo.value;
  currencyTo.value = temp;
  atualizarTextoEBandeira();
});

// 🏳️ Atualiza os nomes e imagens
function atualizarTextoEBandeira() {
  const from = currencyFrom.value;
  const to = currencyTo.value;

  fromCurrencyName.innerHTML = currencyDetails[from].name;
  toCurrencyName.innerHTML = currencyDetails[to].name;

  fromCurrencyImg.src = currencyDetails[from].img;
  fromCurrencyImg.alt = currencyDetails[from].alt;

  toCurrencyImg.src = currencyDetails[to].img;
  toCurrencyImg.alt = currencyDetails[to].alt;
}

// 📈 Buscar taxas fiat (real, dólar, euro, libra)
async function fetchFiatRates() {
  const apiKey = "a1c642bbad1c589bb45c8cf1"; // Use sua chave válida
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/BRL`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.result === "success") {
      exchangeRates = data.conversion_rates;
    } else {
      console.error("Erro API fiat:", data["error-type"]);
    }
  } catch (error) {
    console.error("Erro fetch fiat:", error);
  }
}

// ₿ Buscar preço do bitcoin em BRL
async function fetchBitcoinPrice() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl";

  try {
    const response = await fetch(url);
    const data = await response.json();
    bitcoinPriceBRL = data.bitcoin.brl;
  } catch (error) {
    console.error("Erro fetch BTC:", error);
  }
}

// 🔄 Atualiza as taxas de câmbio
async function updateRates() {
  await Promise.all([fetchFiatRates(), fetchBitcoinPrice()]);
}

// 💵 Formatar moeda
function formatCurrency(value, currencyKey) {
  const details = currencyDetails[currencyKey];
  if (details.type === "crypto") {
    return value.toFixed(8) + " " + details.code;
  } else {
    return new Intl.NumberFormat(details.locale, {
      style: "currency",
      currency: details.code
    }).format(value);
  }
}

// 🔢 Converter valores
async function convertValues() {
  const inputCurrencyValue = parseFloat(document.querySelector('.input-currency').value);

  if (isNaN(inputCurrencyValue) || inputCurrencyValue <= 0) {
    alert("Por favor, insira um valor válido maior que zero.");
    return;
  }

  const from = currencyFrom.value;
  const to = currencyTo.value;

  if (!exchangeRates || bitcoinPriceBRL === null) {
    alert("As taxas ainda não foram carregadas. Aguarde e tente novamente.");
    return;
  }

  let valueInBRL;

  // Converter moeda origem para BRL
  if (currencyDetails[from].type === "fiat") {
    valueInBRL = inputCurrencyValue / exchangeRates[currencyDetails[from].code];
  } else if (from === "bitcoin") {
    valueInBRL = inputCurrencyValue * bitcoinPriceBRL;
  }

  // Converter BRL para moeda destino
  let convertedValue;
  if (currencyDetails[to].type === "fiat") {
    convertedValue = valueInBRL * exchangeRates[currencyDetails[to].code];
  } else if (to === "bitcoin") {
    convertedValue = valueInBRL / bitcoinPriceBRL;
  }

  // Atualiza os resultados na tela
  currencyValueToConvert.innerHTML = formatCurrency(inputCurrencyValue, from);
  currencyValueConverted.innerHTML = formatCurrency(convertedValue, to);

  // Atualiza textos e imagens
  atualizarTextoEBandeira();
}

// ▶️ Executa na inicialização
updateRates();
setInterval(updateRates, 60000); // Atualiza taxas a cada 1 min

convertButton.addEventListener("click", convertValues);
currencyFrom.addEventListener("change", atualizarTextoEBandeira);
currencyTo.addEventListener("change", atualizarTextoEBandeira);
