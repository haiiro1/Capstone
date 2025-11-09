## Resumen

Este notebook implementa un pipeline completo de entrenamiento y despliegue de un modelo MobileNetV3 Small para clasificación de enferemendades o estado de las hojas de tomate. Este flujo abarca:

  * Configuración de parámetros globales (tamaño de imagen, batch, épocas, paths de datos y caché)
  * Ajustes de recursos de hardware (GPU, mixed precision).
  * Construcción eficiente de datasets de entrenamiento y validación desde una estructura de carpetas (train/ y val/), con chaché y prefetch
  * Definición de un mapeo de clases de inglés a español, validando que el mapeo cubre exactamente las clases presentes en el dataset.
  * Creación y entrenamiento de un modelo basado en MobileNetV3Small preentrenado con ImageNet, con:
      * Fase 1: entrenamiento únicamente de la "cabeza" (clasificador superior)
      * Fase 2: fine-tuning liberando las capas convolucionales (excepto BatchNormalization).
  * Guardado del modelo y del mapeo de clases bilingüe en disco para uso posterior.
  * Definición de utilidades de predicción (cargar imagen, preprocesar, predecir, decodificar etiqueta en español) y ejemplo de uso.

## Configuración de hiperparámetros y paths

Variables deifnidas:

  * IMG_SIZE = (224, 224): Tamaño de entrada de las imágenes (alto, ancho) compatible con MobileNetV3 Small.
  * BATCH = 16: Tamaño de batch para el tf.data.Dataset.
  * EPOCHS_HEAD = 15: Número de épocas para la fase 1 (entrenamiento de la cabeza del modelo).
  * EPOCHS_FT = 10: Número de épocas para la fase 2 (fine-tuning).
  * DATA_DIR = 'tomato': Directorio raíz donde se encuentra el dataset
  * CACHE_TRAIN = "temp/train.cache": Ruta del archivo de caché para el dataset de entrenamiento.
  * CACHE_VAL = "temp/val.cache": Ruta del archivo de caché para el dataset de validación.
  * LIMIT_THREADS = True: Flag para limitar hilos de ejecución de tf.data, útil para reproducibilidad o para evitar saturar CPU.
  * USE_MIXED_PRECISION = False: Flag para activar o no mixed precision (float16 + float32) cuando se dispone de GPU compatible.

Función dentro del flujo: Centraliza la configuración del experimento y de los recursos, permitiendo ajustar fácilmente:

  * Complejidad del entrenamiento (épocas, batch).
  * Estructura de archivos de datos.
  * Opciones de optimización y rendimiento (mixed precision, threads).

## Detección de GPU y configuración de memoria/mixed precision

Operaciones realizadas:

  1. gpus = tf.config.list_logical_devices('GPU'): Obtiene la lista de dispositivos lógicos GPU disponibles para TensorFlow.
  2. Bucle sobre gpus:
     * Intenta establecer tf.config.experimental.set_memory_growth(g, True) para cada GPU: Esto permite que TensorFlow vaya reservando memoria GPU bajo demanda, evitando acaparar toda la memoria desde el inicio.
  3. Activación opcional de mixed precision:
     * Si USE_MIXED_PRECISION es True y hay al menos una GPU:
         *Importa mixed_precision desde tensorflow.keras
         *Establece la política global con mixed_precision.set_global_policy('mixed_float16').

Función dentro del flujo:
Configura el entorno de ejecución en función del hardware disponible:
    * Asegura un uso de memoria GPU más flexible.
    * Permite, opcionalmente, entrenar con mixed precision para acelerar el entrenamiento y reducir consumo de memoria cuando la GPU lo soporta.

