# Servicio web de clasificación de Imágenes con MobileNetV3Small

## 1. Descripción general

Este servicio expone una API REST que:
  * Recibe una imágen (JPEG/PNG) vía POST /predict
  * Preprocesa la imagen de forma consistente con el entrenamiento del modelo MobileNetV3Small.
  * Ejecuta inferencia con un modelo Keras previamente entrenado (mobileNetV3Small.keras).
  * Devuelve las top-k predicciones con:
      * índice de clase
      * etiqueta en inglés
      * etiqueta en español (opcional, según idioma)
      * probabilidad
      * bloque de recomendaciones específico por clase (advice.json)
Además expone endpoints para:
  * listar las clases y sus etiquetas (GET /classes)
  * consultar recomendaciones por clase (GET /advice)
  * endpoint raíz de salud/diagnóstico (GET /)

## 2. Tecnologías y Dependencias

  * Lenguaje: Python 3
  * Framework web: FastAPI
  * Servidor ASGI: Uvicorn
  * ML / Deep Learning: TensorFlow + Keras
  * Procesamiento de imágenes: Pillow (PIL)
  * Otras librerías:
      * numpy para manejo de tensores
      * typing (List, Dict, Any) para anotaciones de tipos
      * json y os para carga de archivos de configuración.
  
## 3. Configuración Global y Constantes

  * Varaibles de entonrno: Antes de importar TensorFlow/Keras se definen variables de entorno para ajustar el comportamiento del runtime:

    ```python
    os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
    ```

     * CUDA_VISIBLE_DEVICES = "-1": fuerza el uso de CPU, desactivando GPU
     * TF_CPP_MIN_LOG_LEVEL = "2": suprime logs informativos y de warning, mostrando solo errores críticos

  * Rutas de archivos y parámetros globales

    ```python
    MODEL_PATH = "./mobileNetV3Small.keras"
    CLASS_MAP = "./class_map_es.json"
    ADVICE_PATH = "./advice.json"
    IMG_SIZE = (224, 224)
    TOP_K = 3
    LANG_DEF = "es"
    ALLOWED_MIMES = ["image/jpeg", "image/png"]
    ```

    * MODEL_PATH: ruta al modelo Keras entrenado.
    * CLASS_MAP: JSON con las etiquetas de clases en inglés/español
    * ADVICE_PATH: JSON con recomendaciones por clase
    * IMG_SIZE: tamaño al que se redimensionan las imágenes de entrada
    * TOP_K: número por defecto de predicciones a devolver
    * LANG_DEF: idioma por defecto para etiquetas ("es" o "en")
    * ALLOWED_MIMES: tipos MIME permitidos para los archivos subidos

* Configuración de threads TensorFlow

  ```python
  tf.config.threading.set_intra_op_parallelism_threads(1)
  tf.config.threading.set_inter_op_parallelism_threads(1)
  ```

    * Reduce el número de hilos internos de TensorFlow (útil en entornos con poca RAM/CPU) para evitar saturación de recursos.

## 4. Carga del Modelo y Validaciones

  * Carga del modelo

    ```python
    try:
    model = keras.models.load_model(MODEL_PATH)
    except Exception as e:
        raise RuntimeError(f"Error al cargar el modelo: {e}")
    ```
    * Se intenta cargar el modelo Keras desde MODEL_PATH.
    * Si falla, se lanza RuntimeError para evitar levantar el servicio en un estado inconsistente.

    Se obtiene el número de clases esperadas a partir de la capa de salida:

    ```python
    num_classes_model = int(model.output.shape[-1])
    ```
