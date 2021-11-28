/**
 * Esta funcion genera un array con las casillas
 * @param tama tamaño del tablero
 * @param numeroMinas pide el numero de minas que se van a generar
 * @returns {Casilla[]} devuelve el tablero
 */
function generarCasillas(tama, numeroMinas) {
  document.documentElement.style.setProperty("--alturaTablero", tama.toString());
  document.documentElement.style.setProperty("--anchuraTablero", tama.toString());
  let casillas = Array();
  let numeroCasilla = 1;
  for (let y = 0; y < tama; y++) {
    for (let x = 0; x < tama; x++) {
      let casilla = new Casilla(numeroCasilla++, y, x)
      casillas.push(casilla)
    }
  }
  /*
   * randomiza las casillas, esto con el fin de colocar bombas a las n primeras casillas
   */
  for(let i = 0 ; i < 100; i++)
  casillas.sort(() => 0.5 - Math.random())
  for (let c = 0; c < numeroMinas; c++) {
    casillas[c].explosiva = true;
  }
  /*
     * Hace que las casillas vuelvan a su posicion original
     */
  casillas.sort(function (a, b) {
    return a.posicionH - b.posicionH
  })
  casillas.sort(function (a, b) {
    return a.posicionV - b.posicionV
  })
  return casillas;
}
function iniciarJuego(tama, numeroMinas){

  return new Tablero(tama, numeroMinas)
}
function nuevoTablero(tama, bombas){
  clearInterval(temporizador)
  document.getElementById('tiempo').innerText = '00:00:00'
  clearInterval(comprobacion_ganar)
  tablero = iniciarJuego(tama, bombas)
  tablero.generarTablero()
  temporizador = setTemporizador()
  comprobacion_ganar = generarComprobacionGanar()
}
function setTemporizador(){
  let horas = 0
  let minutos = 0
  let segundos = 0

  function calcularTiempoJuego() {
    if (segundos === 60) {
      segundos = 0
      minutos++

    }
    if (minutos === 60) {
      minutos = 0
      segundos = 0
      horas++;

    }
    /**
     * Metodo interno que dada un numero cuya longitud sea 1 ponga un 0 delante del numero
     * @param numero
     * @returns {string}
     */
    function numeroToString(numero) {
      if (numero.toString().length === 1) {
        return "0" + numero.toString()
      }
      return numero.toString();
    }

    return numeroToString(horas) + ':' + numeroToString(minutos)
      + ':' + numeroToString(segundos)
  }

  return setInterval(function () {
    segundos++
    document.getElementById('tiempo').innerText = calcularTiempoJuego(segundos);
  }, 1000)
}
function generarComprobacionGanar(){
  return setInterval(()=>{
    if(parseInt(tablero.numeroMinas.toString()) + parseInt(tablero.casillasDescubiertas.toString()) === tablero.tama**2){
      clearInterval(comprobacion_ganar)
      clearInterval(temporizador)
      tablero.desvelarMinas(true)
    }
  },10)
}
class Casilla {

  constructor(numeroCasilla, posicionV, posicionH, explosiva = false, marcada = false, descubierta = false) {

    this.numeroCasilla = numeroCasilla;
    this.posicionV = posicionV;
    this.posicionH = posicionH;

    this.explosiva = explosiva;
    this.marcada = marcada;
    this.descubierta = descubierta;
  }

  static get simboloMarcado() {
    return '🚩'
  }

  static get simboloMina() {
    return '💣'
  }

  marcar() {
    if(!this.descubierta) {
      this.marcada = !this.marcada;
      if (this.marcada) {
        document.getElementById(this.numeroCasilla).getElementsByClassName('fixed')[0].innerText = Casilla.simboloMarcado;
      } else {
        document.getElementById(this.numeroCasilla).getElementsByClassName('fixed')[0].innerText = ''
      }
    }
  }

