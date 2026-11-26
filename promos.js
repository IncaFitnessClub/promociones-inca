/* =====================================================================
   PROMOS DE INCA FITNESS CLUB
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que tenés que editar para cambiar la promo,
   los precios, las fechas, los links de pago y las sedes.

   Reglas para no romperlo:
   1. Cambiá solo lo que está entre comillas "así" y los números.
   2. No borres las comas del final de cada línea.
   3. Si un dato no lo tenés, dejá las comillas vacías: "".
   4. Los precios van sin puntos ni signo: 780000 (no "$780.000").
   5. Fechas con este formato: "2026-12-04T23:59:59-03:00"
      (año-mes-día, T, hora, y -03:00 que es la hora de Argentina).
   6. Guardá, subilo a GitHub y en 1 o 2 minutos se ve en la página.
   ===================================================================== */

window.INCA = {

  /* ---------------- AJUSTES GENERALES ---------------- */
  ajustes: {
    // Link de la planilla de Google (Apps Script). Ver LEEME, paso "Planilla".
    // Guarda qué sede eligió cada persona al ir a pagar (sin datos personales).
    // Mientras esté vacío no se guarda nada, pero la compra funciona igual.
    urlPlanilla: "",

    // Email que recibe los pedidos de arrepentimiento.
    emailContacto: "holasomosinca@gmail.com",

    // Número (ID) del píxel de Meta, solo los números. Vacío = el píxel no se carga.
    // Este número NO es secreto: está bien que esté acá. Nunca pegues un "token de acceso".
    pixelMeta: "1461651279509172"           // conjunto de datos "Inca Fitness Club - Web"
  },

  /* ---------------- LA PROMO ---------------- */
  promo: {
    nombre: "Plan anual",

    // Fechas de VENTA (hora de Argentina).
    // "ventaDesde" vacío = la promo ya está activa. Si ponés una fecha futura, antes de esa
    // fecha la página muestra "Arranca el..." y el botón avisa por WhatsApp.
    // Después de "ventaHasta": muestra "La promo terminó".
    ventaDesde: "",
    ventaHasta: "2026-12-04T23:59:59-03:00",

    // Primera pantalla [REVISAR CON MARKETING]
    cinta: "Black Week",                       // el texto que se repite en la cinta
    titular: ["Un año en", "movimiento"],      // la última línea va en naranja
    ofertaArriba: "Hasta 6 cuotas",
    ofertaGrande: "sin interés",
    ofertaAbajo: "+ Matrícula bonificada",
    botonPortada: "Quiero mi plan anual",

    // Precio (el mismo en todas las sedes) y cuotas
    precio: 780000,
    mostrarPorMes: true,                       // true = muestra "Equivale a $65.000 por mes" (precio ÷ 12)
    textoPorMes: "Precio congelado todo el año",
    cuotas: [1, 3, 6],                         // cuotas sin interés con tarjeta de crédito
    debitoCBU: true,                           // true = también se puede pagar con débito directo por CBU

    // Pantalla de la sede (después de elegirla)
    botonPago: "Quiero mi plan anual",
    incluye: [
      "Matrícula bonificada",
      "Todas las actividades de tu sede, en el horario que quieras",
      "Precio cerrado por 12 meses"
    ],

    // Condiciones que se ven en la sección de sedes
    condiciones: [
      "Plan anual, 12 meses para entrenar en la sede donde lo adquirís.",
      "Precio final: $780.000 en todas las sedes, con matrícula bonificada.",
      "Con tarjeta de crédito, en 1, 3 o 6 cuotas sin interés, según las tarjetas habilitadas en el portal de pago. También por débito directo (CBU).",
      "Promo válida para compras realizadas hasta el viernes 4/12/2026 a las 23:59 (hora de Argentina)."
    ]
  },

  /* ---------------- SEDES ----------------
     whatsapp:    solo números, con 549 adelante (sin +, sin espacios).
     actividades: las que tiene cada sede, separadas por comas.
     linkPago:    el link del portal de pago (PagoTIC) de cada sede. El número
                  del final del comentario es el código del formulario. */
  sedes: [
    {
      id: "carrodilla",
      nombre: "Carrodilla",
      direccion: "Manuel Antonio Sáez 8115, Luján de Cuyo, Mendoza",
      whatsapp: "5492612533809",
      actividades: ["CrossFit", "Funcional", "GAP"],
      linkPago: "https://incafitnessclubazcurra.paypertic.com.ar"        // formulario 6619
    },
    {
      id: "ciudad",
      nombre: "Ciudad",
      direccion: "9 de Julio 2416, Ciudad de Mendoza",
      whatsapp: "5492615594981",
      actividades: ["Musculación", "CrossFit", "Funcional", "GAP"],
      linkPago: "https://incafitnessclubimpl.paypertic.com.ar"           // formulario 6598
    },
    {
      id: "godoy-cruz",
      nombre: "Godoy Cruz",
      direccion: "Rivadavia 924, Godoy Cruz, Mendoza",
      whatsapp: "5492617718102",
      actividades: ["CrossFit", "Funcional", "GAP"],
      linkPago: "https://incafitnessclubtriada.paypertic.com.ar"         // formulario 6602
    },
    {
      id: "guaymallen",
      nombre: "Guaymallén",
      direccion: "Acceso Este lateral norte km 1034, entre Chacón Norte y Bonfanti, Rodeo de la Cruz, Guaymallén",
      whatsapp: "5492617474236",
      actividades: ["Musculación", "CrossFit", "Funcional", "GAP"],
      linkPago: "https://incafitnessclubdreamfit.paypertic.com.ar"       // formulario 6627
    },
    {
      id: "tupungato",
      nombre: "Tupungato",
      direccion: "Av. Urquiza 795, Tupungato, Mendoza",
      whatsapp: "5492622444784",
      actividades: ["Musculación", "CrossFit", "Funcional", "GAP"],
      linkPago: "https://incafitnessclub.paypertic.com.ar"               // formulario 6609
    }
  ]
};
