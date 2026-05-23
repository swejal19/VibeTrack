import cv2
import numpy as np
from collections import deque
from tensorflow.keras.models import load_model

def main():
    # Load trained model
    model = load_model("ml/best_emotion_model.h5")

    emotion_labels = ['Angry','Disgust','Fear','Happy','Neutral','Sad','Surprise']

    # Load face detector
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("❌ Cannot open webcam. Check camera connection and privacy settings.")
        return

    print("Press 'q' to quit.")

    # Smoothing buffer (keeps last 10 predictions)
    prediction_history = deque(maxlen=10)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to grab frame.")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        for (x, y, w, h) in faces:
            # Draw bounding box
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # Preprocess ROI for model
            roi = gray[y:y + h, x:x + w]
            roi = cv2.resize(roi, (48, 48))
            roi = roi.astype("float") / 255.0
            roi = np.expand_dims(roi, axis=-1)  # (48,48,1)
            roi = np.expand_dims(roi, axis=0)   # (1,48,48,1)

            # Predict emotion
            preds = model.predict(roi, verbose=0)
            emotion = np.argmax(preds)

            # Add to history and smooth
            prediction_history.append(emotion)
            smoothed_emotion = max(set(prediction_history), key=prediction_history.count)

            # Display smoothed label
            cv2.putText(frame, emotion_labels[smoothed_emotion], (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

        cv2.imshow("Real-Time Emotion Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()