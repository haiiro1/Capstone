# 🌱 PlantGuard: Asistente Inteligente para el Cuidado de Plantas

*Una aplicación de diagnóstico de plantas basada en IA para el cuidado de cultivos, desarrollada como nuestro Proyecto de Capstone para Duoc UC.*

---

## 📌 Tabla de Contenidos

1.  [**Descripción del Proyecto**](#-descripción-del-proyecto)
2.  [**Funcionalidades Clave**](#-funcionalidades-clave)
3.  [**Stack Tecnológico**](#️-stack-tecnológico)
4.  [**Estado Actual**](#-estado-actual)
5.  [**El Equipo**](#-el-equipo)
6.  [**Guía para Desarrolladores**](#-guía-para-desarrolladores)

---

## 🌳 Descripción del Proyecto

PlantGuard es una aplicación web diseñada para asistir a agricultores y entusiastas de la jardinería en la **detección temprana de enfermedades y plagas** en plantas. Utilizando un modelo de Inteligencia Artificial, la aplicación analiza imágenes subidas por el usuario para ofrecer un diagnóstico rápido y confiable.

La **propuesta de valor innovadora** de PlantGuard es la integración de un sistema de **alertas climáticas en tiempo real**. Este sistema notifica a los usuarios sobre condiciones ambientales adversas —como heladas, olas de calor o lluvias intensas— permitiéndoles tomar acciones preventivas para proteger sus cultivos y plantas.

---

## ✨ Funcionalidades Clave

-   ✅ **Análisis de Imágenes con IA:** Sube una foto y obtén un diagnóstico instantáneo sobre la salud de tu planta.
-   ✅ **Alertas Climáticas:** Recibe información del clima en tiempo real directamente en tu panel de control.
-   ✅ **Historial de Análisis:** Lleva un registro de todas tus consultas para seguir la evolución de tus plantas a lo largo del tiempo.
-   ✅ **Gestión de Perfil de Usuario:** Personaliza tu información y tus preferencias de notificación.
-   ✅ **Autenticación Segura:** Sistema de registro e inicio de sesión para proteger la información de cada usuario.
-   ✅ **Interfaz Intuitiva y Responsiva:** Un diseño limpio y fácil de usar que funciona en cualquier dispositivo.

---

## 🛠️ Stack Tecnológico

Este proyecto combina tecnologías modernas para crear una solución robusta, escalable y de alto rendimiento.

| Área                | Tecnología                                   | Descripción                                                              |
| :------------------ | :------------------------------------------- | :----------------------------------------------------------------------- |
| **Frontend** | `React` `Vite` `TypeScript` `Bootstrap 5`    | Para una interfaz de usuario rápida, interactiva y segura.               |
| **Backend (API)** | `FastAPI` `Python`                           | Para una API de alto rendimiento, ideal para servir el modelo de IA.       |
| **Autenticación (API)** | `JWT (Tokens)` `Passlib`         | Manejo de registro, login y sesiones seguras mediante tokens JWT.       |
| **Base de Datos** | `PostgreSQL` `NeonDB`                        | Una base de datos relacional potente para gestionar usuarios y análisis. |
| **Modelo de IA** | `TensorFlow` (Red Neuronal Convolucional)    | Para el entrenamiento y la ejecución del modelo de visión por computador.  |
| **API Externa** | `OpenWeatherMap`                             | Para obtener los datos del clima en tiempo real.                         |
| **Despliegue** | `Vercel` (Frontend) y `Render` (Backend)     | Para un despliegue continuo y una infraestructura moderna en la nube.    |

---

## 📅 Estado Actual

Tras el primer mes de desarrollo, el proyecto ha alcanzado hitos importantes en su planificación y construcción. El enfoque actual está en finalizar el desarrollo del backend y comenzar a integrar el modelo de IA que ha estado en entrenamiento.

| Hito                                 | Estado      |
| :----------------------------------- | :---------- |
| ✅ **Definición y Planificación** | Completado  |
| ✅ **Diseño de Arquitectura y BPMN** | Completado  |
| ✅ **Desarrollo Frontend Completo** | Completado  |
| ✅ **Integración de API de Clima** | Completado  |
| 🚧 **Desarrollo Backend (API)** | En Progreso |
| 🚧 **Entrenamiento del Modelo de IA**| En Progreso |
| ⏳ **Pruebas de Integración** | Pendiente   |

---

## 👥 El Equipo

-   Ignacia Ciero
-   Joaquín Godoy
-   Alejandro Pimiento
-   Rena Valenzuela

---

Ha sido un primer mes de desarrollo intenso pero muy productivo, sentando bases sólidas tanto en la planificación como en la implementación. Tenemos muy buenas expectativas para la siguiente fase, donde nos enfocaremos en dar vida al modelo de Inteligencia Artificial y completar la integración de todos los componentes del sistema.

Eso es todo lo que respecta a nuestro proyecto para fines formativos. Pero, ¿y si quisieras ponerlo en marcha? ¡Para eso tenemos el siguiente punto!

---

## 🚀 Guía para Desarrolladores

Sigue estos pasos para levantar el entorno de desarrollo completo. Necesitarás tener **dos terminales abiertas**: una para el Backend y otra para el Frontend.

### **Prerrequisitos**

Antes de comenzar, asegúrate de tener instalado:
-   Node.js (v18 o superior)
-   Python (v3.10 o superior)
-   Git

### 1. Clonar el Repositorio

Primero, clona el proyecto desde GitHub a tu máquina local y entra en la carpeta principal.

```bash
git clone https://github.com/tu-usuario/plantguard.git
cd plantguard
```
---

### 2. Configurar y Levantar el Backend

#### 2.1 Navegar a la carpeta del backend

Ahora, vamos a preparar y encender el servidor.
```bash
cd backend
```

#### 2.2 Crear y activar un entorno virtual (Recomendado)

¡No perdamos las buenas costumbres! Esto crea un ambiente aislado para las dependencias de Python.
```bash
# Crear el entorno (solo se hace una vez)
python -m venv venv

# Activar el entorno (se hace cada vez que abres una nueva terminal)
# En Windows:
.\venv\Scripts\activate

# En macOS/Linux:
# source venv/bin/activate
```

#### 2.3 Instalar las dependencias
```bash
pip install -r requirements.txt
```

#### 2.4 Levantar el Backend

```bash
npm run dev
```

### 3. Configurar y Levantar el FrontEnd

#### 3.1 Navegar a la carpeta del frontend

```bash
cd ..
cd frontend
```

#### 3.2 Instalar las dependencias
Este comando leerá el archivo package.json e instalará todas las librerías de JavaScript necesarias.

```bash
npm install
```

#### 3.3 Levantar el servidor de desarrollo

```bash
npm run dev
```

### Verificación Final

✅ 4 Verificación Final
¡Y Listo! Ya deberías tener todo en marcha. Para verificar que todo funciona:

En tu Terminal 1 (Backend): Deberías ver los logs de Uvicorn indicando que el servidor está corriendo en http://127.0.0.1:8000.

En tu Terminal 2 (Frontend): Deberías ver los logs de Vite indicando que tu aplicación está disponible en http://localhost:5173.

En tu Navegador:

Abre http://localhost:5173.

Si todo esto funciona y carga la página Login, ¡Entonces el entorno de desarrollo está configurado correctamente!

**Con eso estarás listo para probar nuestra App, ¡Bienvenido a su fase de desarrollo!**
