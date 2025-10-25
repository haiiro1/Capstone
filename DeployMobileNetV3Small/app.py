import os
# Forzar CPU y silenciar logs antes de importar TF y Keras
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import io
import json
import uvicorn
from typing import List, Dict, Any
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from PIL import Image, UnidentifiedImageError
import tensorflow as tf
from tensorflow import keras

MODEL_PATH = "mobilenetv3small_model.keras"
CLASS_MAP = "./class_map_es.json"
ADVICE_PATH = "./advice.json"
IMG_SIZE = (224, 224)
TOP_K = 3
LANG_DEF = "es"
ALLOWED_MIMES = ["image/jpeg", "image/png"]

# Reducir hilos (RAM/CPU bajos)
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

app = FastAPI(title = "MobileNetV3Small - Clasificador + Recomendaciones")

# -----------------
# Carga del Modelo
# -----------------

try:
    model = keras.models.load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error al cargar el modelo: {e}")

num_classes_model = int(model.output.shape[-1])

# ---------------------
# Carga de clases EN/ES
# ---------------------

if not os.path.exists(CLASS_MAP):
    raise RuntimeError(f"No existe {CLASS_MAP}")

with open(CLASS_MAP, "r", encoding="utf-8") as f:
    mapping = json.load(f)

class_names_en: List[str] = mapping.get("class_names_en") or []
class_names_es: List[str] = mapping.get("class_names_es") or []

if not class_names_en or not class_names_es:
    raise RuntimeError("class_map_es.json debe contener 'class_names_en' y 'class_names_es'.")

if len(class_names_en) != len(class_names_es):
    raise RuntimeError("Longitudes distintas en EN vs ES.")

if len(class_names_en) != num_classes_model:
    raise RuntimeError(f"Desalineación: salidas modelo={num_classes_model}, clases={len(class_names_en)}")


# ------------------------
# Carga de recomendaciones
# ------------------------

if not os.path.exists(ADVICE_PATH):
    raise RuntimeError(f"No existe {ADVICE_PATH} (JSON con recomendaciones).")

with open(ADVICE_PATH, "r", encoding="utf-8") as f:
    CLASS_ADVICE: Dict[str, Dict[str, Any]] = json.load(f)

# Validación: avisar si faltan algunas clases o sobran claves

missing_advice = [c for c in class_names_en if c not in CLASS_ADVICE]
extra_advice  = [k for k in CLASS_ADVICE.keys() if k not in class_names_en]

if missing_advice:
    print(f"Aviso: faltan recomendaciones para clases: {missing_advice}")
if extra_advice:
    print(f"Aviso: hay claves en advice.json que no están en el modelo: {extra_advice}")

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

# ------------------------------------------
# Preprocesamiento idéntico al entrenamiento
# ------------------------------------------

preprocess = keras.application.mobilenet_v3.preprocess_input

def prepare_image(pil_img: Image.Image) -> np.ndarray:
    pil_img = pil_img.convert("RGB").resize(IMG_SIZE)
    arr = keras.utils.img_to_array(pil_img)
    arr = np.expand_dims(arr, axis = 0)
    return preprocess()

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

# ----------
# Rutas
# ----------

@app.get("/")
def home():
    return {
        "message": "Ok. Post imagen a /predict",
        "model_ outputs": num_classes_model,
        "img_size": IMG_SIZE,
        "top_k_defaults": TOP_K
    }

@app.get("/classes")
def classes(lang:str = Query(LANG_DEF, pattern="^(es|en)$")):
    data = []
    for i, en in enumerate(class_names_en):
        row = {"index": i, "label_en":en}
        if lang == "es":
            row["label_es"] = class_names_es[i]
        data.append(row)
    return {"count": len(data), "lang": lang, "classes": data}

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
    }

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


if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0", port  = 8000)