// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CatalogoPublico() {
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [carrito, setCarrito] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estado para las preguntas frecuentes desplegables (FAQ)
  const [faqAbierta, setFaqAbierta] = useState(null);

  // Estado para ver la imagen ampliada (Modal / Lightbox)
  const [imagenModal, setImagenModal] = useState(null);

  // Estado para la foto activa de cada tarjeta (por si un producto tiene varias fotos)
  const [fotoActiva, setFotoActiva] = useState({});

  useEffect(() => {
    cargarProductosSupabase();
  }, []);

  // 🔄 Efecto para hacer que las fotos cambien solas cada 3 segundos si el producto tiene varias
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFotoActiva((prev) => {
        const nuevoEstado = { ...prev };
        productos.forEach((prod) => {
          const fotos = obtenerFotos(prod);
          if (fotos.length > 1) {
            const actual = prev[prod.id] || 0;
            nuevoEstado[prod.id] = (actual + 1) % fotos.length; // Pasa a la siguiente y vuelve a 0 al llegar al final
          }
        });
        return nuevoEstado;
      });
    }, 3000); // 👈 3000 milisegundos = 3 segundos (lo podés cambiar si querés más rápido o lento)

    return () => clearInterval(intervalo);
  }, [productos]);

  const cargarProductosSupabase = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProductos(data);
    setCargando(false);
  };

  // Función para obtener la lista de fotos (si vienen separadas por coma o es una sola)
  const obtenerFotos = (prod) => {
    if (prod.imagenes && Array.isArray(prod.imagenes)) return prod.imagenes;
    if (prod.imagen_url && prod.imagen_url.includes(",")) {
      return prod.imagen_url.split(",").map((url) => url.trim());
    }
    return prod.imagen_url ? [prod.imagen_url] : [];
  };

  const cambiarFoto = (productoId, idx) => {
    setFotoActiva((prev) => ({ ...prev, [productoId]: idx }));
  };

  const categorias = [
    "Todas",
    ...Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))),
  ];

  const productosFiltrados =
    categoriaSeleccionada === "Todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaSeleccionada);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.id === producto.id);
    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito(
      carrito
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const enviarAWhatsApp = () => {
    if (carrito.length === 0) return;

    const numeroWhatsApp = "5491135061353";
    let mensaje = `¡Hola! 👋 Quisiera hacer el siguiente pedido en *Rufus Design 3D*:\n\n`;
    if (clienteNombre) mensaje += `*Cliente:* ${clienteNombre}\n\n`;
    mensaje += `*Detalle del pedido:*\n`;

    carrito.forEach((item) => {
      mensaje += `• ${item.cantidad}x ${item.nombre} ($${(
        item.precio * item.cantidad
      ).toLocaleString()})\n`;
    });

    mensaje += `\n*Total estimado: $${totalCarrito.toLocaleString()}*\n\n¿Me confirmás disponibilidad y medios de pago? ¡Muchas gracias!`;

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  const faqs = [
    {
      pregunta: "¿Cómo es el envío o la entrega?",
      respuesta:
        "Coordinamos entregas presenciales en Merlo, Mariano Acosta y Ituzaingó, o realizamos envíos por correo a todo el país.",
    },
    {
      pregunta: "¿En qué colores están disponibles?",
      respuesta:
        "Trabajamos con una amplia variedad de colores en filamento PLA de excelente calidad. Al enviar tu pedido por WhatsApp te confirmamos el stock exacto para tu modelo.",
    },
    {
      pregunta: "¿Se pueden cambiar las medidas o personalizar?",
      respuesta:
        "¡Sí! Fabricamos bajo demanda, por lo que podemos adaptar tamaños, agregar nombres, escudos o detalles especiales a tus piezas.",
    },
    {
      pregunta: "¿De qué material son?",
      respuesta:
        "Imprimimos en PLA de alta calidad. En el caso de los chops, incluyen vaso térmico de aluminio interno apto para consumo, garantizando durabilidad e higiene.",
    },
    {
      pregunta: "¿Puedo pedir algo que no está en el catálogo?",
      respuesta:
        "¡Por supuesto! Podés escribirnos directamente por WhatsApp comentándonos tu idea o enviándonos un modelo 3D/foto para que te pasemos un presupuesto a medida.",
    },
    {
      pregunta: "¿Cómo se paga?",
      respuesta:
        "Para iniciar la fabricación abonás una seña del 50% del total. El 50% restante se cancela al momento de la entrega.",
    },
    {
      pregunta: "¿Cuánto tarda mi pedido?",
      respuesta:
        "Los tiempos estándar de producción rondan entre 3 y 7 días hábiles según la complejidad de la pieza y la demanda actual del taller.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080a10] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Catálogo */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <img 
                src="/logo.png" 
                alt="Rufus Design 3D Logo" 
                className="w-24 h-24 rounded-full object-cover border-2 border-amber-400 shadow-lg shadow-amber-400/10 bg-[#1c212e]" 
            />
            <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                Rufus Design 3D
                </h1>
                <p className="text-[11px] text-zinc-400">Impresión y Fabricación Aditiva</p>
            </div>
            </div>
         
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 text-transparent bg-clip-text">
                Rufus Design 3D
              </span>{" "}
              — Catálogo
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Elegí tus impresiones personalizadas y armá tu pedido por WhatsApp.
            </p>
          </div>
        </header>

        {/* Filtro por Categorías */}
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoriaSeleccionada === cat
                  ? "bg-amber-400 text-black shadow-lg"
                  : "bg-[#12161f] text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de Productos + Carrito */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cargando ? (
              <p className="text-xs text-zinc-500 col-span-2 text-center py-12">
                Cargando productos...
              </p>
            ) : productosFiltrados.length === 0 ? (
              <p className="text-xs text-zinc-500 col-span-2 text-center py-12">
                No hay productos en esta categoría por el momento.
              </p>
            ) : (
              productosFiltrados.map((prod) => {
                const fotos = obtenerFotos(prod);
                const idxFotoActiva = fotoActiva[prod.id] || 0;
                const fotoActual = fotos[idxFotoActiva] || prod.imagen_url;

                return (
                  <div
                    key={prod.id}
                    className="bg-[#12161f] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl hover:border-amber-400/40 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Contenedor de Imagen con transición de opacidad real */}
                        <div className="relative group w-full h-52 bg-[#0c0f17] rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                        {fotoActual && fotoActual.startsWith("http") ? (
                            <>
                            <img
                                key={fotoActual}
                                src={fotoActual}
                                alt={prod.nombre}
                                onClick={() => setImagenModal(fotoActual)}
                                className="w-full h-full object-contain cursor-pointer transition-opacity duration-700 ease-in-out hover:scale-105 p-2 animate-[fadeIn_0.6s_ease-in-out]"
                            />
                            <div
                                onClick={() => setImagenModal(fotoActual)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                                <span className="text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-full border border-amber-400/50">
                                🔍 Ver completa
                                </span>
                            </div>
                            </>
                        ) : (
                            <div className="text-4xl">{prod.imagen_url || "📦"}</div>
                        )}
                        </div>

                      {/* Miniaturas o puntos si hay varias fotos separadas por coma en el admin */}
                      {fotos.length > 1 && (
                        <div className="flex gap-2 justify-center pt-1">
                          {fotos.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => cambiarFoto(prod.id, idx)}
                              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                                idxFotoActiva === idx
                                  ? "bg-amber-400 scale-110"
                                  : "bg-zinc-700 hover:bg-zinc-500"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] bg-zinc-800 text-amber-400 px-2 py-0.5 rounded font-bold">
                          {prod.categoria}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">
                          {prod.nombre}
                        </h3>
                        {prod.descripcion && (
                          <p className="text-xs text-zinc-400 mt-1">
                            {prod.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-lg font-black text-amber-400 font-mono">
                        ${Number(prod.precio).toLocaleString()}
                      </span>
                      <button
                        onClick={() => agregarAlCarrito(prod)}
                        className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Carrito Flotante */}
          <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400/80 shadow-2xl space-y-4 h-fit sticky top-6">
            <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>🛒 Tu Pedido</span>
              <span className="text-xs text-zinc-400">
                {carrito.reduce((acc, i) => acc + i.cantidad, 0)} ítems
              </span>
            </h2>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Nombre para la Entrega
              </label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Ej: Mariano"
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">
                  El carrito está vacío.
                </p>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1c212e] p-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{item.nombre}</div>
                      <div className="text-amber-400 font-mono">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(item.id, -1)}
                        className="bg-zinc-800 px-2 py-1 rounded text-white font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(item.id, 1)}
                        className="bg-zinc-800 px-2 py-1 rounded text-white font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-400">Total:</span>
                <span className="text-xl text-amber-400 font-mono">
                  ${totalCarrito.toLocaleString()}
                </span>
              </div>

              <button
                onClick={enviarAWhatsApp}
                disabled={carrito.length === 0}
                className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  carrito.length === 0
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl"
                }`}
              >
                <span>💬 Pedir por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN: CÓMO COMPRAR */}
        <section className="bg-[#12161f] border border-zinc-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="text-center space-y-3 flex flex-col items-center">
            <img 
                src="/logo.png" 
                alt="Rufus Design 3D" 
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-amber-400 shadow-2xl shadow-amber-400/20 bg-[#1c212e] object-cover"
            />
            <h2 className="text-2xl font-black text-white italic">Cómo comprar</h2>
            </div>
            
          <div className="space-y-3 max-w-2xl mx-auto text-xs text-zinc-300 leading-relaxed font-medium">
            <p>1. Elegí tus productos y tocá "Agregar al pedido".</p>
            <p>2. Enviá el pedido por WhatsApp, todo en un solo mensaje.</p>
            <p>3. Te confirmo colores y plazo. Para comenzar tu pedido se abona una seña del 50% del total.</p>
            <p>4. Cuando terminamos tu pedido te avisamos y coordinamos la entrega.</p>
          </div>
        </section>

        {/* SECCIÓN: PREGUNTAS FRECUENTES */}
        <section className="bg-[#12161f] border border-zinc-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-widest">
              Dudas comunes
            </span>
            <h2 className="text-2xl font-black text-white italic">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto pt-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#1c212e] border-l-4 border-l-amber-400 border-y border-r border-zinc-800 rounded-r-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setFaqAbierta(faqAbierta === index ? null : index)
                  }
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs md:text-sm text-white hover:text-amber-400 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">▶</span> {faq.pregunta}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">
                    {faqAbierta === index ? "−" : "+"}
                  </span>
                </button>
                {faqAbierta === index && (
                  <div className="p-4 pt-0 text-xs text-zinc-400 border-t border-zinc-800/60 leading-relaxed">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MODAL / LIGHTBOX PARA VER IMAGEN EN TAMAÑO COMPLETO */}
        {imagenModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setImagenModal(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
              <button
                onClick={() => setImagenModal(null)}
                className="absolute -top-10 right-0 text-white hover:text-amber-400 font-extrabold text-sm bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-700 cursor-pointer"
              >
                ✕ Cerrar
              </button>
              <img
                src={imagenModal}
                alt="Vista ampliada"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-amber-400/40 shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Footer Catálogo Público */}
        <footer className="border-t border-zinc-800 pt-6 pb-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            <span className="font-bold text-zinc-400">Rufus Design 3D</span> —
            Impresión 3D, Zona Oeste, Buenos Aires.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/rufusdesign_/"
              target="_blank"
              className="hover:text-amber-400 transition-all"
            >
              Instagram ↗
            </a>
            <a
              href="https://wa.me/5491135061353"
              target="_blank"
              className="hover:text-emerald-400 transition-all"
            >
              WhatsApp ↗
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}