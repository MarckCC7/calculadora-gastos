/**
 * CAPA DE LÓGICA
 * Recibe solicitudes, valida datos y realiza todos los cálculos.
 * No conoce el HTML ni modifica la interfaz.
 */
class CalculadoraGastos {
  constructor() {
    this.gastos = [];
    this.siguienteId = 1;
  }

  /**
   * Punto de entrada de la capa lógica.
   * @param {{ tipo: string, datos?: object }} solicitud
   * @returns {{ exito: boolean, mensaje: string, datos: object }}
   */
  procesarSolicitud(solicitud) {
    if (!solicitud || !solicitud.tipo) {
      return this._respuestaError("La solicitud no tiene un tipo válido.");
    }

    switch (solicitud.tipo) {
      case "AGREGAR_GASTO":
        return this._agregarGasto(solicitud.datos);
      case "ELIMINAR_GASTO":
        return this._eliminarGasto(solicitud.datos?.id);
      case "LIMPIAR_GASTOS":
        return this._limpiarGastos();
      case "OBTENER_ESTADO":
        return this._respuestaExitosa("Estado calculado.");
      default:
        return this._respuestaError(`Tipo de solicitud no reconocido: ${solicitud.tipo}`);
    }
  }

  _agregarGasto(datos = {}) {
    const descripcion = String(datos.descripcion || "").trim();
    const categoria = String(datos.categoria || "").trim();
    const monto = Number(datos.monto);
    const errores = {};

    if (descripcion.length < 2) {
      errores.descripcion = "Escribe una descripción de al menos 2 caracteres.";
    }

    if (!categoria) {
      errores.categoria = "Selecciona una categoría.";
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      errores.monto = "Ingresa un monto mayor que cero.";
    }

    if (Object.keys(errores).length > 0) {
      return {
        exito: false,
        mensaje: "Revisa los datos enviados.",
        errores,
        datos: this._crearEstado()
      };
    }

    const gasto = {
      id: this.siguienteId++,
      descripcion,
      categoria,
      monto: Math.round(monto * 100) / 100,
      fecha: new Date().toISOString()
    };

    this.gastos.unshift(gasto);
    return this._respuestaExitosa("Gasto registrado correctamente.", { gasto });
  }

  _eliminarGasto(id) {
    const idNumerico = Number(id);
    const indice = this.gastos.findIndex((gasto) => gasto.id === idNumerico);

    if (indice === -1) {
      return this._respuestaError("No se encontró el gasto solicitado.");
    }

    const [gastoEliminado] = this.gastos.splice(indice, 1);
    return this._respuestaExitosa("Gasto eliminado.", { gastoEliminado });
  }

  _limpiarGastos() {
    this.gastos = [];
    return this._respuestaExitosa("Se eliminaron todos los gastos.");
  }

  _calcularResumen() {
    const total = this.gastos.reduce((acumulado, gasto) => acumulado + gasto.monto, 0);
    const cantidad = this.gastos.length;
    const promedio = cantidad > 0 ? total / cantidad : 0;
    const totalPorCategoria = this.gastos.reduce((totales, gasto) => {
      totales[gasto.categoria] = (totales[gasto.categoria] || 0) + gasto.monto;
      return totales;
    }, {});

    const categoriaPrincipal = Object.entries(totalPorCategoria).sort(
      ([, totalA], [, totalB]) => totalB - totalA
    )[0]?.[0] || "—";

    return {
      total: Math.round(total * 100) / 100,
      cantidad,
      promedio: Math.round(promedio * 100) / 100,
      categoriaPrincipal
    };
  }

  _crearEstado() {
    return {
      gastos: this.gastos.map((gasto) => ({ ...gasto })),
      resumen: this._calcularResumen()
    };
  }

  _respuestaExitosa(mensaje, datosExtra = {}) {
    return {
      exito: true,
      mensaje,
      datos: { ...this._crearEstado(), ...datosExtra }
    };
  }

  _respuestaError(mensaje) {
    return {
      exito: false,
      mensaje,
      errores: {},
      datos: this._crearEstado()
    };
  }
}

// Navegador: la capa de presentación podrá crear una instancia.
if (typeof window !== "undefined") {
  window.CalculadoraGastos = CalculadoraGastos;
}

// Node.js: permite probar esta capa sin abrir la interfaz.
if (typeof module !== "undefined" && module.exports) {
  module.exports = CalculadoraGastos;
}
