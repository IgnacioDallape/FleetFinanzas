from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime

# Create PDF
doc = SimpleDocTemplate("Instructivo_FleetFinanzas.pdf", pagesize=letter,
                       rightMargin=0.75*inch, leftMargin=0.75*inch,
                       topMargin=0.75*inch, bottomMargin=0.75*inch)

styles = getSampleStyleSheet()
story = []

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=colors.HexColor('#1a6b3a'),
    spaceAfter=12,
    fontName='Helvetica-Bold'
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=colors.HexColor('#2BB89A'),
    spaceAfter=8,
    spaceBefore=12,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=10,
    spaceAfter=6,
    leading=14
)

# Title
story.append(Paragraph("INSTRUCTIVO FLEETFINANZAS", title_style))
story.append(Paragraph("Guia de uso para gestor de finanzas y costos de flota", styles['Italic']))
story.append(Spacer(1, 0.2*inch))

# Introduction
story.append(Paragraph("INTRODUCCION", heading_style))
intro_text = "FleetFinanzas es una plataforma integral para la gestion financiera y operativa de una empresa de logistica y transporte. Combina dos herramientas: <b>Flujo</b> para la planificacion financiera general, y <b>FleetCost</b> para el calculo de costos por viaje."
story.append(Paragraph(intro_text, body_style))
story.append(Spacer(1, 0.15*inch))

# FLUJO SECTION
story.append(Paragraph("SECCION 1: FLUJO (Planificacion Financiera)", heading_style))
story.append(Spacer(1, 0.05*inch))