* Carga y validación de clases (EN/ES)

    ```python
    if not os.path.exists(CLASS_MAP):
        raise RuntimeError(f"No existe {CLASS_MAP}")
    ```
    * Valida la existencia del archivo class_map_es.json.
 
    ```python
    with open(CLASS_MAP, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    
    class_names_en: List[str] = mapping.get("class_names_en") or []
    class_names_es: List[str] = mapping.get("class_names_es") or []
    ```
    * Carga las listas de nombres de clases en inglés y español.
  Validaciones adicionales

  ```python
  if not class_names_en or not class_names_es:
    raise RuntimeError("class_map_es.json debe contener 'class_names_en' y 'class_names_es'.")

  if len(class_names_en) != len(class_names_es):
      raise RuntimeError("Longitudes distintas en EN vs ES.")
  
  if len(class_names_en) != num_classes_model:
      raise RuntimeError(f"Desalineación: salidas modelo={num_classes_model}, clases={len(class_names_en)}")
  ```
  * Se asegura que:
      * existan ambas listas
      * tengan la misma longitud
      * y que el número de clases coincida con la dimensión de salida del modelo

## 5. Carga de recomendaciones

  * Carga un diccionario donde la clave es el nombre de la clase en inglés (class_names_en) y el valor es un bloque de recomendación.

    ```python
    if not os.path.exists(ADVICE_PATH):
        raise RuntimeError(f"No existe {ADVICE_PATH} (JSON con recomendaciones).")
  
    with open(ADVICE_PATH, "r", encoding="utf-8") as f:
        CLASS_ADVICE: Dict[str, Dict[str, Any]] = json.load(f)
    ```
    
  * Validación de coherencia entre clases y recomendaciones
    ```python
    missing_advice = [c for c in class_names_en if c not in CLASS_ADVICE]
    extra_advice  = [k for k in CLASS_ADVICE.keys() if k not in class_names_en]
    
    if missing_advice:
        print(f"Aviso: faltan recomendaciones para clases: {missing_advice}")
    if extra_advice:
        print(f"Aviso: hay claves en advice.json que no están en el modelo: {extra_advice}")
    ```
    * missing_advice: clases del modelo que NO tienen recomendación asociada.
    * extra_advice: claves en advice.json que no corresponden a ninguna clase del modelo.
Nota: Esto no detiene la ejecución, solo loguea un aviso.

 * Función get_recomendation
   ```python
   def get_recomendation(label_en: str) -> Dict[str, Any]:
    # Devuelve bloque de recomendación. Fallback genérico si no hay entrada.
    return CLASS_ADVICE.get(
        label_en,
        {
            "title": label_en,
            "severity":"desconocida",
            "advice":[
                "Monitorear evolución de síntomas",
                "Mejorar ventilación y evitar mojado foliar",
                "Consultar asesoría técnica local si progresa"
            ]
        }
    )
   ```
   * Dado el nombre de clase en inglés (label_en), devuelve el bloque de recomendación correspondiente.
   * Si no existe entrada, devuelve un fallback genérico con título = nombre de la clase y recomendaciones estándar.

## 6. Preprocesamiento de imágenes

 * Función de preprocesamiento Keras
   ```python
   preprocess = keras.applications.mobilenet_v3.preprocess_input
   ```
   * Reutiliza el preprocesamiento estándar de MobileNetV3 (re-escalado, normalización, etc.).

* Función prepare_image
  ```python
  def prepare_image(pil_img: Image.Image) -> np.ndarray:
    pil_img = pil_img.convert("RGB").resize(IMG_SIZE)
    arr = keras.utils.img_to_array(pil_img)
    arr = np.expand_dims(arr, axis = 0)
    return preprocess(arr)
  ```
  * convert("RGB"): garantiza 3 canales de color.
  * resize(IMG_SIZE): redimensiona a 224×224 píxeles.
  * img_to_array: convierte la imagen en un numpy.ndarray.
  * expand_dims(axis=0): añade dimensión batch (shape (1, 224, 224, 3))
  * preprocess(arr): normaliza la imagen como espera MobileNetV3Small.

