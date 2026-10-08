/**
 * Capa de presentación.
 * Lee las acciones del usuario y actualiza los elementos de la página.
 */
(function iniciarAplicacion() {
  "use strict";

  const logica = new window.CalculadoraGastos();
  const formatoMoneda = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2
  });

  const elementos = {
    formulario: document.querySelector("#formulario-gasto"),
    descripcion: document.querySelector("#descripcion"),
    categoria: document.querySelector("#categoria"),
    monto: document.querySelector("#monto"),
    botonLimpiar: document.querySelector("#boton-limpiar"),
    total: document.querySelector("#total-gastos"),
    cantidad: document.querySelector("#cantidad-gastos"),
    promedio: document.querySelector("#promedio-gastos"),
    categoriaPrincipal: document.querySelector("#categoria-principal"),
    lista: document.querySelector("#lista-gastos"),
    estadoVacio: document.querySelector("#estado-vacio"),
    notificacion: document.querySelector("#notificacion")
  };

  elementos.formulario.addEventListener("submit", registrarGasto);
  elementos.lista.addEventListener("click", eliminarGasto);
  elementos.botonLimpiar.addEventListener("click", limpiarGastos);

  renderizar(logica.procesarSolicitud({ tipo: "OBTENER_ESTADO" }));
  elementos.descripcion.focus();

  function registrarGasto(evento) {
    evento.preventDefault();
    limpiarErrores();

    const solicitud = {
      tipo: "AGREGAR_GASTO",
      datos: {
        descripcion: elementos.descripcion.value,
        categoria: elementos.categoria.value,
        monto: elementos.monto.value
      }
    };

    const respuesta = logica.procesarSolicitud(solicitud);

    if (!respuesta.exito) {
      mostrarErrores(respuesta.errores);
      mostrarNotificacion(respuesta.mensaje);
      return;
    }

    renderizar(respuesta);
    elementos.formulario.reset();
    elementos.descripcion.focus();
    mostrarNotificacion(respuesta.mensaje);
  }

  function eliminarGasto(evento) {
    const boton = evento.target.closest("[data-eliminar-id]");
    if (!boton) return;

    const solicitud = {
      tipo: "ELIMINAR_GASTO",
      datos: { id: Number(boton.dataset.eliminarId) }
    };
    const respuesta = logica.procesarSolicitud(solicitud);

    renderizar(respuesta);
    mostrarNotificacion(respuesta.mensaje);
  }

  function limpiarGastos() {
    if (elementos.botonLimpiar.disabled) return;

    const respuesta = logica.procesarSolicitud({ tipo: "LIMPIAR_GASTOS" });
    renderizar(respuesta);
    mostrarNotificacion(respuesta.mensaje);
  }

  function renderizar(respuesta) {
    const { gastos, resumen } = respuesta.datos;

    elementos.total.textContent = formatearMoneda(resumen.total);
    elementos.cantidad.textContent = resumen.cantidad;
    elementos.promedio.textContent = formatearMoneda(resumen.promedio);
    elementos.categoriaPrincipal.textContent = resumen.categoriaPrincipal;
    elementos.estadoVacio.hidden = gastos.length > 0;
    elementos.botonLimpiar.disabled = gastos.length === 0;
    elementos.lista.innerHTML = gastos.map(crearFilaGasto).join("");
  }

  function crearFilaGasto(gasto) {
    const iconos = {
      "Alimentación": "🍲",
      "Transporte": "🚌",
      "Estudios": "📚",
      "Servicios": "💡",
      "Entretenimiento": "🎟️",
      "Otros": "🧾"
    };

    return `
      <li class="gasto">
        <span class="gasto__icono" aria-hidden="true">${iconos[gasto.categoria] || "🧾"}</span>
        <div class="gasto__info">
          <strong>${escaparHtml(gasto.descripcion)}</strong>
          <span>${escaparHtml(gasto.categoria)}</span>
        </div>
        <p class="gasto__monto">${formatearMoneda(gasto.monto)}</p>
        <button
          class="gasto__eliminar"
          type="button"
          data-eliminar-id="${gasto.id}"
          aria-label="Eliminar ${escaparHtml(gasto.descripcion)}"
          title="Eliminar gasto"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
          </svg>
        </button>
      </li>`;
  }

  function mostrarErrores(errores = {}) {
    Object.entries(errores).forEach(([campo, mensaje]) => {
      const entrada = elementos[campo];
      const error = document.querySelector(`#error-${campo}`);
      if (entrada) entrada.closest(".campo")?.classList.add("campo--invalido");
      if (error) error.textContent = mensaje;
    });
  }

  function limpiarErrores() {
    document.querySelectorAll(".campo--invalido").forEach((campo) => campo.classList.remove("campo--invalido"));
    document.querySelectorAll(".campo__error").forEach((error) => (error.textContent = ""));
  }

  function mostrarNotificacion(mensaje) {
    elementos.notificacion.textContent = mensaje;
    elementos.notificacion.classList.add("notificacion--visible");
    window.clearTimeout(mostrarNotificacion.temporizador);
    mostrarNotificacion.temporizador = window.setTimeout(() => {
      elementos.notificacion.classList.remove("notificacion--visible");
    }, 2300);
  }

  function escaparHtml(texto) {
    const elemento = document.createElement("span");
    elemento.textContent = texto;
    return elemento.innerHTML;
  }

  function formatearMoneda(monto) {
    return formatoMoneda.format(monto).replace("PEN", "S/");
  }
})();
