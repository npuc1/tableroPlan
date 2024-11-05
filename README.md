# Disclaimer

Este es el proyecto, aún en construcción, del futuro Tablero de Reporte del Plan de Acción para fortalecer los procesos de contrataciones públicas en materia de adquisiciones, arrendamientos y servicios.
Para todos los archivos incluidos relacionados con la imagen e información del Sistema Nacional Anticorrupción consulte la normatividad vigente aplicable al Sistema Nacional Anticorrupción. Para el desarrollo informático incluido, aplica la licencia incluida.

# .env

Se deben agregar las credenciales generadas a través de la inicialización de una aplicación en Auth0. Para más información visite: https://auth0.com/docs/quickstart/spa/react/interactive

# 0Auth app data

Los roles, así como los estados que pueden ser editados por cada usuario deben ser asignados directamente en el dashboard de 0Auth. De manera adicional, se tiene que agregar el siguiente trigger personalizado al post login para el retrieval de la información, antes de la emisión del token:

exports.onExecutePostLogin = async (event, api) => {
  if (event.user.app_metadata) {
    api.idToken.setCustomClaim(`app_metadata`, event.user.app_metadata);
    api.accessToken.setCustomClaim(`app_metadata`, event.user.app_metadata);
  }
};