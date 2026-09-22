# 🎵 VibeTrack: AI-Based Emotion-Detection Music Recommender System

> An intelligent, full-stack web application that detects your emotions in real-time and curates personalized music playlists that match your mood.

## 🌟 Overview

**VibeTrack** is an AI-powered music recommendation system that combines facial emotion recognition with personalized music discovery.

### Key Highlights

- **Real-time Emotion Detection**: Captures facial expressions through a webcam and detects 7 emotions — Happy, Sad, Angry, Neutral, Surprise, Disgust, and Fear.
- **Smart Music Curation**: Recommends Spotify music based on the detected emotion.
- **Personalized Experience**: Stores mood history and user preferences for a personalized experience.
- **Mood Analytics**: Visualizes mood history and statistics over time.

## 🛠️ Tech Stack

### Frontend

- **React.js** — Component-based UI architecture
- **react-webcam** — Real-time webcam capture
- **CSS & React Icons** — Responsive and modern interface
- **Axios** — API communication

### Backend

- **Flask (Python)** — REST API framework
- **Flask-JWT-Extended** — JWT authentication
- **Flask-Session** — Server-side session management
- **MySQL** — User data and mood history
- **Spotify API** — Music discovery and playlist generation

### Machine Learning

- **TensorFlow/Keras** — CNN-based emotion classification
- **OpenCV** — Face detection using Haar Cascades
- **FER2013 Dataset** — Facial emotion dataset with 7 emotion categories
- **Hugging Face Hub** — External storage for the trained model

## 📁 Project Structure

```text
VibeTrack/
│
├── backend/                         # Flask REST API
│   ├── app.py                       # Main Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── Procfile                     # Deployment configuration
│   ├── runtime.txt                  # Python runtime configuration
│   │
│   ├── routes/                      # API route handlers
│   │   ├── auth_routes.py            # Authentication endpoints
│   │   ├── ml_routes.py              # Emotion detection endpoints
│   │   ├── mood_routes.py            # Mood history endpoints
│   │   ├── spotify_routes.py         # Spotify playlist endpoints
│   │   └── spotify_oauth.py          # OAuth flow management
│   │
│   └── ml/                          # ML inference code
│       ├── emotion_model.py          # Model loading and inference
│       └── spotify.py                # Spotify playlist generation
│
├── frontend/
│   └── emotune-frontend/             # React frontend
│       ├── src/
│       │   ├── components/            # Reusable React components
│       │   │   ├── EmotionDisplay.js
│       │   │   ├── MusicSection.js
│       │   │   ├── WebcamFeed.js
│       │   │   └── ...
│       │   ├── pages/                 # Page components
│       │   │   ├── Home.js
│       │   │   ├── LoginPage.js
│       │   │   ├── VibeTrackApp.js
│       │   │   └── ...
│       │   ├── api/                   # API client
│       │   └── App.js
│       ├── public/                    # Static files
│       └── package.json
│
├── ml/                              # ML development and training
│   ├── baseline_model.ipynb          # Model training notebook
│   ├── preprocessing.py               # Data preprocessing
│   ├── realtime_emotion.py            # Real-time inference/testing
│   └── data/
│       ├── raw/                      # Raw FER2013 dataset (ignored)
│       └── processed/                # Processed data (ignored)
│
├── VibeTrack_Project_Documentation.md
└── README.md
```

## ✨ Features

### Implemented

- [x] Real-time facial emotion detection using webcam
- [x] Detection of 7 different emotions
- [x] User registration and login
- [x] Password reset functionality
- [x] JWT-based authentication
- [x] Spotify OAuth integration
- [x] Mood history tracking
- [x] Mood analytics and visualization
- [x] Personalized music recommendations
- [x] Spotify playlist generation
- [x] User profile and mood statistics
- [x] Responsive user interface

## 🚀 Installation & Setup

### Prerequisites

Make sure the following are installed:

- **Python 3.8+**
- **Node.js 14+**
- **MySQL**
- **Git**
- **Spotify Developer Account**

### 1. Clone the Repository

