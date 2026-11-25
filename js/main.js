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
  // 780000 → "$780.000" (igual en cualquier celular)
  const pesos = (n) => '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // "5492612533809" → "261 253-3809"
  const telVisible = (n) => {
    let x = String(n).replace(/\D/g, '');
    if (x.startsWith('549')) x = x.slice(3);
    if (x.length !== 10) return x;
    return x.startsWith('261') ? `${x.slice(0, 3)} ${x.slice(3, 6)}-${x.slice(6)}` : `${x.slice(0, 4)} ${x.slice(4, 6)}-${x.slice(6)}`;
  };
  const FLECHA = '<svg class="btn__flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
  const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z"/></svg>';
  const ICONO_MAPA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  /* ---------- Precio y cuotas (salen de promos.js) ---------- */
  const PRECIO = Number(P.precio) || 0;
  const CUOTAS = (Array.isArray(P.cuotas) && P.cuotas.length ? P.cuotas : [1]).map(Number).filter((c) => c > 0).sort((a, b) => a - b);
  const MAX_CUOTAS = CUOTAS[CUOTAS.length - 1];
  const POR_MES = PRECIO / 12;
  // "También en 1 pago o en 3 cuotas sin interés de $260.000, o con débito directo (CBU)."
  const textoOtrasFormas = () => {
    const otras = CUOTAS.filter((c) => c !== MAX_CUOTAS).map((c) => (c === 1 ? '1 pago' : `${c} cuotas sin interés de ${pesos(PRECIO / c)}`));
    let t = otras.length ? `También en ${otras.join(' o en ')}` : '';
    if (P.debitoCBU) t += t ? ', o con débito directo (CBU)' : 'También con débito directo (CBU)';
    return t ? t + '.' : '';
  };

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
  const hora = (ts) => { const f = arg(ts); return `${f.getUTCHours()}:${pad(f.getUTCMinutes())}`; };   // "23:59"
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
  const promoNombre = () => (P.cinta ? `promo ${P.cinta}` : 'promo');
  const mensajeDudas = (s) => (E === 'terminada'
    ? `¡Hola Inca ${s.nombre}! Vi que terminó la ${promoNombre()}. ¿Qué planes tienen ahora?`
    : `¡Hola Inca ${s.nombre}! Vi la ${promoNombre()} del plan anual y tengo una consulta: `);

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
    if (P.cinta) {
      $$('[data-cinta] span').forEach((s) => { s.textContent = P.cinta; });
      set('[data-cinta-sr]', E === 'terminada' ? `Promo ${P.cinta} finalizada` : `Promo ${P.cinta}`);
    }
    const h1 = $('[data-titular]');
    if (h1 && Array.isArray(P.titular) && P.titular.length) {
      h1.innerHTML = P.titular.map((l, i, a) => `<span class="linea${i === a.length - 1 ? ' golpe' : ''}">${esc(l)}</span>`).join(' ');
    }
    set('[data-oferta-arriba]', P.ofertaArriba);
    set('[data-oferta-grande]', P.ofertaGrande);
    const abajo = $('[data-oferta-abajo]');
    if (abajo) { if (P.ofertaAbajo) abajo.textContent = P.ofertaAbajo; else abajo.remove(); }
    $$('[data-cta-texto]').forEach((el) => { el.textContent = E === 'terminada' ? 'Consultar planes vigentes' : (P.botonPortada || el.textContent); });
    set('[data-sello-cierre]', E === 'terminada' ? 'Promo finalizada' : `Hasta el ${fechaHora(hasta)}`);
    set('[data-barra-precio]', `Hasta ${MAX_CUOTAS} cuotas sin interés`);
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
     2. SEDES (tarjetas de la página), CONDICIONES Y WHATSAPP DE DUDAS
     ===================================================================== */
  const chips = (s) => (Array.isArray(s.actividades) && s.actividades.length
    ? `<ul class="chips" aria-label="Actividades">${s.actividades.map((a) => `<li class="chip">${esc(a)}</li>`).join('')}</ul>` : '');

  function sedes() {
    const ul = $('[data-sedes]');
    if (ul) {
      ul.innerHTML = D.sedes.map((s) => {
        const accion = E === 'terminada'
          ? `<a class="btn btn--compacto" href="${wa(s.whatsapp, mensajeDudas(s))}" target="_blank" rel="noopener"><span class="btn__txt">Consultar planes</span>${FLECHA}</a>`
          : `<button type="button" class="btn btn--compacto" data-elegir-sede="${esc(s.id)}"><span class="btn__txt">Quiero mi plan acá</span>${FLECHA}</button>`;
        return `
        <li class="sede" data-reveal>
          <div>
            <h3 class="sede__nombre">${esc(s.nombre)}</h3>
            <p class="sede__dir">${esc(s.direccion)}</p>
          </div>
          ${chips(s)}
          ${E === 'terminada' ? '' : `<div class="sede__precio">
            <p class="sede__monto">${pesos(PRECIO)}</p>
            <p class="sede__cuotas">Hasta ${MAX_CUOTAS} cuotas <strong>sin interés</strong> de ${pesos(PRECIO / MAX_CUOTAS)}</p>
            ${P.mostrarPorMes ? `<p class="sede__mes">Equivale a ${pesos(POR_MES)} por mes · ${esc((P.textoPorMes || '').toLowerCase())}</p>` : ''}
          </div>`}
          <div class="sede__acciones">
            ${accion}
            <a class="boton-linea" href="${wa(s.whatsapp, mensajeDudas(s))}" target="_blank" rel="noopener">${ICONO_WA}WhatsApp</a>
            <a class="boton-linea" href="${mapa(s.direccion)}" target="_blank" rel="noopener">${ICONO_MAPA}Cómo llegar</a>
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
          <span><strong>${esc(s.nombre)}</strong><br><span>${esc(telVisible(s.whatsapp))} · ${esc(s.direccion)}</span></span>${ICONO_WA}
        </a></li>`).join('');
    }
  }

  /* =====================================================================
     3. COMPRA: elegir sede → ver el plan de esa sede → ir al portal de pago
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

  // Anota en la planilla qué sede eligió al ir a pagar (sin datos personales). Nunca frena la compra.
  function enviarPlanilla(datos) {
    const url = (A.urlPlanilla || '').trim();
    if (!url) return;
    const body = new URLSearchParams(Object.assign({ promo: P.nombre, pagina: location.origin + location.pathname, fecha: new Date().toISOString() }, datos, UTM));
    try { if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return; } catch (e) { /* sigue con fetch */ }
    fetch(url, { method: 'POST', mode: 'no-cors', body, keepalive: true }).catch(() => {});
  }

  function compra() {
    const dlg = $('#hoja-compra');
    if (!dlg) return;
    const vistas = {};
    $$('[data-vista]', dlg).forEach((v) => { vistas[v.dataset.vista] = v; });
    const paso = $('[data-hoja-paso]', dlg);
    const atras = $('[data-atras]', dlg);
    const PASOS = { sedes: 'Paso 1 de 2', precio: 'Paso 2 de 2' };
    let sede = null;
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
      const link = (s.linkPago || '').trim();
      let boton;
      if (E === 'antes') {
        boton = `<a class="btn btn--ancho" href="${wa(s.whatsapp, `¡Hola Inca ${s.nombre}! Quiero el plan anual de la ${promoNombre()}. ¿Me avisan el ${fechaCorta(desde)} cuando arranque?`)}" target="_blank" rel="noopener" data-aviso>
             <span class="btn__txt">Avisame cuando arranque</span>${FLECHA}</a>`;
      } else if (link) {
        boton = `<a class="btn btn--ancho" href="${esc(link)}" data-ir-pago><span class="btn__txt">${esc(P.botonPago || 'Quiero mi plan anual')}</span>${FLECHA}</a>`;
      } else {                                   // sin link de pago: cierra la venta por WhatsApp
        boton = `<a class="btn btn--ancho" href="${wa(s.whatsapp, `¡Hola Inca ${s.nombre}! Quiero el plan anual de la ${promoNombre()}. ¿Cómo lo pago?`)}" target="_blank" rel="noopener"><span class="btn__txt">${esc(P.botonPago || 'Quiero mi plan anual')}</span>${FLECHA}</a>`;
      }
      const ayuda = E === 'antes'
        ? `La promo arranca el ${esc(fechaHora(desde))}.`
        : link
          ? 'Pago seguro · al entrar, tocá <strong>Plan anual</strong>'
          : 'Te escribís con la sede por WhatsApp para pagar';
      const otras = textoOtrasFormas();
      vistas.precio.innerHTML = `
        <h2 class="vista__titulo" id="v-precio-titulo" tabindex="-1">Tu plan anual en <span>${esc(s.nombre)}</span></h2>
        <div class="vista__fila">
          <a class="wa-link" href="${wa(s.whatsapp, mensajeDudas(s))}" target="_blank" rel="noopener">${ICONO_WA}<span>WhatsApp <strong>${esc(telVisible(s.whatsapp))}</strong></span></a>
          <button type="button" class="enlace" data-cambiar-sede>Cambiar sede</button>
        </div>
        ${chips(s)}
        <div class="precio-final">
          <p class="precio-final__monto">${pesos(PRECIO)}</p>
          <p class="precio-final__cuotas">Hasta ${MAX_CUOTAS} cuotas <span class="resalte">sin interés</span> de ${pesos(PRECIO / MAX_CUOTAS)}</p>
          ${otras ? `<p class="precio-final__detalle">${esc(otras)}</p>` : ''}
        </div>
        ${P.mostrarPorMes ? `<p class="sello sello--chico sello--mes" aria-hidden="true"><span class="sello__pre">Equivale a</span><span class="sello__a">${pesos(POR_MES)} por mes</span>${P.textoPorMes ? `<span class="sello__b">${esc(P.textoPorMes)}</span>` : ''}</p>
        <p class="sr-only">Equivale a ${pesos(POR_MES)} por mes. ${esc(P.textoPorMes || '')}.</p>` : ''}
        <ul class="incluye">${(P.incluye || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
        <p class="estado" data-estado>${esc(textoEstado())}</p>
        <p class="form__legal form__legal--izq">Al comprar aceptás los <a href="terminos.html" target="_blank" rel="noopener">términos y condiciones</a>. En el portal de pago te piden nombre, email, DNI y teléfono.</p>
        <div class="vista__accion">
          ${boton}
          <p class="form__legal">${ayuda}</p>
        </div>`;
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
      if (t.closest('[data-aviso]')) { enviarPlanilla({ tipo: 'aviso', sede: sede.nombre, precio: pesos(PRECIO), pago: '' }); return; }
      if (t.closest('[data-ir-pago]')) { enviarPlanilla({ tipo: 'fue-a-pagar', sede: sede.nombre, precio: pesos(PRECIO), pago: 'PagoTIC' }); }   // sigue al link
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
