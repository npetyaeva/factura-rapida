const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']

const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

const centenas = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function grupo(n) {
  const c = Math.floor(n / 100)
  const d = Math.floor((n % 100) / 10)
  const u = n % 10

  let resultado = ''

  if (c > 0) {
    if (c === 1 && (d > 0 || u > 0)) resultado = 'ciento'
    else resultado = centenas[c]
  }

  if (n % 100 < 20) {
    resultado += (resultado ? ' ' : '') + unidades[n % 100]
  } else {
    resultado += (resultado ? ' ' : '') + decenas[d]
    if (u > 0) resultado += ' y ' + unidades[u]
  }

  return resultado.trim()
}

export function numeroALetras(n) {
  if (n === 0) return 'cero guaraníes'

  let resultado = ''

  const millones = Math.floor(n / 1000000)
  const miles = Math.floor((n % 1000000) / 1000)
  const resto = n % 1000

  if (millones > 0) {
    resultado += millones === 1 ? 'un millón' : grupo(millones) + ' millones'
  }

  if (miles > 0) {
    resultado += (resultado ? ' ' : '')
    resultado += miles === 1 ? 'mil' : grupo(miles) + ' mil'
  }

  if (resto > 0) {
    resultado += (resultado ? ' ' : '') + grupo(resto)
  }

  return resultado + ' guaraníes'
}