import os
import cv2
import glob
import numpy as np


class ImagePreprocessorCuda:
    def __init__(self, high_contrast=1.5, low_contrast=0.7):
        self.high_contrast = high_contrast
        self.low_contrast = low_contrast

    def process_image(self, img_path):
        img = cv2.imread(img_path)

        if img is None:
            print(f"Skipping: {img_path}")

        gpu_img = cv2.cuda_GpuMat()
        gpu_img.upload(img)

        gpu_high = cv2.cuda.multiply(gpu_img, self.high_contrast)
        gpu_low = cv2.cuda.multiply(gpu_img, self.low_contrast)

        high = gpu_high.download()
        low = gpu_low.download()

        dirname, filename = os.path.split(img_path)
        name, ext = os.path.splitext(filename)

        high_path = os.path.join(dirname, f"{name}_high{ext}")
        low_path = os.path.join(dirname, f"{name}_low{ext}")

        cv2.imwrite(high_path, high)
        cv2.imwrite(low_path, low)

        angles = {
            "rot90": 90,
            "rot180": 180,
            "rot270": 270
        }

        h, w = img.shape[:2]

        center = (w/2, h/2)

        for suffix, angle in angles.items():
            M = cv2.getRotationMatrix2D(center, angle, 1.0)

            M_gpu = cv2.cuda_GpuMat()
            M_gpu.upload(M.astype(np.float32))

            gpu_rot = cv2.cuda.warpAffine(gpu_img, M, (w, h))

            rotated = gpu_rot.download()

            out_path = os.path.join(dirname, f"{name}_{suffix}{ext}")

            cv2.imwrite(out_path, rotated)

    def process_directories(self, root_dir, extensions=(".jpg", ".png", ".jpeg")):
        for ext in extensions:
            for img_path in glob.glob(os.path.join(root_dir, "**", f"*{ext}"), recursive=True):
                self.process_image(img_path)


def main():
    root_dir = r"D:\tomato"

    sub_dirs = [
        "TOMATO_BACTERIAL_SPOT",
        "TOMATO_EARLY_BLIGHT",
        "TOMATO_HEALTHY",
        "TOMATO_LATE_BLIGHT",
        "TOMATO_LEAF_MOLD",
        "TOMATO_MOSAIC_VIRUS",
        "TOMATO_SEPTORIA_LEAF_SPOT",
        "TOMATO_TARGET_SPOT"
    ]

    processor = ImagePreprocessorCuda()

    for dir in sub_dirs:
        print(dir)
        img_dir = os.path.join(root_dir, dir)

        print(f"Processing direcotry : {img_dir}")

        processor.process_directories(img_dir)


if __name__ == "__main__":
    main()
