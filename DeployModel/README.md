# Descripción de los componentes relevantes de la API para detectar imagenes

## 1. Root Endpoint
```python

@app.get("/")
def home():
    return {"message": "YOLO API opreacional"}
```

Funciona como rueba para comprobar que la API esta corriendo (Ruta de prueba GET /)

## 2. Endpoint de predicción

```python

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
```
Define al ruta del POST para POST /predict. Acepta un archivo subido por el usuario (una imagen). 

- Leer Imagen

```python
image_data = await file.read()
image = Image.open(io.BytesIO(image_data))

```
    - Lee los bytes de la imagen.
    - Crea un wrapper con un objeto BytesIO para que PIL pueda abrir el archivo como iamgen.
- Ejecuta el modelo (YOLO)

```python
results = model(image)
```
    - Alimenta el modelo ocn la imagen cargada
    - El objeto results contiene los labels de clase, puntajes de confianza y los cuadros limitadores

- Procesar reulstados

```python
formatted_results = []
for r in results:
    for box in r.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()   
        confidence = box.conf[0].item()         
        class_id = int(box.cls[0].item())       
        label = model.names[class_id]           

        formatted_results.append({
            "box": [x1, y1, x2, y2],
            "confidence": confidence,
            "class": label
        })
```
    - Itera sobre las detecciones:
        - box.xyxy --> cuadros delimitadores [x1, y1, x2, y2]
        - box.conf --> putnajes de confianza
        - box.cls --> indice de la clase predicha
        - model.names[class_id] --> etiqueta en formato legible
    - Se agregan las predicciones a la lista

- JSON

```python
return JSONResponse(content={"predictions": formatted_results})
```
    - Envía una resopueta en formato JSON


## Manejo de error

```python
except Exception as e:
    raise HTTPException(status_code=500, detail=Error al procesar la imagen:{e})
```
Si algo falla durante la ejecución, devuelve un mensaje HTTP 500 con el error

## Correr el servidor

```python
if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0", port = 8000)
```
- Ejectua la app en FastAPI usando Uvicorn
- 0.0.0.0 --> busca/escucha todas las redes
- port = 8000 --> puerto por defecto para la API
