/* =====================================================================
   PROMOS DE INCA FITNESS CLUB
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que tenés que editar para cambiar la promo,
   los precios, las fechas, los links de pago, los alias y las sedes.

   Reglas para no romperlo:
   1. Cambiá solo lo que está entre comillas "así" y los números.
   2. No borres las comas del final de cada línea.
   3. Si un dato no lo tenés, dejá las comillas vacías: "".
   4. Los precios van sin puntos ni signo: 650000 (no "$650.000").
   5. Fechas con este formato: "2026-11-30T21:00:00-03:00"
      (año-mes-día, T, hora, y -03:00 que es la hora de Argentina).
   6. Guardá, subilo a GitHub y en 1 o 2 minutos se ve en la página.
   ===================================================================== */

window.INCA = {

  /* ---------------- AJUSTES GENERALES ---------------- */
  ajustes: {
    // Link de la planilla de Google (Apps Script). Ver LEEME, paso "Planilla".
    // Guarda qué sede y qué forma de pago eligió cada persona (sin datos personales).
    // Mientras esté vacío no se guarda nada, pero la compra funciona igual.
    urlPlanilla: "",

    // Email que recibe los pedidos de arrepentimiento.
    emailContacto: "holasomosinca@gmail.com"
  },

  /* ---------------- LA PROMO ---------------- */
  promo: {
    nombre: "Plan anual",

    // Fechas de VENTA (hora de Argentina).
    // Antes de "ventaDesde": la página muestra "Arranca en..." y el botón avisa por WhatsApp.
    // Después de "ventaHasta": muestra "La promo terminó".
    ventaDesde: "2026-11-23T00:00:00-03:00",
    ventaHasta: "2026-11-30T21:00:00-03:00",

    // Primera pantalla [REVISAR CON MARKETING]
    ceja: "Promo Cyber Week",
    numeroGigante: "365",
    titular: "días de entrenamiento y movimiento",
    selloArriba: "2 meses de regalo",
    selloAbajo: "Pagás 10, entrenás 12",
    botonPortada: "Quiero mi plan anual",

    // Pantalla del precio (después de elegir la sede)
    botonAdherir: "Adherirme al plan anual",
    incluye: [
      "Todas las actividades de tu sede",
      "El horario que quieras, sin límite de clases",
      "Un solo pago: 12 meses sin cuotas ni aumentos"
    ],

    // Formas de pago. true = se ofrece, false = no se muestra.
    pagoTransferencia: true,     // al alias de cada sede (se carga más abajo)
    pagoTarjeta: true,           // con el link o botón de la procesadora (se carga más abajo)

    // Opción de 6 cuotas: APAGADA. Si vuelve, poné activa: true, completá el texto
    // y pegá el link de pago en cada sede, en "linkCuotas".
    cuotas: {
      activa: false,
      nombre: "Tarjeta de crédito · 6 cuotas sin interés",
      detalle: ""                // ej: "6 cuotas de $..."
    },

    // Condiciones que se ven en la sección de sedes
    condiciones: [
      "El plan es para entrenar en una sola sede: la elegís al comprar y no se puede cambiar de sede.",
      "Incluye todas las actividades de tu sede, en el horario que quieras y sin límite de clases.",
      "Se paga en un solo pago, por transferencia o con tarjeta de crédito.",
      "El ahorro se calcula contra 12 meses de cuota mensual al valor de hoy.",
      "Promo válida para compras hasta el lunes 30/11/2026 a las 21 h (hora de Argentina)."
    ]
  },

  /* ---------------- SEDES ----------------
     precioMensual: la cuota mensual normal de la sede (para calcular el ahorro).
     precioAnual:   el precio del plan anual en un solo pago.
     whatsapp:      solo números, con 549 adelante (sin +, sin espacios).
     alias, cbu, titular: para quien paga por transferencia. [COMPLETAR]
     linkTarjeta:   link de pago con tarjeta que te da la procesadora. [COMPLETAR]
     botonTarjeta:  o el código del botón, si la procesadora te da un botón en vez de un link.
                    Si los dos están vacíos, la persona pide el link por WhatsApp a la sede.
     linkCuotas:    solo si se activa la opción de 6 cuotas. */
  sedes: [
    {
      id: "ciudad",
      nombre: "Ciudad",
      direccion: "9 de Julio 2416, Ciudad de Mendoza",
      whatsapp: "5492615594981",
      precioMensual: 65000,
      precioAnual: 650000,
      alias: "", cbu: "", titular: "",
      linkTarjeta: "", botonTarjeta: "", linkCuotas: ""
    },
    {
      id: "godoy-cruz",
      nombre: "Godoy Cruz",
      direccion: "Rivadavia 924, Godoy Cruz, Mendoza",
      whatsapp: "5492617718102",
      precioMensual: 60000,
      precioAnual: 600000,
      alias: "", cbu: "", titular: "",
      linkTarjeta: "", botonTarjeta: "", linkCuotas: ""
    },
    {
      id: "guaymallen",
      nombre: "Guaymallén",
      direccion: "Acceso Este lateral norte km 1034, entre Chacón Norte y Bonfanti, Rodeo de la Cruz, Guaymallén",
      whatsapp: "5492617474236",
      precioMensual: 65000,
      precioAnual: 650000,
      alias: "", cbu: "", titular: "",
      linkTarjeta: "", botonTarjeta: "", linkCuotas: ""
    },
    {
      id: "carrodilla",
      nombre: "Carrodilla",
      direccion: "Manuel Antonio Sáez 8115, Luján de Cuyo, Mendoza",
      whatsapp: "5492612533809",
      precioMensual: 60000,
      precioAnual: 600000,
      alias: "", cbu: "", titular: "",
      linkTarjeta: "", botonTarjeta: "", linkCuotas: ""
    },
    {
      id: "tupungato",
      nombre: "Tupungato",
      direccion: "Av. Urquiza 795, Tupungato, Mendoza",
      whatsapp: "5492622444784",
      precioMensual: 65000,
      precioAnual: 650000,
      alias: "", cbu: "", titular: "",
      linkTarjeta: "", botonTarjeta: "", linkCuotas: ""
    }
  ]
};