```bash
git clone https://github.com/swejal19/VibeTrack.git
cd VibeTrack
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

**Windows:**

```powershell
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory.

Example:

```env
FLASK_ENV=development

DATABASE_URL=mysql+pymysql://user:password@localhost/vibetrack

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback

JWT_SECRET_KEY=your_secret_key
```

> Never commit your `.env` file or expose your API keys and secrets publicly.

### 4. Set Up MySQL Database

Open MySQL:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE vibetrack;
exit
```

If your project uses database migrations, run:

```bash
flask db upgrade
```

### 5. Start the Backend

From the `backend/` directory:

```bash
python app.py
```

The backend will run at:

```text
http://localhost:5000
```

### 6. Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend/emotune-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if required by your frontend configuration:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

Start the frontend:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

## 🧠 ML Model Details

### Emotion Classification CNN

The emotion detection model is a CNN trained on the **FER2013** dataset.

- **Input:** 48×48 grayscale facial images
- **Output:** 7 emotion classes
- **Classes:** Angry, Disgust, Fear, Happy, Neutral, Sad, Surprise
- **Training Accuracy:** ~82.64%
- **Validation Accuracy:** ~54.55%

### Key Techniques

- **Batch Normalization** — Stabilizes model training
- **Dropout (0.5)** — Helps reduce overfitting
- **Data Augmentation** — Improves model generalization
- **Early Stopping** — Helps retain the best model
- **Adam Optimizer** — Used for efficient model optimization

## 🤗 Model Storage

The trained model is **not stored in the GitHub repository**.

Instead, the model is hosted separately on Hugging Face:

**Hugging Face Model Repository:**

https://huggingface.co/Swejal/vibetrack-emotion-model

The backend supports two ways of loading the model:

### 1. Local Model

If the following file exists:

```text
backend/ml/best_emotion_model.h5
```

the application loads the local model.

### 2. Hugging Face Model

If the local `.h5` file is not available, the application automatically downloads:

```text
best_emotion_model.h5
```

from the Hugging Face model repository using `huggingface_hub`.

This allows the project to work both during local development and deployment without storing the model file in GitHub.

## 📊 Performance Metrics

| Metric | Value |
|---|---:|
| Training Accuracy | 82.64% |
| Validation Accuracy | 54.55% |
| Model Size | ~4.35 MB |
| Supported Emotions | 7 |
| Input Size | 48×48 grayscale |

## 🔐 Security & Best Practices

- JWT tokens are used for API authentication.
- Passwords are securely hashed.
- Sensitive credentials are stored in environment variables.
- `.env` files are excluded from Git.
- ML model files are excluded from Git.
- User uploads and session files are excluded from Git.
- CORS is configured for frontend-backend communication.
- Spotify credentials should never be exposed in the repository.

## 🔄 Model Loading Flow

```text
                Start Application
                       │
                       ▼
             Check for local .h5
                       │
              ┌────────┴────────┐
              │                 │
            Found             Not Found
              │                 │
              ▼                 ▼
       Load local model   Download from
                          Hugging Face
              │                 │
              └────────┬────────┘
                       ▼
                Load CNN Model
                       │
                       ▼
              Detect User Emotion
                       │
                       ▼
             Recommend Spotify Music
```

## 🔁 Retraining the Model

To retrain or experiment with the emotion detection model:

```bash
cd ml/
jupyter notebook baseline_model.ipynb
```

The trained model can then be uploaded to the Hugging Face model repository.

## 📌 Notes

- The FER2013 dataset is used for training the emotion classification model.
- Webcam access is required for real-time emotion detection.
- A Spotify Developer application is required for Spotify API functionality.
- The `.h5` model file is intentionally excluded from GitHub and stored on Hugging Face.
- The backend automatically falls back to the Hugging Face model when a local model is unavailable.

## ❤️ Acknowledgement

VibeTrack was developed as an AI-based music recommendation project combining web development, machine learning, computer vision, and the Spotify API.

---

**Made with ❤️ for emotion-aware music discovery 🎵**