## 7. Fromato de salida de predicción

  * Función format_topk
    ```python
    def format_topk(probs: np.ndarray, top_k: int, lang: str) -> List[Dict[str, Any]]:
    k = int(max(1, min(top_k, probs.size)))
    idxs = np.argsort(probs)[-k:][::-1]
    out: List[Dict[str, Any]] = []
    for i in idxs:
        label_en = class_names_en[i]
        item: Dict[str, Any] = {
            "index": int(i),
            "label_en": label_en,
            "probability": float(probs[i]),
            "recomendation":get_recomendation(label_en)
        }
        if lang == "es":
            item["label_es"] = class_names_es[i]
        out.append(item)
    return out
    ```
    * probs: vector de probabilidades (salida del modelo, shape (num_classes,)).
    * top_k: número de predicciones a devolver (limitado entre 1 y probs.size).
    * lang:
        * "es": añade label_es
        * "en": solo incluye label_en

    Proceso
    * Determina k válido.
    * Ordena los índices de mayor a menor probabilidad
    * Construye para cada índice un diccionario con:
        * index: índice de clase.
        * label_en: nombre de la clase en inglés.
        * probability: probabilidad (float).
        * recomendation: bloque proveniente de get_recomendation.
        * label_es: solo si lang == "es"

## 8. Definición de la aplicación FastAPI

  ```python
  app = FastAPI(title = "MobileNetV3Small - Clasificador + Recomendaciones")
  ```
## 9. Endpoints de la API

  * GET / – Endpoint raíz (health / info)
    ```python
    @app.get("/")
    def home():
        return {
            "message": "Ok. Post imagen a /predict",
            "model_ outputs": num_classes_model,
            "img_size": IMG_SIZE,
            "top_k_defaults": TOP_K
        }
    ```

  Funcionalidad:
  * Verifica que el servicio está activo.
  * Entrega información básica:
      * message: texto informativo.
      * model_ outputs: cantidad de clases de salida del modelo.
      * img_size: tamaño de entrada esperado.
      * top_k_defaults: valor por defecto de TOP_K.
    
  Uso típico: chequeo de salud (healthcheck) por parte de orquestadores o monitorización.
        
 * GET /classes – Listado de clases
   
  ```python
  @app.get("/classes")
  def classes(lang:str = Query(LANG_DEF, pattern="^(es|en)$")):
      data = []
      for i, en in enumerate(class_names_en):
          row = {"index": i, "label_en":en}
          if lang == "es":
              row["label_es"] = class_names_es[i]
          data.append(row)
      return {"count": len(data), "lang": lang, "classes": data}
  ```
  * Parametros del query:
     * lang (string):
        * Valores permitidos: "es" o "en".
        * Por defecto: "es".
        * Validado mediante un patrón regex.

