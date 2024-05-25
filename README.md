# Frontend | Plataforma iot

<div style="text-align: center">
    <img src="https://academy.dignal.com/wp-content/uploads/2023/01/dignal_academy_logo_site.png" width="400" alt="Dignal Academy"/>
</div>

## Contenido

Este repositorio contiene el frontend de nuestra plataforma iot, diseñada con vue3 y vuetify.

## Uso

- Para iniciar debes clonar este repositorio en tu equipo por medio del siguiente comando de git:
- Si eres usuario windows debes clonar esta carpeta dentro de la raíz del WSL.

```
git clone git@github.com:Dignal-Electronics/iot-front-2024.git
```

- El proyecto debe ser levantado usando docker, para ello primero debemos de instalar las dependencias usando el comando `npm install`:

```
docker compose -f .docker/compose.yaml run node npm install
```

- Después de instalar las dependencias debemos levantar el contendor, el cual ya ejecutará de manera interna el comando `npm run dev`:

```
docker compose -f .docker/compose.yaml up -d
```
