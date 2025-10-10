import os
import io
import json
import numpy as np
from fastapi import FastAPI, UploadFlie, File, HTTPException
from PIL import Image
import tensorflow as tf
from tensorflow import keras

app = FastAPI(title = "MobileNetV3Small clasificador de imagenes")

# ----------
# CONFIG
# ----------

MODEL_PATH = "./mobileNetV3Small.keras"
CLASS_PATH = "./class_map_es.json"
IMG_SIZE = (224,224)
TOP_K = 3

# ----------
# LOAD MODEL
# ----------

try:
    model = keras.models.load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error al cargar el modelo: {e}")

# ---------------
# LOAD CLASS MAP
# ---------------

if not os.path.exists(CLASS_PATH):
    raise RuntimeError(f"El archivo de mapeo de clases no existe en la ruta: {CLASS_PATH}")

with open(CLASS_PATH, 'r', encoding = 'utf-8') as f:
    j =json.load(f)

class_names_en = j.get("class_names_en")
class_names_es = j.get("class_names_es")

if not class_names_en or not class_names_es:
    raise RuntimeError("El archivo de mapeo de clases no contiene las claves necesarias.")          

# ---------------------------------
# Preprocesamiento de la imagen
# ---------------------------------

preprocess = keras.applications.mobilnet_v3.preprocess_input

def prepare_image(pil_img: Image.Image) -> np.array:
    pil_img = pil_img.convert("RGB").resize(IMG_SIZE)
    arr = keras.utils.img_to_array(pil_img)
    arr = np.expand_dims(arr, axis = 0)
    arr = preprocess(arr)
    return arr

# -------------------------
# Obtencion de predicciones
# -------------------------

def topk_predictions(probs: np.ndarray, k:int = TOP_K):
    k = min(k, probs.shape[-1])
    idxs = np.argsort(probs)[-k:][::-1]
    out = []

    for i in idxs:
        out.append({
            "index": int(i),
            "label_en": class_names_en[i],
            "labels_es":class_names_es[i],
            "probabilty":float(probs[i])
        })
    return out

# --------------
# ROUTES
# --------------

@app.get("/")
def home():
    return {"message": "API de classificacion de imagenes con MobileNetV3Small esta operativa!"}

@app.post("/predict")
async def predict(file: UploadFlie = File(...)):
    " CLasifica imagenes con un modelo MobileNetV3Small entrenado (no con ImageNet). Devuelve las top k calses predichas"

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code = 400, detail = "Imagen no valida.")
    
    x = prepare_image(image)

    try:
        preds = model.predict(x, verbose = 0)
    except Exception as e:
        raise HTTPException(status_code=500, detail = f"Error al realizar la predicción: {e}")
    
    probs = preds[0]

    results = topk_predictions(probs, k = TOP_K)

    return {
        "top_k": TOP_K,
        "predictions": results
    }