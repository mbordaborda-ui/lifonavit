export type LegalSection = { title: string; body: string[] };

export type LegalPage = {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacidad",
    title: "Política de privacidad",
    intro:
      "Esta política explica qué datos personales tratamos cuando visitas o compras en la tienda LINFOVIT, para qué los usamos y cómo puedes ejercer tus derechos.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Responsable del tratamiento",
        body: [
          "El responsable es LINFOVIT, identificado con los datos de contacto publicados en el footer de esta tienda. Para asuntos de privacidad puedes escribir al correo indicado en la sección de contacto.",
          "Esta política se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y las normas que los modifiquen o sustituyan.",
        ],
      },
      {
        title: "2. Datos que recolectamos",
        body: [
          "Datos de identificación y contacto: nombre completo, correo electrónico y número de celular.",
          "Datos de entrega: departamento, ciudad, dirección e información adicional de entrega que decidas incluir.",
          "Datos de la compra: productos, valores, estado del pedido, número de guía y novedades de entrega.",
          "Datos técnicos y de navegación: dirección IP, agente de usuario, páginas visitadas, parámetros de campaña (UTM) y eventos de uso, únicamente cuando otorgas tu consentimiento para analítica.",
          "No solicitamos ni almacenamos datos de tarjetas bancarias. El procesamiento del pago lo realiza Mercado Pago bajo sus propias políticas de seguridad.",
        ],
      },
      {
        title: "3. Finalidades",
        body: [
          "Gestionar el pedido: validar el pago, preparar el despacho, entregar el producto y atender garantías o devoluciones.",
          "Comunicarnos contigo sobre el estado de tu compra, incidencias de entrega y soporte.",
          "Cumplir obligaciones legales, contables, tributarias y de protección al consumidor.",
          "Medir el desempeño de la tienda y de nuestras campañas publicitarias, con datos agregados o seudonimizados y solo con tu autorización para cookies analíticas.",
          "Enviar comunicaciones comerciales únicamente si otorgas una autorización separada. Puedes revocarla en cualquier momento.",
        ],
      },
      {
        title: "4. Encargados y transferencias",
        body: [
          "Compartimos la información estrictamente necesaria con proveedores que nos ayudan a operar la tienda: Mercado Pago (procesamiento de pagos), proveedor de correo transaccional, servicios de alojamiento y transporte de mercancía.",
          "Estos terceros tratan los datos por cuenta de LINFOVIT o como responsables independientes, según sus propias políticas. No vendemos ni alquilamos bases de datos personales.",
        ],
      },
      {
        title: "5. Conservación y seguridad",
        body: [
          "Conservamos los datos durante el tiempo necesario para cumplir las finalidades y las obligaciones legales aplicables. Los registros de pedidos y pagos pueden conservarse por los plazos contables y tributarios.",
          "Aplicamos medidas razonables de seguridad administrativa y técnica: acceso restringido al panel, contraseñas cifradas, sesiones autenticadas y validación de pagos contra la API de Mercado Pago. Ningún sistema es absolutamente infalible; si ocurre un incidente relevante, actuaremos conforme a la ley.",
        ],
      },
      {
        title: "6. Tus derechos",
        body: [
          "Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, solicitar prueba de la autorización, ser informado sobre el uso de tus datos y revocar la autorización, salvo cuando exista un deber legal de conservarlos.",
          "Escribe a nuestro correo de contacto indicando tu nombre, documento de identidad, petición concreta y datos de contacto. Responderemos dentro de los plazos legales.",
        ],
      },
      {
        title: "7. Cookies y analítica",
        body: [
          "La tienda funciona con cookies necesarias para el carrito, la sesión y la seguridad. Las cookies de analítica y publicidad solo se activan si aceptas en el aviso de consentimiento.",
          "Puedes borrar las cookies desde tu navegador y cambiar de decisión eliminando los datos del sitio. Si rechazas la analítica, la tienda sigue funcionando con normalidad.",
        ],
      },
    ],
  },
  {
    slug: "tratamiento-datos",
    title: "Tratamiento de datos personales",
    intro:
      "Autorización y condiciones específicas para el tratamiento de tus datos personales al comprar en LINFOVIT.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Autorización",
        body: [
          "Al completar el checkout y marcar la casilla de autorización, otorgas tu consentimiento previo, expreso e informado para que LINFOVIT trate tus datos personales con las finalidades descritas en la política de privacidad.",
          "La autorización para marketing es independiente y opcional. No autorizarla no impide completar tu compra.",
        ],
      },
      {
        title: "2. Datos solicitados y datos sensibles",
        body: [
          "Solicitamos únicamente datos necesarios para procesar y entregar el pedido. No solicitamos información sobre tu estado de salud, diagnósticos, medicamentos ni datos biométricos.",
          "Si en las notas de entrega incluyes información de salud u otros datos sensibles, lo haces bajo tu responsabilidad. Te recomendamos limitarte a indicaciones logísticas.",
        ],
      },
      {
        title: "3. Canales de atención",
        body: [
          "Para consultas, reclamos o solicitudes relacionadas con tus datos, escribe al correo de contacto publicado en la tienda e indica el número de pedido cuando aplique.",
          "También puedes presentar una reclamación ante la Superintendencia de Industria y Comercio una vez agotado el trámite directo con LINFOVIT.",
        ],
      },
      {
        title: "4. Vigencia",
        body: [
          "Esta política rige desde su publicación. Los cambios sustanciales se informarán en la tienda. Las bases de datos se conservarán mientras subsistan las finalidades y los plazos legales.",
        ],
      },
    ],
  },
  {
    slug: "terminos",
    title: "Términos y condiciones",
    intro:
      "Condiciones aplicables a la compra de LINFOVIT a través de esta tienda. Al realizar un pedido aceptas estos términos.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Naturaleza del producto",
        body: [
          "LINFOVIT es una fórmula botánica líquida de 60 ml presentada como producto de bienestar y autocuidado. No es un medicamento y no está destinada a diagnosticar, tratar, curar ni prevenir enfermedades.",
          "La información de la tienda es educativa y no sustituye la valoración de un profesional de la salud. No excedas la dosis indicada: 30 gotas (1 ml), tres veces al día.",
          "El producto está dirigido a personas mayores de edad. Consulta a un profesional antes de usarlo si estás embarazada, en lactancia, tomas medicamentos o tienes una condición médica.",
        ],
      },
      {
        title: "2. Precios y disponibilidad",
        body: [
          "Los precios se expresan en pesos colombianos (COP) y pueden cambiar sin previo aviso. El precio aplicable es el que se muestra al momento de confirmar el pedido.",
          "Cuando mostramos un precio de referencia para un pack, corresponde a la suma de comprar esas unidades por separado en la misma tienda. No creamos precios anteriores ficticios.",
          "La disponibilidad se valida contra el inventario. Si un producto se agota después de tu compra y antes del despacho, te contactaremos para ofrecerte una solución o el reembolso.",
        ],
      },
      {
        title: "3. Pagos",
        body: [
          "Los pagos se procesan a través de Mercado Pago Colombia. Al finalizar la compra serás dirigido a su entorno seguro. No almacenamos datos de tarjetas.",
          "El pedido se considera pagado únicamente cuando Mercado Pago reporta el pago como aprobado y el servidor lo valida. Los estados pendientes no generan despacho.",
          "Si el pago es rechazado, no se realiza el cobro y puedes intentarlo con otro medio. Si ves un cobro que no reconoces, contáctanos de inmediato.",
        ],
      },
      {
        title: "4. Envíos y entregas",
        body: [
          "Realizamos envíos a los departamentos y ciudades habilitados en el checkout. El costo y el tiempo estimado se muestran antes de pagar.",
          "Los tiempos son estimados y pueden variar por condiciones del transportador, clima o fuerza mayor. La dirección es responsabilidad del comprador; si hay errores, podemos cobrar un nuevo envío.",
        ],
      },
      {
        title: "5. Devoluciones, garantía y reversión",
        body: [
          "Tienes derecho a la reversión del pago en las condiciones y plazos de la Ley 1480 de 2011. Consulta la política de cambios y devoluciones.",
          "Los productos con defectos de calidad están cubiertos por la garantía legal. Conserva el producto, el empaque y el comprobante para gestionar la reclamación.",
        ],
      },
      {
        title: "6. Propiedad intelectual y uso del sitio",
        body: [
          "La marca, los textos, las fotografías y los elementos gráficos de la tienda son de propiedad de LINFOVIT o se usan con autorización. No está permitido reproducirlos con fines comerciales sin consentimiento.",
          "El uso indebido del sitio, intentos de fraude o manipulación de precios y pedidos puede dar lugar a las acciones legales correspondientes.",
        ],
      },
      {
        title: "7. Ley aplicable",
        body: [
          "Estos términos se rigen por la legislación colombiana. Cualquier controversia se someterá a las autoridades competentes y a los mecanismos de protección al consumidor.",
        ],
      },
    ],
  },
  {
    slug: "cambios-devoluciones",
    title: "Cambios y devoluciones",
    intro:
      "Queremos que tu compra sea clara. Estas son las condiciones para cambios, devoluciones, garantía y reversión del pago.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Reversión del pago",
        body: [
          "En compras a distancia tienes derecho a solicitar la reversión del pago dentro de los cinco (5) días hábiles siguientes a la entrega, conforme al artículo 47 de la Ley 1480 de 2011, siempre que devuelvas el producto en las condiciones señaladas por la ley.",
          "Para ejercerlo, escríbenos con tu número de pedido y el motivo. Te indicaremos cómo devolver el producto. Los costos de devolución se rigen por la normativa aplicable.",
        ],
      },
      {
        title: "2. Condiciones del producto",
        body: [
          "El producto debe devolverse sin uso, con el precinto y empaque en buen estado, junto con el comprobante cuando sea posible. Por razones de higiene y seguridad, los frascos abiertos o usados pueden no ser aptos para reversión, salvo que presenten un defecto de calidad.",
          "Una vez recibido y verificado, procesaremos la devolución o el reembolso por el mismo medio de pago, dentro de los plazos legales. Los tiempos bancarios pueden variar.",
        ],
      },
      {
        title: "3. Producto defectuoso o incorrecto",
        body: [
          "Si recibes un producto defectuoso, derramado, vencido o diferente al pedido, contáctanos dentro de los cinco (5) días siguientes a la entrega y adjunta fotos del producto y del empaque.",
          "Asumiremos el costo de recolección y reposición cuando se confirme la falla. La garantía legal no limita tus derechos como consumidor.",
        ],
      },
      {
        title: "4. Cómo iniciar el proceso",
        body: [
          "Escribe al correo de contacto con el asunto “Cambio o devolución” e incluye: número de pedido, nombre, celular, motivo y fotos si aplica.",
          "Te responderemos con las instrucciones y el número de radicado. No envíes productos sin autorización previa, para evitar pérdidas en tránsito.",
        ],
      },
    ],
  },
  {
    slug: "envios",
    title: "Política de envíos",
    intro:
      "Información sobre costos, tiempos de despacho, cobertura y rastreo de los pedidos LINFOVIT.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Cobertura y costo",
        body: [
          "Enviamos a los departamentos y ciudades habilitados en el checkout. El costo se calcula automáticamente antes de pagar.",
          "Actualmente ofrecemos envío sin costo a toda Colombia. Cualquier cambio se informará en el checkout antes de confirmar el pago; nunca cobraremos un valor distinto al mostrado.",
        ],
      },
      {
        title: "2. Despacho y entrega",
        body: [
          "Preparamos los pedidos pagados desde Bogotá en un plazo de 1 a 2 días hábiles. Los tiempos de transporte varían entre 1 y 6 días hábiles según el destino; las zonas de difícil acceso pueden tardar más.",
          "Los pedidos se despachan únicamente después de la confirmación del pago por parte de Mercado Pago. Los pedidos con pago pendiente no se alistan.",
        ],
      },
      {
        title: "3. Rastreo",
        body: [
          "Cuando tu pedido sea despachado, registraremos el número de guía y, cuando el transportador lo permita, un enlace de rastreo. Podrás verlo en la página de tu pedido, accesible desde el correo de confirmación.",
        ],
      },
      {
        title: "4. Dirección incorrecta o ausente",
        body: [
          "Verifica tus datos antes de pagar. Si el transportador no puede entregar por dirección incorrecta, ausencia prolongada o rechazo del paquete, el pedido puede regresar a bodega.",
          "En ese caso te contactaremos para coordinar un nuevo envío, que puede generar un costo adicional, o el reembolso del producto sin el valor del envío ya prestado, conforme a la ley.",
        ],
      },
      {
        title: "5. Novedades y pérdida",
        body: [
          "Si el paquete aparece como entregado y no lo recibiste, escríbenos dentro de los cinco (5) días siguientes para iniciar la investigación con el transportador.",
          "Si se confirma la pérdida, repondremos el producto o reembolsaremos el valor pagado.",
        ],
      },
    ],
  },
  {
    slug: "fabricante",
    title: "Información del fabricante",
    intro:
      "Datos de elaboración y trazabilidad del producto. Esta información debe validarse documentalmente antes de su comercialización.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Fabricante y país de elaboración",
        body: [
          "LINFOVIT se presenta como un producto elaborado en Colombia. Los datos completos del fabricante, planta de producción y responsable de la comercialización deben incorporarse aquí una vez verificados los documentos correspondientes.",
          "Mientras esa verificación no esté completa, la tienda muestra esta información como pendiente y no afirma certificaciones que no pueda demostrar.",
        ],
      },
      {
        title: "2. Trazabilidad y lote",
        body: [
          "Cada frasco debe incluir lote y fecha de vencimiento. Conserva el envase para cualquier consulta o reclamación.",
          "Las materias primas botánicas deben contar con especificaciones de calidad, identificación y proveedores documentados. La información detallada se encuentra en los registros internos del fabricante.",
        ],
      },
      {
        title: "3. Información pendiente",
        body: [
          "Registro sanitario, clasificación del producto, instalaciones y demás datos regulatorios: pendientes de verificación documental antes de publicar afirmaciones específicas.",
          "Si detectas una inconsistencia en la información del producto, escríbenos para corregirla.",
        ],
      },
    ],
  },
  {
    slug: "informacion-sanitaria",
    title: "Información sanitaria",
    intro:
      "LINFOVIT es un producto botánico de bienestar. Aquí encontrarás su clasificación, precauciones y la información que falta verificar.",
    updated: "Noviembre de 2026",
    sections: [
      {
        title: "1. Clasificación",
        body: [
          "LINFOVIT se comercializa como producto de bienestar de origen botánico, no como medicamento. No sustituye un diagnóstico, tratamiento o medicamento prescrito.",
          "La clasificación sanitaria aplicable y el registro o notificación correspondiente deben confirmarse documentalmente antes de la comercialización. La tienda no declara un número de registro que no haya sido verificado.",
        ],
      },
      {
        title: "2. Modo de uso y dosis",
        body: [
          "La dosis indicada en el etiquetado aprobado es de 30 gotas (1 ml), tres veces al día. No excedas la dosis indicada. Agita antes de usar y conserva el frasco en lugar fresco y seco, protegido de la luz.",
          "Mantén el producto fuera del alcance de los niños. No lo uses si presentas alergia a alguno de sus ingredientes.",
        ],
      },
      {
        title: "3. Precauciones",
        body: [
          "Consulta a un profesional de la salud antes de usarlo si estás embarazada o en período de lactancia, si tomas medicamentos, si tienes una enfermedad crónica o si estás en tratamiento.",
          "Algunos ingredientes botánicos pueden interactuar con medicamentos. No suspendas ni modifiques un tratamiento por este producto.",
          "Si presentas síntomas que persisten, empeoran o generan molestias, suspende el uso y busca atención profesional. La hinchazón puede tener causas que requieren evaluación médica.",
        ],
      },
      {
        title: "4. Reporte de novedades",
        body: [
          "Si presentas una reacción adversa o una inconformidad con el producto, escríbenos con el lote y la fecha de compra para registrar el caso y orientarte.",
          "También puedes reportar eventos adversos ante las autoridades sanitarias competentes cuando corresponda.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}