## Construcción del dataset, caché y optimización de tf.data

  1. Creación de datasets:
    * train_ds = tf.keras.utils.image_dataset_from_directory(...)
    * Lee imágenes desde os.path.join(DATA_DIR, 'train').
    * Parámetros:
        * image_size = IMG_SIZE: redimensiona imágenes a 224×224.
        * batch_size = BATCH: tamaño de lote 16.
        * label_mode = 'int': genera etiquetas enteras (índices de clase).
        * shuffle = True: mezcla las muestras de entrenamiento.
    * Devuelve un tf.data.Dataset de tuplas (imagen, etiqueta).

  2 .val_ds = tf.keras.utils.image_dataset_from_directory(...)
    * Similar al anterior, pero usando el directorio val y shuffle = False para mantener orden estable en validación.

(En el código se infiere, aunque no se vea completo en el snippet, que se obtienen también cosas como class_names_en = train_ds.class_names o se usa posteriormente una lista equivalente; de ahí se alimenta el mapeo de clases en la celda siguiente.)

Caché y prefetch:

   * train_ds = train_ds.cache(CACHE_TRAIN)
   * val_ds = val_ds.cache(CACHE_VAL)
      * Activan una caché (en archivo) para evitar recargar las imágenes desde disco en cada época, acelerando el entrenamiento.
   * train_ds = train_ds.prefetch(1)
   * val_ds = val_ds.prefetch(1)
     * Habilitan prefetching de 1 batch por adelantado, solapando lectura/preprocesamiento con la ejecución en GPU/CPU.

Limitación de hilos (opcional):

  * Si LIMIT_THREADS es True:
  
  Se crea un objeto tf.data.Options() y se configuran:
  
     * opt.threading.private_threadpool_size = 1
      
     * opt.threading.max_intra_op_parallelism = 1
      
     * opt.experimental_optimization.map_parallelization = False
  
  Se aplican estas opciones:
  
    * train_ds = train_ds.with_options(opt)
    
    * val_ds = val_ds.with_options(opt)

Función dentro del flujo:
  * Esta celda construye la tubería de datos:
    * Lee, etiqueta y agrupa las imágenes en batches.
    * Optimiza el I/O mediante caché y prefetch.
    * Permite controlar el nivel de paralelismo para mejorar reproducibilidad y comportamiento en entornos con recursos limitados.

## Definición y validación del mapeo de clases EN -> ES:

Sección “CLASES Y MAPEO”:

  1. Definición de CLASS_MAP_ES (diccionario):
  
      * Claves: nombres de clases en inglés (por ejemplo "Tomato___Bacterial_spot").
  
      * Valores: traducciones descriptivas en español (por ejemplo "Mancha bacteriana").
  
  2. Validación de cobertura:
  
      * missing = [c for c in class_names_en if c not in CLASS_MAP_ES]: Lista de clases presentes en el dataset (class_names_en) que no tienen traducción definida en el diccionario.
  
      * extra = [k for k in CLASS_MAP_ES if k not in class_names_en]: Lista de claves en CLASS_MAP_ES que no aparecen en el dataset.
  
      * assert not missing, f"Faltan traducciones en CLASS_MAP_ES: {missing}": Lanza un error si falta alguna traducción.
  
      * Si extra no está vacío, se imprime una advertencia con las entradas sobrantes.
  
  3. Construcción del vector índice→etiqueta ES:
  
      * IDX2ES = [CLASS_MAP_ES[c] for c in class_names_en]: Genera una lista donde la posición i corresponde a la etiqueta en español de la clase con índice i en el dataset.
  
      * num_classes = len(class_names_en): Número total de clases.
  
      * Impresiones de control:
  
        * print("Clases (EN):", class_names_en)
  
        * print("Clases (ES):", IDX2ES)

Función dentro del flujo:

  * Garantiza que el mapeo bilingüe está completo y consistente con las clases reales del dataset.
  
  * Crea la estructura IDX2ES que luego se usa para decodificar las predicciones en términos legibles en español.
  
  * Obtiene el número de clases (num_classes) para configurar la capa de salida del modelo