  descubrir() {
    if (!this.descubierta) {
      this.descubierta = true;
      if (this.explosiva) {
        tablero.desvelarMinas()
      }else {
        tablero.casillasDescubiertas++
        let numeroMinas = 0
        /*
         * cuando se marque una casilla se comprobara las siguientes casillas si hay bomba cerca no se descubriran
         * NW N NE
         * W  X  E
         * SW S SE
         */
        let casillas = tablero.casillas
        let tamano = tablero.tama
        let casillaN, casillaNE, casillaE, casillaSE, casillaS, casillaSW, casillaW, casillaNW
        //Casillas norte
        if (this.posicionV !== 0) {
          casillaN = casillas.find(casilla => casilla.posicionV === this.posicionV - 1 && casilla.posicionH === this.posicionH)
          if (this.posicionH !== 0) {
            casillaNW = casillas.find(casilla => casilla.posicionV === this.posicionV - 1 && casilla.posicionH === this.posicionH - 1)
          }
          if (this.posicionH !== tamano - 1) {
            casillaNE = casillas.find(casilla => casilla.posicionV === this.posicionV - 1 && casilla.posicionH === this.posicionH + 1)
          }
        }
        //Casillas sur
        if (this.posicionV !== tamano - 1) {
          casillaS = casillas.find(casilla => casilla.posicionV === this.posicionV + 1 && casilla.posicionH === this.posicionH)
          if (this.posicionH !== 0) {
            casillaSW = casillas.find(casilla => casilla.posicionV === this.posicionV + 1 && casilla.posicionH === this.posicionH - 1)
          }
          if (this.posicionH !== tamano - 1) {
            casillaSE = casillas.find(casilla => casilla.posicionV === this.posicionV + 1 && casilla.posicionH === this.posicionH + 1)
          }
        }
        //Casilla este y oeste
        if (this.posicionH !== 0) {
          casillaW = casillas.find(casilla => casilla.posicionV === this.posicionV && casilla.posicionH === this.posicionH - 1)
        }
        if (this.posicionH !== tamano - 1) {
          casillaE = casillas.find(casilla => casilla.posicionV === this.posicionV && casilla.posicionH === this.posicionH + 1)
        }
        let casillasAlrededor = [];
        casillasAlrededor.push(this, casillaN, casillaNE, casillaE, casillaSE, casillaS, casillaSW, casillaW, casillaNW)
        for(let casilla of casillasAlrededor){
          if(casilla !== undefined){
            if (casilla.explosiva)
              numeroMinas++

          }
        }
        if(numeroMinas > 0) {
          document.getElementById(this.numeroCasilla).getElementsByClassName('fixed')[0].innerHTML = numeroMinas.toString()
          let color = '#0000fd'
          switch (numeroMinas){
            case 2:
              color = '#008000'
              break
            case 3:
              color = '#fe0000'
              break
            case 4:
              color = '#000080'
              break
            case 5:
              color = '#800000'
              break
            case 6:
              color = '#008080'
              break
            case 7:
              color = '#000000'
              break
            case 8:
              color = '#808080'
              break
          }
          document.getElementById(this.numeroCasilla).style.color = color;
        }else{
          document.getElementById(this.numeroCasilla).getElementsByClassName('fixed')[0].innerHTML = ''
        }

        document.getElementById(this.numeroCasilla).classList.add('descubierta')
        for(let casilla of casillasAlrededor){
          if(casilla !== undefined){
            if (casilla !== this.descubierta && casilla !== this.marcada&& !casilla.explosiva && numeroMinas === 0) {

              casilla.descubrir()
            }
          }
        }
      }
    }
  }

  toHTML() {
    return `<div class ='boton' id="${this.numeroCasilla}"><div class="fixed" ></div></div>`
  }
}
class Tablero {
  constructor(tama = 8, numeroMinas = 10) {
    this.casillas = generarCasillas(tama, numeroMinas)
    this.tama = tama
    this.numeroMinas = numeroMinas;
    this.casillasDescubiertas = 0;
  }

  generarTablero() {
    let casillasHTML = '';
    for (let casilla of this.casillas) {
      casillasHTML += casilla.toHTML()
    }
    document.getElementById('tablero').innerHTML = casillasHTML
    let botones = Array.from(document.getElementsByClassName("boton"));
    botones.map(button => {
      button.oncontextmenu = (e) => {
        e.preventDefault()
      }
      button.addEventListener('mouseup', (e) => {
        let casilla = this.casillas.find(casilla => casilla.numeroCasilla === parseInt(button.id))
        switch (e.button) {
          case 0:
            if(!casilla.marcada)
              casilla.descubrir()
            break;
          case 2:
            casilla.marcar()
            break;
        }
      })
    })
    this.setNumeroDeMinasHTML()
  }

  desvelarMinas(ganado = false) {
    let casillasHTML = document.getElementsByClassName('boton')
    alert(ganado ? 'Has ganado':'Has perdido')
    for (let casillaHTML of casillasHTML) {
      let casilla = this.casillas.find(casilla => casilla.numeroCasilla === parseInt(casillaHTML.id))
      if (casilla.explosiva) {

        casillaHTML.getElementsByClassName('fixed')[0].innerText = ganado ? Casilla.simboloMarcado : Casilla.simboloMina
      }
      casilla.descubierta = true;
      casillaHTML.classList.add('descubierta')
      clearInterval(comprobacion_ganar)
      clearInterval(temporizador)
    }



  }



  setNumeroDeMinasHTML() {

    document.getElementById('numeroMinas').innerText = Casilla.simboloMina + this.numeroMinas.toString();
  }

}





let tablero = iniciarJuego();
tablero.generarTablero()
let temporizador = setTemporizador()
let comprobacion_ganar = generarComprobacionGanar()

