/* =====================================================================
   INCA FITNESS CLUB · Landing de promociones · main.js
   Sin librerías. Cada parte corre dentro de safe(): si una falla, las demás
   siguen funcionando. Los datos salen de promos.js (window.INCA).
   No hace falta tocar este archivo para cambiar promos: se edita promos.js.
   ===================================================================== */
(() => {
  'use strict';

  const d = document;
  const html = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;   // pidió menos movimiento
  const IO = 'IntersectionObserver' in window;
  const safe = (fn, nombre) => { try { fn(); } catch (e) { console.warn('[inca] falló ' + (nombre || ''), e); } };

  const D = window.INCA;
  if (!D || !D.promo || !Array.isArray(D.sedes)) {
    console.warn('[inca] No se pudo leer promos.js: revisá comas y comillas.');
    return;                                   // la página queda con su contenido fijo, sin animaciones
  }
  const P = D.promo;
  const A = D.ajustes || {};

  /* ---------- Ayudantes ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wa = (num, msg) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  const mapa = (dir) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir + ', Argentina')}`;
  const sedePorId = (id) => D.sedes.find((s) => s.id === id);
  const set = (sel, txt) => { const el = $(sel); if (el && txt) el.textContent = txt; };
  const pad = (n) => String(n).padStart(2, '0');
  // 650000 → "$650.000" (igual en cualquier celular)
  const pesos = (n) => '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const ahorroDe = (s) => (Number(s.precioMensual) || 0) * 12 - (Number(s.precioAnual) || 0);
  const FLECHA = '<svg class="btn__flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
  const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z"/></svg>';
  const ICONO_MAPA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  /* ---------- Estado de la promo: antes / activa / terminada ---------- */
  const desde = Date.parse(P.ventaDesde);
  const hasta = Date.parse(P.ventaHasta);
  const vista = new URLSearchParams(location.search).get('vista');      // ?vista=activa para probar
  const calcularEstado = () => {
    if (['antes', 'activa', 'terminada'].includes(vista)) return vista;
    const t = Date.now();
    if (!isNaN(desde) && t < desde) return 'antes';
    if (!isNaN(hasta) && t > hasta) return 'terminada';
    return 'activa';
  };
  let E = calcularEstado();
  html.dataset.promo = E;                       // "antes", "activa" o "terminada" (por si se quiere usar en CSS)

  // Fechas siempre en hora de Argentina (UTC-3) y con el mismo formato en cualquier celular
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const arg = (ts) => new Date(ts - 3 * 3600000);
  const fechaCorta = (ts) => { if (isNaN(ts)) return ''; const f = arg(ts); return `${DIAS[f.getUTCDay()]} ${f.getUTCDate()}/${f.getUTCMonth() + 1}`; };
  const hora = (ts) => { const f = arg(ts); return `${f.getUTCHours()}:${pad(f.getUTCMinutes())}`; };   // "21:00"
  const fechaHora = (ts) => { if (isNaN(ts)) return ''; const f = arg(ts); return f.getUTCHours() || f.getUTCMinutes() ? `${fechaCorta(ts)} · ${hora(ts)}` : fechaCorta(ts); };
  const falta = (ms) => {
    const m = Math.max(0, Math.floor(ms / 60000));
    const dd = Math.floor(m / 1440), hh = Math.floor((m % 1440) / 60), mm = m % 60;
    if (dd > 0) return `${dd} d ${hh} h`;
    if (hh > 0) return `${hh} h ${mm} min`;
    return `${mm} min`;
  };
  const textoEstado = () => {
    const t = Date.now();
    if (E === 'antes') return `Arranca el ${fechaCorta(desde)} · faltan ${falta(desde - t)}`;
    if (E === 'activa') return isNaN(hasta) ? '' : `La promo termina en ${falta(hasta - t)}`;
    return 'La promo terminó. Escribinos para conocer los planes vigentes.';
  };
  const mensajeDudas = (s) => (E === 'terminada'
    ? `¡Hola Inca ${s.nombre}! Vi que terminó la promo del plan anual. ¿Qué planes tienen ahora?`
    : `¡Hola Inca ${s.nombre}! Vi la promo del plan anual y tengo una consulta: `);
  const textoMedios = () => {
    const m = [];
    if (P.pagoTransferencia !== false) m.push('por transferencia');
    if (P.pagoTarjeta !== false || (P.cuotas && P.cuotas.activa)) m.push('con tarjeta de crédito');
    return m.join(' o ');
  };

  /* ---------- Diálogos ---------- */
  let dialogosAbiertos = 0;
  const alCambiarDialogo = [];
  // Cuenta los diálogos abiertos mirando la página (no depende de que llegue el evento "close")
  const sincronizarDialogos = () => {
    dialogosAbiertos = $$('dialog.hoja[open]').length;
    html.style.overflow = dialogosAbiertos ? 'hidden' : '';
    alCambiarDialogo.forEach((f) => f());
  };
  function abrirDialogo(dlg) {
    if (!dlg || dlg.open) return;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    sincronizarDialogos();
  }
  function cerrarDialogo(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    sincronizarDialogos();
  }
  function prepararDialogos() {
    $$('dialog.hoja').forEach((dlg) => {
      dlg.addEventListener('close', sincronizarDialogos);
      dlg.addEventListener('cancel', () => setTimeout(sincronizarDialogos, 0));        // tecla Esc
      dlg.addEventListener('click', (e) => { if (e.target === dlg) cerrarDialogo(dlg); });   // tocar afuera cierra
      $$('[data-cerrar]', dlg).forEach((b) => b.addEventListener('click', () => cerrarDialogo(dlg)));
    });
    d.addEventListener('click', (e) => {
      const b = e.target.closest('[data-abrir-dudas]');
      if (!b) return;
      e.preventDefault();
      abrirDialogo($('#hoja-dudas'));
    });
  }

  /* =====================================================================
     1. PRIMERA PANTALLA Y TEXTOS
     ===================================================================== */
  function portada() {
    set('[data-ceja]', E === 'terminada' ? 'Promo finalizada' : P.ceja);
    set('[data-gigante]', P.numeroGigante);
    set('[data-titular]', P.titular);
    set('[data-sello-a]', P.selloArriba);
    const b = $('[data-sello-b]');
    if (b) { if (P.selloAbajo) b.textContent = P.selloAbajo; else b.remove(); }
    $$('[data-cta-texto]').forEach((el) => { el.textContent = E === 'terminada' ? 'Consultar planes vigentes' : (P.botonPortada || el.textContent); });
    set('[data-sello-cierre]', E === 'terminada' ? 'Promo finalizada' : `Hasta el ${fechaHora(hasta)}`);
    const min = Math.min(...D.sedes.map((s) => Number(s.precioAnual) || Infinity));
    if (isFinite(min)) set('[data-barra-precio]', `Un solo pago · desde ${pesos(min)}`);
  }

  // Contador de la primera pantalla + textos de estado. Se actualiza cada segundo.
  function contador() {
    const label = $('[data-contador-label]');
    const cajas = $('[data-contador-cajas]');
    const c = {};
    $$('[data-c]').forEach((el) => { c[el.dataset.c] = el; });
    const objetivo = () => (E === 'antes' ? desde : E === 'activa' ? hasta : NaN);
    const pintar = () => {
      if (calcularEstado() !== E && !dialogosAbiertos) { location.reload(); return; }   // cambió el estado: recarga
      if (label) {
        const txt = E === 'antes' ? `Arranca el ${fechaHora(desde)}` : E === 'activa' ? `Termina el ${fechaHora(hasta)}` : 'La promo terminó';
        if (label.textContent !== txt) label.textContent = txt;
      }
      const t = objetivo();
      if (cajas && c.d) {
        if (isNaN(t)) cajas.hidden = true;
        else {
          cajas.hidden = false;
          const s = Math.floor(Math.max(0, t - Date.now()) / 1000);
          c.d.textContent = String(Math.floor(s / 86400));
          c.h.textContent = pad(Math.floor((s % 86400) / 3600));
          c.m.textContent = pad(Math.floor((s % 3600) / 60));
          c.s.textContent = pad(s % 60);
        }
      }
      const est = textoEstado();
      $$('[data-estado]').forEach((el) => { if (el.textContent !== est) el.textContent = est; });
    };
    pintar();
    if (E !== 'terminada') setInterval(pintar, 1000);
  }

  /* =====================================================================
     2. SEDES CON SU PRECIO, CONDICIONES Y WHATSAPP DE DUDAS
     ===================================================================== */
  function sedes() {
    const ul = $('[data-sedes]');
    if (ul) {
      ul.innerHTML = D.sedes.map((s) => {
        const ahorro = ahorroDe(s);
        const accion = E === 'terminada'
          ? `<a class="btn btn--compacto" href="${wa(s.whatsapp, mensajeDudas(s))}" target="_blank" rel="noopener"><span class="btn__txt">Consultar planes</span>${FLECHA}</a>`
          : `<button type="button" class="btn btn--compacto" data-elegir-sede="${esc(s.id)}"><span class="btn__txt">Quiero mi plan acá</span>${FLECHA}</button>`;
        return `
        <li class="sede" data-reveal>
          <div>
            <h3 class="sede__nombre">${esc(s.nombre)}</h3>
            <p class="sede__dir">${esc(s.direccion)}</p>
          </div>
          ${E === 'terminada' ? '' : `<p class="sede__precio"><span class="sede__monto">${pesos(s.precioAnual)}</span>${ahorro > 0 ? `<span class="sede__ahorro">Ahorrás ${pesos(ahorro)}</span>` : ''}</p>`}
          <div class="sede__acciones">
            ${accion}
            <a class="boton-linea" href="${mapa(s.direccion)}" target="_blank" rel="noopener">${ICONO_MAPA}Cómo llegar</a>
            <a class="boton-linea" href="${wa(s.whatsapp, `¡Hola Inca ${s.nombre}! Quiero info del plan anual.`)}" target="_blank" rel="noopener">${ICONO_WA}WhatsApp</a>
          </div>
        </li>`;
      }).join('');
    }
    const cond = $('[data-condiciones]');
    if (cond && Array.isArray(P.condiciones) && P.condiciones.length) {
      cond.innerHTML = P.condiciones.map((x) => `<li>${esc(x)}</li>`).join('');
    }
    const lw = $('[data-lista-wa]');
    if (lw) {
      lw.innerHTML = D.sedes.map((s) => `
        <li><a href="${wa(s.whatsapp, mensajeDudas(s))}" target="_blank" rel="noopener">
          <span><strong>${esc(s.nombre)}</strong><br><span>${esc(s.direccion)}</span></span>${ICONO_WA}
        </a></li>`).join('');
    }
  }

  /* =====================================================================
     3. COMPRA: elegir sede → ver precio → elegir forma de pago → pagar
     ===================================================================== */
  function utm() {
    const q = new URLSearchParams(location.search);
    const claves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    const out = {};
    let guardado = {};
    try { guardado = JSON.parse(sessionStorage.getItem('inca_utm') || '{}'); } catch (e) { /* sin almacenamiento */ }
    claves.forEach((k) => { out[k] = q.get(k) || guardado[k] || ''; });
    try { if (claves.some((k) => q.get(k))) sessionStorage.setItem('inca_utm', JSON.stringify(out)); } catch (e) { /* nada */ }
    return out;
  }
  const UTM = utm();

  // Anota en la planilla qué sede y qué forma de pago eligió (sin datos personales). Nunca frena la compra.
  function enviarPlanilla(datos) {
    const url = (A.urlPlanilla || '').trim();
    if (!url) return;
    const body = new URLSearchParams(Object.assign({ promo: P.nombre, pagina: location.origin + location.pathname, fecha: new Date().toISOString() }, datos, UTM));
    try { if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return; } catch (e) { /* sigue con fetch */ }
    fetch(url, { method: 'POST', mode: 'no-cors', body, keepalive: true }).catch(() => {});
  }

  function inyectarHTML(cont, codigo) {           // para el botón que da la procesadora
    cont.innerHTML = codigo;
    $$('script', cont).forEach((viejo) => {
      const s = d.createElement('script');
      [...viejo.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      s.text = viejo.textContent;
      viejo.replaceWith(s);
    });
  }

  function mediosDe(s) {
    const m = [];
    if (P.pagoTransferencia !== false) m.push({ tipo: 'transferencia', nombre: 'Transferencia', detalle: `Al alias de Inca ${s.nombre}` });
    if (P.pagoTarjeta !== false) m.push({ tipo: 'tarjeta', nombre: 'Tarjeta de crédito', detalle: '1 solo pago', linkPago: (s.linkTarjeta || '').trim(), botonPago: s.botonTarjeta || '' });
    if (P.cuotas && P.cuotas.activa) m.push({ tipo: 'tarjeta', nombre: P.cuotas.nombre || 'Tarjeta en cuotas', detalle: P.cuotas.detalle || '', linkPago: (s.linkCuotas || '').trim(), botonPago: '' });
    if (!m.length) m.push({ tipo: 'whatsapp', nombre: 'Por WhatsApp', detalle: 'Tu sede te pasa cómo pagar' });
    return m;
  }

  function compra() {
    const dlg = $('#hoja-compra');
    if (!dlg) return;
    const vistas = {};
    $$('[data-vista]', dlg).forEach((v) => { vistas[v.dataset.vista] = v; });
    const paso = $('[data-hoja-paso]', dlg);
    const atras = $('[data-atras]', dlg);
    const PASOS = { sedes: 'Paso 1 de 3', precio: 'Paso 2 de 3', pago: 'Paso 3 de 3', final: 'Paso 3 de 3' };
    let sede = null;
    let medios = [];
    let actual = null;
    let historial = [];

    // Lista de sedes: nombre grande y dirección completa más chica
    $('[data-sede-lista]', dlg).innerHTML = D.sedes.map((s) => `
      <li><button type="button" class="eleccion" data-sede="${esc(s.id)}">
        <span class="eleccion__nombre">${esc(s.nombre)}</span>
        <span class="eleccion__detalle">${esc(s.direccion)}</span>${CHEVRON}
      </button></li>`).join('');

    const enfocarTitulo = () => {
      const t = $('.vista__titulo', vistas[actual]);
      if (t && dlg.open) t.focus({ preventScroll: true });
    };
    const mostrar = (nombre, volviendo) => {
      if (!volviendo && actual && actual !== nombre) historial.push(actual);
      actual = nombre;
      Object.keys(vistas).forEach((k) => { vistas[k].hidden = k !== nombre; });
      atras.hidden = historial.length === 0;
      paso.textContent = PASOS[nombre] || '';
      const t = $('.vista__titulo', vistas[nombre]);
      if (t) dlg.setAttribute('aria-labelledby', t.id);
      dlg.scrollTop = 0;
      enfocarTitulo();
    };
    const abrirEn = (nombre, idSede) => {
      historial = [];
      actual = null;
      if (idSede) { sede = sedePorId(idSede); pintarPrecio(); }
      mostrar(nombre);
      abrirDialogo(dlg);
      enfocarTitulo();
    };

    function pintarPrecio() {
      const s = sede;
      const ahorro = ahorroDe(s);
      const mensual = Number(s.precioMensual) || 0;
      const cuotasPagas = mensual ? Number(s.precioAnual) / mensual : NaN;
      const boton = E === 'antes'
        ? `<a class="btn btn--ancho" href="${wa(s.whatsapp, `¡Hola Inca ${s.nombre}! Quiero el plan anual de la ${P.ceja || 'promo'} (${pesos(s.precioAnual)}). ¿Me avisan el ${fechaCorta(desde)} cuando arranque?`)}" target="_blank" rel="noopener" data-aviso>
             <span class="btn__txt">Avisame cuando arranque</span>${FLECHA}</a>`
        : `<button type="button" class="btn btn--ancho" data-adherir><span class="btn__txt">${esc(P.botonAdherir || 'Adherirme al plan anual')}</span>${FLECHA}</button>`;
      vistas.precio.innerHTML = `
        <h2 class="vista__titulo" id="v-precio-titulo" tabindex="-1">Tu plan anual en <span>${esc(s.nombre)}</span></h2>
        <div class="vista__fila"><p>12 meses · 1 sola sede</p><button type="button" class="enlace" data-cambiar-sede>Cambiar sede</button></div>
        <div class="precio-final">
          ${ahorro > 0 ? `<p class="precio-final__antes">12 meses de cuota: <s>${pesos(mensual * 12)}</s></p>` : ''}
          <p class="precio-final__monto">${pesos(s.precioAnual)}</p>
          <p class="precio-final__detalle">1 solo pago · ${esc(textoMedios())}</p>
        </div>
        ${ahorro > 0 ? `<p class="sello sello--chico" aria-hidden="true"><span class="sello__a">Ahorrás ${pesos(ahorro)}</span>${Number.isInteger(cuotasPagas) && cuotasPagas < 12 ? `<span class="sello__b">Pagás ${cuotasPagas} cuotas, entrenás 12</span>` : ''}</p>
        <p class="sr-only">Ahorrás ${pesos(ahorro)} frente a pagar 12 cuotas de ${pesos(mensual)}.</p>` : ''}
        <ul class="incluye">${(P.incluye || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
        <div class="vista__accion">
          <p class="estado" data-estado>${esc(textoEstado())}</p>
          ${boton}
          <p class="form__legal">Al adherirte aceptás los <a href="terminos.html" target="_blank" rel="noopener">términos y condiciones</a>.</p>
        </div>`;
    }

    function pintarPago() {
      vistas.pago.innerHTML = `
        <h2 class="vista__titulo" id="v-pago-titulo" tabindex="-1">¿Cómo querés pagar?</h2>
        <p class="form__resumen">Plan anual en ${esc(sede.nombre)} · ${pesos(sede.precioAnual)}</p>
        <ul class="eleccion-lista">${medios.map((m, i) => `
          <li><button type="button" class="eleccion" data-medio="${i}">
            <span class="eleccion__nombre">${esc(m.nombre)}</span>
            ${m.detalle ? `<span class="eleccion__detalle">${esc(m.detalle)}</span>` : ''}${CHEVRON}
          </button></li>`).join('')}</ul>`;
    }

    function pintarFinal(m) {
      const s = sede;
      const monto = pesos(s.precioAnual);
      const plan = `plan anual de la ${P.ceja || 'promo'} (${monto})`;
      let h = '';
      if (m.tipo === 'transferencia') {
        const tieneDatos = s.alias || s.cbu;
        const dato = (label, valor) => (valor ? `<div class="dato"><span class="dato__label">${label}</span><span class="dato__valor">${esc(valor)}</span><button type="button" class="copiar" data-copiar="${esc(valor)}">Copiar</button></div>` : '');
        h = `<h2 class="vista__titulo" id="v-final-titulo" tabindex="-1">Transferí ${monto}</h2>
             <p>A la cuenta de Inca ${esc(s.nombre)}:</p>
             ${tieneDatos
               ? `<div class="datos-banco">${dato('Alias', s.alias)}${dato('CBU', s.cbu)}${s.titular ? `<div class="dato"><span class="dato__label">Titular</span><span class="dato__valor">${esc(s.titular)}</span></div>` : ''}</div>`
               : `<p class="form__resumen">Pedile el alias a tu sede por WhatsApp: te lo pasan al toque.</p>`}
             <p>Después mandá el comprobante por WhatsApp. Tu plan queda confirmado cuando la sede lo recibe.</p>
             <a class="btn btn--ancho" href="${wa(s.whatsapp, tieneDatos
               ? `¡Hola Inca ${s.nombre}! Me adherí al ${plan}. Ya hice la transferencia y les mando el comprobante. Mi nombre es: `
               : `¡Hola Inca ${s.nombre}! Quiero adherirme al ${plan} y pagar por transferencia. ¿Me pasan el alias?`)}" target="_blank" rel="noopener">
               <span class="btn__txt">${tieneDatos ? 'Mandar comprobante' : 'Pedir alias por WhatsApp'}</span>${FLECHA}</a>`;
      } else if (m.linkPago) {
        h = `<h2 class="vista__titulo" id="v-final-titulo" tabindex="-1">¡Vamos!</h2>
             <p>Te llevamos al pago seguro con ${esc(m.nombre.toLowerCase())}.</p>
             <a class="btn btn--ancho" href="${esc(m.linkPago)}" data-ir-pago><span class="btn__txt">Ir a pagar ${monto}</span>${FLECHA}</a>`;
      } else if (m.botonPago) {
        h = `<h2 class="vista__titulo" id="v-final-titulo" tabindex="-1">Último paso</h2>
             <p>Tocá el botón para pagar ${monto} con ${esc(m.nombre.toLowerCase())}.</p>
             <div class="boton-pago-externo" data-boton-pago></div>`;
      } else {
        h = `<h2 class="vista__titulo" id="v-final-titulo" tabindex="-1">Último paso</h2>
             <p>Pedí tu link de pago por WhatsApp a Inca ${esc(s.nombre)} y te lo mandan al toque.</p>
             <a class="btn btn--ancho" href="${wa(s.whatsapp, `¡Hola Inca ${s.nombre}! Quiero adherirme al ${plan} y pagar con ${m.nombre.toLowerCase()}. ¿Me pasan el link de pago?`)}" target="_blank" rel="noopener">
               <span class="btn__txt">Pedir link de pago</span>${FLECHA}</a>`;
      }
      vistas.final.innerHTML = h;
      const cont = $('[data-boton-pago]', vistas.final);
      if (cont) inyectarHTML(cont, m.botonPago);
      enviarPlanilla({ tipo: 'eligio-pago', sede: s.nombre, precio: monto, pago: m.nombre });
      mostrar('final');
      if (m.linkPago && m.tipo !== 'transferencia') setTimeout(() => { location.href = m.linkPago; }, 700);   // va solo al pago
    }

    // Botones de afuera que abren la hoja
    d.addEventListener('click', (e) => {
      const abrir = e.target.closest('[data-abrir-sedes]');
      if (abrir) {
        e.preventDefault();
        if (E === 'terminada') abrirDialogo($('#hoja-dudas'));
        else abrirEn('sedes');
        return;
      }
      const elegir = e.target.closest('[data-elegir-sede]');
      if (elegir && sedePorId(elegir.dataset.elegirSede)) { e.preventDefault(); abrirEn('precio', elegir.dataset.elegirSede); }
    });

    // Todo lo que pasa adentro de la hoja
    dlg.addEventListener('click', (e) => {
      const t = e.target;
      const bSede = t.closest('[data-sede]');
      if (bSede) { sede = sedePorId(bSede.dataset.sede); pintarPrecio(); mostrar('precio'); return; }
      if (t.closest('[data-cambiar-sede]')) { mostrar('sedes'); return; }
      if (t.closest('[data-atras]')) { if (historial.length) mostrar(historial.pop(), true); return; }
      if (t.closest('[data-aviso]')) { enviarPlanilla({ tipo: 'aviso', sede: sede.nombre, precio: pesos(sede.precioAnual), pago: '' }); return; }
      if (t.closest('[data-adherir]')) {
        medios = mediosDe(sede);
        if (medios.length === 1) pintarFinal(medios[0]);
        else { pintarPago(); mostrar('pago'); }
        return;
      }
      const bMedio = t.closest('[data-medio]');
      if (bMedio) { pintarFinal(medios[Number(bMedio.dataset.medio)]); return; }
      const c = t.closest('[data-copiar]');
      if (c) {
        const v = c.dataset.copiar;
        const ok = () => { c.textContent = 'Copiado'; setTimeout(() => { c.textContent = 'Copiar'; }, 1800); };
        const aMano = () => {                     // respaldo para navegadores que no dejan usar el portapapeles
          const ta = d.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
          dlg.appendChild(ta); ta.select();
          try { if (d.execCommand('copy')) ok(); } catch (err) { /* nada */ }
          ta.remove();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok).catch(aMano);
        else aMano();
      }
    });
  }

  /* =====================================================================
     4. BARRA FIJA DEL CELULAR: se esconde cuando ya hay un botón a la vista
     ===================================================================== */
  function barra() {
    const b = $('[data-barra]');
    if (!b) return;
    if (E === 'terminada') { b.hidden = true; return; }
    if (!IO) return;
    const tapan = ['[data-cta-hero]', '[data-sedes]', '[data-cierre]', '[data-pie]'].map((s) => $(s)).filter(Boolean);
    const visibles = new Set();
    const actualizar = () => b.classList.toggle('is-oculta', visibles.size > 0 || dialogosAbiertos > 0);
    b.classList.add('is-oculta');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
      actualizar();
    });
    tapan.forEach((el) => io.observe(el));
    alCambiarDialogo.push(actualizar);
  }

  /* =====================================================================
     5. VIDEO DE FONDO: primero se ve la foto; el video arranca cuando la
     página ya cargó. Con ahorro de datos o "reducir movimiento", queda la foto.
     ===================================================================== */
  function fondo() {
    const v = $('[data-fondo]');
    if (!v || !v.dataset.src) return;
    const ahorro = !!(navigator.connection && navigator.connection.saveData);
    if (RM || ahorro) return;
    const reproducir = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const cargar = () => {
      v.src = v.dataset.src;
      reproducir();
      if (IO) new IntersectionObserver(([e]) => { if (e.isIntersecting) reproducir(); else if (!v.paused) v.pause(); }).observe(v);
    };
    if (d.readyState === 'complete') setTimeout(cargar, 300);
    else addEventListener('load', () => setTimeout(cargar, 300), { once: true });
  }

  /* =====================================================================
     6. ANIMACIONES AL SCROLLEAR (IntersectionObserver)
     Los estados ocultos solo existen con la clase "anim". Sin JS, con error
     o con "reducir movimiento", todo se ve completo y quieto.
     ===================================================================== */
  function animaciones() {
    if (RM || !IO) return;
    $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => { c.style.transitionDelay = `${i * 70}ms`; }));
    const items = $$('[data-reveal], [data-titulo], [data-sello], [data-linea]');
    html.classList.add('anim');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((i) => io.observe(i));
    // Respaldo: lo que ya pasó por la pantalla nunca queda escondido
    const rescate = () => items.forEach((i) => { if (i.getBoundingClientRect().top < innerHeight) i.classList.add('is-in'); });
    addEventListener('load', () => setTimeout(rescate, 2500));
  }

  function contadores() {
    if (RM || !IO) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const fin = parseInt(el.dataset.count, 10);
      if (isNaN(fin)) return;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        el.textContent = String(Math.round(fin * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setTimeout(() => { el.textContent = String(fin); }, 1100);   // respaldo: siempre termina en la cifra real
    }), { threshold: 0.6 });
    $$('[data-count]').forEach((n) => io.observe(n));
  }

  // El número gigante del cierre se desliza apenas con el scroll (solo transform)
  function deriva() {
    if (RM) return;
    const els = $$('[data-deriva]');
    if (!els.length) return;
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const vh = innerHeight;
      els.forEach((el) => {
        const caja = el.closest('header, section');
        if (!caja) return;
        const r = caja.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const avance = (vh - r.top) / (vh + r.height);
        el.style.translate = `${(-avance * 12).toFixed(2)}% 0`;
      });
    };
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
    actualizar();
  }

  /* ---------- Arranque ---------- */
  safe(prepararDialogos, 'diálogos');
  safe(portada, 'portada');
  safe(sedes, 'sedes');
  safe(contador, 'contador');
  safe(compra, 'compra');
  safe(barra, 'barra');
  safe(fondo, 'video de fondo');
  safe(() => {
    try { animaciones(); } catch (e) { html.classList.remove('anim'); throw e; }   // si falla, todo visible
  }, 'animaciones');
  safe(contadores, 'contadores');
  safe(deriva, 'deriva');
})();
