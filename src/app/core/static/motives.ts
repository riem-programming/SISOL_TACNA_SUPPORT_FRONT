export const MOTIVES = [
  { label: 'Sin especificar', value: 'sin_especificar' },
  { label: 'CAMBIO DE ESPECIALIDAD / SERVICIO', value: 'cambio_de_especialidad_servicio' },
  { label: 'CAMBIO DE MEDICO', value: 'cambio_de_medico' },
  { label: 'DEMORA EN LA ATENCION', value: 'demora_en_la_atencion' },
  { label: 'ERROR DEL PACIENTE', value: 'error_del_paciente' },
  { label: 'ERROR DEL SERVICIO DE CAJA', value: 'error_del_servicio_de_caja' },
  { label: 'FALLO DEL SISTEMA', value: 'fallo_del_sistema' },
  { label: 'FALTA DE ESPECIALISTAS', value: 'falta_de_especialistas' },
  {
    label: 'MAL INGRESO DE DATOS PERSONALES, ESPECIALIDAD Y/O PRODUCTO',
    value: 'mal_ingreso_de_datos_personales_especialidad_y_o_producto',
  },
  { label: 'MALA ATENCION DEL MEDICO TRATANTE', value: 'mala_atencion_del_medico_tratante' },
  { label: 'MALA ENTREGA DE DATOS', value: 'mala_entrega_de_datos' },
  { label: 'MALA IMPRESIÓN DE DOCUMENTO DE VENTA', value: 'mala_impresion_de_documento_de_venta' },
  {
    label: 'MALA INFORMACION DE PRECIOS Y/O PRODUCTOS',
    value: 'mala_informacion_de_precios_y_o_productos',
  },
  {
    label: 'MALA INFORMACION PROPORCIONADA AL AREA USUARIA',
    value: 'mala_informacion_proporcionada_al_area_usuaria',
  },
  { label: 'MALA ORIENTACION EN CAJA', value: 'mala_orientacion_en_caja' },
  { label: 'MALA ORIENTACION EN INFORMES', value: 'mala_orientacion_en_informes' },
  { label: 'NO ENCUENTRA MEDICO TRATANTE', value: 'no_encuentra_medico_tratante' },
];

export function motiveToLabel(value: string): string {
  return MOTIVES.find((_) => _.value === value)?.label ?? '';
}

export const searchMotives = (value: string) => {
  if (!value || value.trim() === '') {
    return MOTIVES;
  }

  const search = value.trim().toLowerCase();

  return MOTIVES.filter((motive) => motive.label.toLowerCase().includes(search));
};
