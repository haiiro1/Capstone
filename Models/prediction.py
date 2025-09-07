import json
import numpy as np

import tensorflow as tf
from tensorflow.keras.utils import img_to_array
from tensorflow.keras.preprocessing import image as kimage
from tensorflow.keras.applications.resnet50 import preprocess_input as rn50_preprocess


INPUT_SIZE = 256
USED_RESNET_PREPROCESS = True
USED_RESCALING_LAYER = False

def center_crop_to_square(img_pil):
    w,h = img_pil.size
    side = min(w,h)
    left = (w - side)//2
    top = (h -side)//2
    return img_pil.crop((left,top, left + side, top + side))

def load_and_prepare(path):
    pil = kimage.load_img(path)
    pil = center_crop_to_square(pil).resize((INPUT_SIZE, INPUT_SIZE))
    arr = img_to_array(pil)
    arr = np.expand_dims(arr, axis =0)

    if USED_RESNET_PREPROCESS:
        arr = rn50_preprocess(arr)

    elif USED_RESCALING_LAYER:
        pass

    else:
        arr = arr /255.0

    return arr

def predict_topk(model, x, class_labels, k = 3):
    probs = tf.nn.softmax(model.predict(x, verbose = 0), axis = 1).numpy()[0]
    topk_idx = probs.argsort()[::-1][:k]
    return [(class_labels[i], float(probs[i]), int(i)) for i in topk_idx]

def main():

    model = tf.keras.models.load_model('model_rn50.keras')

    with open('class_names.json', 'r') as file:
        class_labels = json.load(file)

    img_path = "./Unknown_predictions/mosaic.jpg"
    x = load_and_prepare(img_path)
    top3 = predict_topk(model,x, class_labels)

    print("Top 3 predicciones")

    for name, p, idx in top3:
        print(f'{name}: {p:.3f} (index {idx})')

if __name__ == "__main__":
    main()