story.append(Paragraph("1.1 Dashboard (Pantalla Principal)", heading_style))
dashboard_text = "Al ingresar a la aplicacion, la pantalla principal muestra:<br/>* <b>Metricas de saldo:</b> Disponible en caja, cobros pendientes, pagos vencidos<br/>* <b>Graficos:</b> Flujo de fondos acumulado (evolucion del saldo) y distribucion de pagos por categoria<br/>* <b>Recomendador:</b> Indica que pagos pueden realizarse con el disponible actual<br/>* <b>Simulador de cobros:</b> Permite simular el impacto de cobrar determinados clientes"
story.append(Paragraph(dashboard_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("1.2 Cobros (Receivables)", heading_style))
cobros_text = "Registra dinero que la empresa espera recibir de clientes:<br/>* <b>Nombre:</b> Identificacion del cliente o concepto<br/>* <b>Monto:</b> Cantidad a cobrar<br/>* <b>Fecha:</b> Cuando se espera recibir el dinero<br/>* <b>Tipo:</b> Forma de cobro (cheque, transferencia, efectivo)<br/>* <b>Estado:</b> Pendiente, Parcialmente cobrado, o Cobrado<br/><br/>Las retenciones (impuestos) se aplican automaticamente segun el tipo de cobro. Se puede endosar cheques (transferirlos a terceros)."
story.append(Paragraph(cobros_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("1.3 Pagos (Payables)", heading_style))
pagos_text = "Registra gastos y obligaciones de pago:<br/>* <b>Nombre:</b> Proveedor o concepto de gasto<br/>* <b>Monto:</b> Cantidad a pagar<br/>* <b>Fecha:</b> Cuando vence el pago<br/>* <b>Categoria:</b> Tipo de gasto (combustible, proveedores, salarios, etc.)<br/>* <b>Prioridad:</b> Alta/Normal/Baja (ayuda al recomendador)<br/>* <b>Estado:</b> Pendiente o Pagado<br/><br/>El recomendador prioriza pagos vencidos y con prioridad alta."
story.append(Paragraph(pagos_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("1.4 Costos Fijos", heading_style))
costos_fijos_text = "Gastos recurrentes automaticos (seguros, mantenimiento, servicios):<br/>* <b>Nombre:</b> Descripcion del gasto<br/>* <b>Monto:</b> Cantidad del gasto<br/>* <b>Frecuencia:</b> Diario, semanal, quincenal, mensual<br/>* <b>Categoria:</b> Clasificacion del gasto<br/>* <b>Dia del ciclo:</b> En que dia del mes/semana ocurre<br/><br/>Los costos fijos se incluyen automaticamente en el flujo de fondos para proyectar el saldo a futuro."
story.append(Paragraph(costos_fijos_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("1.5 YPF (Combustible)", heading_style))
ypf_text = "Gestion centralizada de combustible:<br/>* <b>Choferes:</b> Registra quien carga combustible<br/>* <b>Cargas:</b> Precio por litro, litros cargados, km recorridos, remito<br/>* <b>Deuda acumulada:</b> Dinero adeudado por combustible<br/><br/>Permite analizar consumo por chofer y ajustar precios segun mercado."
story.append(Paragraph(ypf_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("1.6 Unidades (Perfiles de camiones)", heading_style))
unidades_text = "Configura los costos fijos de cada vehiculo:<br/>* <b>Nombre/Patente:</b> Identificacion del camion<br/>* <b>Seguro, Mantenimiento, Aceite, Cubiertas:</b> Gastos mensuales<br/>* <b>Km base, Chofer por km, Precio de combustible:</b> Parametros para FleetCost<br/><br/>Estos datos se importan automaticamente en FleetCost para calcular costos por viaje."
story.append(Paragraph(unidades_text, body_style))
story.append(PageBreak())

# FLEETCOST SECTION
story.append(Paragraph("SECCION 2: FLEETCOST (Calculadora de viajes)", heading_style))
story.append(Spacer(1, 0.05*inch))

story.append(Paragraph("2.1 Calculadora de Costos Base", heading_style))
calc_text = "Define los costos operativos fijos de la empresa:<br/>* <b>Costos Indirectos (Mensual):</b> Gastos administrativos, alquiler oficina, etc.<br/>* <b>Costo Chofer (por km):</b> Lo que cuesta por km cada chofer<br/>* <b>Combustible (Precio por litro):</b> Precio vigente del diesel/nafta<br/><br/>Estos se convierten automaticamente a costo por km y se muestran en la barra de costos."
story.append(Paragraph(calc_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("2.2 Selector de Unidades", heading_style))
selector_text = "Si estan configuradas en Flujo, aparece un dropdown para cargar una unidad especifica. Esto llena automaticamente todos los parametros del viaje basandose en los costos del camion."
story.append(Paragraph(selector_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("2.3 Simulador de Viajes", heading_style))
viajes_text = "Calcula la rentabilidad de cada viaje:<br/>* <b>Viaticos (km):</b> Kilometros viajados (ida)<br/>* <b>Retorno:</b> Marcar si hay retorno sin carga (agrega km sin ingresos)<br/>* <b>Ingresos:</b> Flete, cascos, o dinero que se cobra por el viaje<br/>* <b>Peajes:</b> Gastos de rutas de peaje<br/>* <b>Combustible:</b> Si se cargo combustible en este viaje (litros reales)<br/>* <b>Chofer:</b> Pago directo al chofer (opcional)<br/><br/><b>Resultado:</b> Ganancia bruta, margen %, rentabilidad por km"
story.append(Paragraph(viajes_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("2.4 Historial de Viajes", heading_style))
historial_text = "Muestra todos los viajes registrados, agrupados por:<br/>* <b>Mes:</b> Agrupa por periodo para analisis mensual<br/>* <b>Chofer:</b> Muestra desempeño individual con rankings:<br/>&nbsp;&nbsp;- Quien genero mas dinero (ingresos totales)<br/>&nbsp;&nbsp;- Mejor margen porcentual (rentabilidad %)<br/>&nbsp;&nbsp;- Mejor consumo de combustible (L/100km)<br/>&nbsp;&nbsp;- Mas kilometros recorridos<br/><br/>Se pueden editar viajes o limpiar todos los datos."
story.append(Paragraph(historial_text, body_style))
story.append(PageBreak())

# GENERAL FEATURES
story.append(Paragraph("SECCION 3: Funcionalidades Generales", heading_style))
story.append(Spacer(1, 0.05*inch))

story.append(Paragraph("3.1 Autenticacion", heading_style))
auth_text = "Cada usuario tiene una cuenta con email y contraseña. Los datos se almacenan de forma segura en la nube. Al cerrar sesion, se pierden los datos locales del navegador."
story.append(Paragraph(auth_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("3.2 Cambio de Contraseña", heading_style))
cambio_text = "Disponible en la seccion de Ajustes (menu lateral). Permite cambiar la contraseña de forma segura. La contraseña anterior sera invalidada."
story.append(Paragraph(cambio_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("3.3 Exportar/Importar Datos", heading_style))
export_text = "En Ajustes, se pueden descargar los datos en formato JSON para respaldo, y cargar un archivo JSON anterior para restaurar datos."
story.append(Paragraph(export_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("3.4 Instalacion como App (PWA)", heading_style))
pwa_text = "<b>En iPhone (iOS):</b> Abre Safari, navega a la app, toca el icono Compartir, y selecciona 'Añadir a pantalla de inicio'.<br/><br/><b>En Android:</b> Abre Chrome, toca el menu, y selecciona 'Instalar aplicacion'.<br/><br/><b>En Windows/Mac:</b> Abre Chrome, haz clic en el icono de instalacion (esquina superior derecha de la barra de direcciones)."
story.append(Paragraph(pwa_text, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("3.5 Sincronizacion y Datos", heading_style))
sync_text = "Los datos se guardan automaticamente en la nube. Pueden accederse desde cualquier dispositivo con la misma cuenta. La aplicacion funciona offline: los cambios se sincronizaran cuando vuelva la conexion."
story.append(Paragraph(sync_text, body_style))
story.append(PageBreak())

# TIPS AND BEST PRACTICES
story.append(Paragraph("TIPS Y MEJORES PRACTICAS", heading_style))
story.append(Spacer(1, 0.05*inch))

story.append(Paragraph("Para Flujo:", heading_style))
tips_flujo = "* Actualiza los cobros pendientes regularmente (marcalos como cobrados cuando llegue el dinero)<br/>* Usa el recomendador para priorizar que pagar primero<br/>* Mantén costos fijos al dia para proyecciones precisas<br/>* Revisa el grafico de flujo mensualmente para tendencias"
story.append(Paragraph(tips_flujo, body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("Para FleetCost:", heading_style))
tips_fleet = "* Registra TODOS los viajes para analisis de rentabilidad confiables<br/>* Usa el selector de unidades para viajes en camiones especificos<br/>* Revisa el historial por chofer para identificar patrones de rentabilidad<br/>* Ajusta precios de flete segun el analisis de margenes<br/>* Monitorea consumo de combustible para detectar problemas mecanicos"
story.append(Paragraph(tips_fleet, body_style))
story.append(Spacer(1, 0.2*inch))

# FOOTER
fecha = datetime.now().strftime("%d de %B de %Y")
footer_text = f"Generado: {fecha}"
story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)))

# Build PDF
doc.build(story)
print("PDF creado exitosamente: Instructivo_FleetFinanzas.pdf")
