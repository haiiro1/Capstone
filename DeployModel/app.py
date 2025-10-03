import io
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO

# Se instancia la aplicación FastAPI
app = FastAPI(title = "YOLOv11 Image Recognition API")

#Se carga el modelo entrenado con YOLOv11

try:
    model = YOLO("best.pt")
except Exception as e:
    raise RuntimeError(f"ERROR AL CARGAR EL MODELO: {e}")

@app.get("/")
def home():
    return {"message": "YOLO API opreacional"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        #carga de la imagen a predecir
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        #Intancia del modelo entrenado y obtención de resultados
        results = model(image)

        fomratted_results = []

        for r in results:
            for box in r.boxes:
                x1,y1,x2,y2 = box.xyxy[0].tolist()
                confidence = box.conf[0].item()
                class_id = int(box.cls[0].item())
                label = model.names[class_id]

                fomratted_results.append({
                    "box":[x1, y1, x2, y2],
                    "confidence": confidence,
                    "class": label
                })
        return JSONResponse(content = {"predictions": fomratted_results})
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = f"Error al procesar la imagen:{e}")

if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0", port = 8000)