* GET /advice – Recomendaciones por clase
  ```python
  @app.get("/advice")
  def advice(label:str = Query(..., description = "Nombre exacto de clase en inglés (class_names_en)")):
      if label not in class_names_en:
          raise HTTPException(status_code=404, detail=f"Clase desconocida: {label}")
      idx = class_names_en.index(label)
      return {
          "index": idx,
          "label_en": label,
          "label_es": class_names_es[idx],
          "recomendation": get_recomendation(label)
  ```

    * Parámetros del query:
        * label (string, obligatorio):
           * Debe coincidir con una de las entradas de class_names_en.
    * Comportamiento:
        * Si la clase no existe, devuelve HTTP 404 con mensaje "Clase desconocida: <label>".
        * Si existe, responde con:
            * index: índice de la clase.
            * label_en: etiqueta en inglés.
            * label_es: etiqueta en español.
            * recomendation: bloque de recomendación asociado.

  * POST /predict – Clasificación de imagen

    ```python
    @app.post("/predict")
    async def predict(file: UploadFile = File(...), top_k: int = Query(TOP_K, ge = 1, le = 10), lang: str = Query(LANG_DEF, pattern="^(es|en)$")):
        if file.content_type not in ALLOWED_MIMES:
            raise HTTPException(status_code=415, detail = f"Tipo no soportado: {file.content_type}")
    
        try:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents))
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Archivo no es una imagen válida.")
        except Exception:
            raise HTTPException(status_code=400, detail="No se pudo leer la imagen.")
        
        x = prepare_image(img)
    
        try:
            probs = model.predict(x, verbose=0)[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en inferencia: {e}")
        
        return {
            "model_version": os.path.basename(MODEL_PATH),
            "top_k": int(top_k),
            "lang": lang,
            "predictions": format_topk(probs, top_k, lang),
            "disclaimer": "Siga regulaciones locales y etiquetas de productos; consulte asesoría técnica si es necesario."
        }
    ```
    *  Parámetros:
         * Body (multipart/form-data):
            * file: imagen a clasificar (tipo UploadFile)
         * Query params:
            * top_k (int):
                * Por defecto: TOP_K (3).
                * Validación: ge=1, le=10.
            * lang (string):
                * "es" o "en".
                * Por defecto: "es".

    * Validaciones iniciales de archivo:
        * Solo se aceptan image/jpeg y image/png.
        * Cualquier otro tipo retornará HTTP 415 Unsupported Media Type.

    * Lectura y carga de imagen:
        * Lee el contenido del archivo.
        * Intenta abrirlo con Pillow como imagen.
        * Maneja:
            * UnidentifiedImageError: archivo no es una imagen válida → HTTP 400.
            * Otros errores de lectura → HTTP 400.

    * Preprocesamiento y predicción:
        * Convierte la imagen en tensor de entrada mediante prepare_image.
        * Ejecuta model.predict.
        * Toma el primer vector ([0]) ya que el batch es de tamaño 1.
        * Ante errores de inferencia, lanza HTTP 500.

    * Respuesta:
        * Campos:
            * model_version: nombre del archivo de modelo usado (por trazabilidad).
            * top_k: valor de top-k utilizado en esta petición.
            * lang: idioma en que se devolvieron las etiquetas ("es"/"en").
            * predictions: lista de predicciones formateadas por format_topk.
            * disclaimer: mensaje de descargo de responsabilidad (uso informativo, no reemplaza asesoría técnica).
              
    * Ejemplo de respuesta:
      ```json
      {
        "model_version": "mobileNetV3Small.keras",
        "top_k": 3,
        "lang": "es",
        "predictions": [
          {
            "index": 0,
            "label_en": "Tomato___Early_blight",
            "label_es": "Tizón temprano",
            "probability": 0.82,
            "recomendation": {
              "title": "Tizón temprano",
              "severity": "alta",
              "advice": [
                "Eliminar hojas infectadas",
                "Aplicar fungicida recomendado",
                "Mejorar ventilación del cultivo"
              ]
            }
          },
          ...
        ],
        "disclaimer": "Siga regulaciones locales y etiquetas de productos; consulte asesoría técnica si es necesario."
      }

      ```

## 10. Manejo de errores

Tipos de erroes y códigos HTTP:
  * 400 Bad Request:
      * Imagen no válida (UnidentifiedImageError).
      * Fallos genéricos en la lectura del archivo.
  * 404 Not Found:
      * Clase desconocida en GET /advice.
  * 415 Unsupported Media Type:
      * Tipo MIME de archivo no permitido en POST /predict.
  * 500 Internal Server Error:
      * Errores en la inferencia del modelo (model.predict).
  * RuntimeError (en startup):
      * Problemas para cargar el modelo.
      * Falta/estructura incorrecta de class_map_es.json.
      * Falta de advice.json.
      
En caso de errores de startup (RuntimeError), el servicio no debería levantarse correctamente, permitiendo que el problema se detecte en fase de despliegue.

## 11. Ejecución del servicio

  ```python
  if __name__ == "__main__":
      uvicorn.run(app, host = "0.0.0.0", port  = 8000)
  ```

  * Permite ejectuar el servicio directamente:
  ```bash
  python app.py
  ```

 * Parámetros:
     * host="0.0.0.0": expone el servicio en todas las interfaces de red.
     * port=8000: puerto de escucha por defecto.
