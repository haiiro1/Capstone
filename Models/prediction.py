import json
import numpy as np

import tensorflow as tf
from tensorflow.keras.utils import img_to_array
from tensorflow.keras.preprocessing import image as kimage
from tensorflow.keras.applications.resnet50 import preprocess_input as rn50_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mv2_preprocess
from tensorflow.keras.applications.inception_v3 import preprocess_input as incv3_preprocess


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
    if pil.size[0] != INPUT_SIZE and pil.size[1] != INPUT_SIZE:
        pil = center_crop_to_square(pil).resize((INPUT_SIZE, INPUT_SIZE))
    else:
        pass
    arr = img_to_array(pil)
    arr = np.expand_dims(arr, axis =0)

    if USED_RESNET_PREPROCESS:
        arr = rn50_preprocess(arr)
        #arr = mv2_preprocess(arr)
        #arr = incv3_preprocess(arr)

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

    img_path = "./output/test/TOMATO_HEALTHY/Tomato_healthy3779.jpg"
    #img_path = "./output/test/TOMATO_LATE_BLIGHT/Tomato_Late_blight37.jpg"
    x = load_and_prepare(img_path)
    top3 = predict_topk(model,x, class_labels)

    print("Top 3 predicciones")

    for name, p, idx in top3:
        print(f'{name}: {p:.3f} (index {idx})')

if __name__ == "__main__":
    main()