import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split

RAW_DATA_DIR = "ml/data/raw"            
PROCESSED_DATA_DIR = "ml/data/processed" 
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

IMG_SIZE = 48  

def load_images(data_type="train"):
    X_gray, X_rgb, y = [], [], []
    data_path = os.path.join(RAW_DATA_DIR, data_type)
    
    for label, emotion in enumerate(EMOTIONS):
        folder = os.path.join(data_path, emotion)
        if not os.path.exists(folder):
            continue
        for file in os.listdir(folder):
            img_path = os.path.join(folder, file)
            img = cv2.imread(img_path)  
            if img is None:
                continue
            # Resize
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            # Grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) / 255.0
            # Normalize RGB
            rgb = img / 255.0
            
            X_gray.append(gray)
            X_rgb.append(rgb)
            y.append(label)

    return np.array(X_gray), np.array(X_rgb), np.array(y)

print("📂 Loading training images...")
X_gray_train, X_rgb_train, y_train = load_images("train")

print("📂 Loading testing images...")
X_gray_test, X_rgb_test, y_test = load_images("test")

X_gray_train = np.expand_dims(X_gray_train, -1)
X_gray_test = np.expand_dims(X_gray_test, -1)

# Split training into train/validation using indices to keep RGB & grayscale aligned
indices = np.arange(len(X_gray_train))
train_idx, val_idx = train_test_split(indices, test_size=0.2, random_state=42, stratify=y_train)

# Split grayscale
X_gray_train_final = X_gray_train[train_idx]
X_gray_val_final   = X_gray_train[val_idx]

# Split RGB
X_rgb_train_final = X_rgb_train[train_idx]
X_rgb_val_final   = X_rgb_train[val_idx]

# Split labels
y_train_final = y_train[train_idx]
y_val_final   = y_train[val_idx]

# Save all data into .npz
np.savez_compressed(
    os.path.join(PROCESSED_DATA_DIR, "emotion_dataset.npz"),
    X_gray_train=X_gray_train_final, X_gray_val=X_gray_val_final, X_gray_test=X_gray_test,
    X_rgb_train=X_rgb_train_final, X_rgb_val=X_rgb_val_final, X_rgb_test=X_rgb_test,
    y_train=y_train_final, y_val=y_val_final, y_test=y_test
)

print("✅ Preprocessing done! Saved as ml/data/processed/emotion_dataset.npz")