## Definición del modelo MobileNetV3 Small, entrenamiento y fine-tuning:

 1. Definición del a base preentrenada:
    * Se carga MobileNetV3Small sin la capa fully-connected superior (include_top=False) usando pesos preentrenados en ImageNet.

    * base.trainable = False congela todas las capas de la base para la fase 1.

    * preprocess referencia la función de preprocesamiento estándar de MobileNetV3.

2. Definición de la entrada y pipeline de datos/augmentation:

    * Entrada: tensor de imágenes RGB de 224×224.

    * Bloque de data augmentation en tiempo de entrenamiento:

    * Flip horizontal aleatorio.

    * Pequeña rotación aleatoria.
    
    * Zoom aleatorio.
    
    * Preprocesamiento en línea con MobileNetV3 (preprocess).
    
    * Paso por la base convolucional (base).
    
    * GlobalAveragePooling2D: agrega espacialmente las características.
    
    * Dropout(0.2): regularización para evitar sobreajuste.
    
    * Dense(256, relu): capa densa intermedia.
    
    * Dense(num_classes, softmax): capa de salida para clasificación multiclase.
    
    * Se construye el modelo Keras final model.
      
 3. Fase 1: Entrenamiento del head:

    * Compilación:

      * Optimizador Adam con learning rate 1e-3.

      * Pérdida: SparseCategoricalCrossentropy (etiquetas enteras).

      * Métrica: accuracy.

    * Callbacks:

      * EarlyStopping sobre val_loss con patience=1, restaurando los mejores pesos.

      * ReduceLROnPlateau para reducir el learning rate si val_loss no mejora.

    * Entrenamiento:

      * Se entrena solo la cabeza (las capas de base siguen congeladas).

      * Se ejecuta hasta EPOCHS_HEAD o hasta que EarlyStopping detenga el proceso.
     
4. Fase 2: Fine-tuning de la base (excepto BatchNormalization):

  * Se recorre base.layers:

      * Todas las capas que no son BatchNormalization se marcan como trainable = True.

      * Las capas BatchNormalization quedan congeladas para mantener estables las estadísticas de normalización.

  * Se recompila el modelo:

      * Learning rate más bajo (1e-4) adecuado para fine-tuning.

  * Nuevos callbacks (cbs_ft) similares a los de la fase 1 (sin min_lr explícito).

  * Se entrena nuevamente, esta vez ajustando tanto la cabeza como parte de la base convolucional, refinando el modelo para el dominio específico de las hojas de tomate.

5. Evaluación final:
   
  * Evalúa el modelo final sobre el conjunto de validación.

  * Imprime la pérdida y exactitud alcanzadas.
    
Función dentro del flujo:
  * Esta celda encapsula todo el proceso de definición y entrenamiento del modelo:
  
  * Reutilización de MobileNetV3 entrenado en ImageNet.
  
  * Ajuste progresivo para el problema específico mediante dos fases (head + fine-tuning).
  
  * Evaluación cuantitativa del rendimiento.

## Guardado del modelo y mapeo de clases

Acciones:

1. model.save('mobileNetV3Small.keras')

   * Guarda el modelo completo (arquitectura, pesos y configuración de entrenamiento) en formato Keras.

2. Guardado del mapeo de clases:

  * Crea/abre class_map_es.json con codificación UTF-8.
  
  * Escribe un diccionario con:
      
     * "class_names_en": lista de nombres de clase en inglés.
      
     * "class_names_es": lista IDX2ES con las etiquetas en español en el mismo orden.

  * ensure_ascii=False preserva acentos y caracteres especiales.
  
  * indent=2 genera un JSON legible.

Función dentro del flujo:
Prepara los artefactos necesarios para el despliegue:

  * Modelo entrenado listo para cargar en aplicaciones de inferencia.
  
  * Archivo JSON con mapeo bilingüe, para decodificar predicciones sin necesidad de reentrenar.
   
  
