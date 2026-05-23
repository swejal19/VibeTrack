# 🎵 VibeTrack: AI-Based Emotion-Aware Music Recommender System

> An intelligent, full-stack web application that detects your emotions in real-time and curates personalized music playlists that match your mood.

## 🌟 Overview

**VibeTrack** is an innovative solution that combines facial emotion recognition with music recommendation:
- **Real-time Emotion Detection**: Captures your facial expressions via webcam and detects 7 different emotions (Happy, Sad, Angry, Neutral, Surprise, Disgust, Fear)
- **Smart Music Curation**: Automatically generates Spotify playlists matching your detected emotional state
- **Personalized Experience**: Saves your mood history and preferences for better recommendations over time

**Perfect for**: Mental health monitoring, smart entertainment, user engagement enhancement on streaming platforms.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [ML Model Details](#ml-model-details)
- [Contributing](#contributing)
- [License](#license)

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-driven UI architecture
- **react-webcam** - Real-time video capture
- **CSS & React Icons** - Responsive modern design
- **Axios** - API communication

### Backend
- **Flask (Python)** - Lightweight REST API framework
- **Flask-JWT-Extended** - Secure JWT authentication
- **Flask-Session** - Server-side session management with Spotify OAuth
- **MySQL** - User data & mood history database
- **Spotify API** - Music discovery & playlist creation

### Machine Learning
- **TensorFlow/Keras** - CNN model for emotion classification
- **OpenCV** - Face detection using Haar Cascades
- **FER2013 Dataset** - 35,000+ facial images across 7 emotion categories

---

## 📁 Project Structure

```
VibeTrack/
├── backend/                        # Flask REST API
│   ├── app.py                     # Main Flask application
│   ├── requirements.txt           # Python dependencies
│   ├── routes/                    # API route handlers
│   │   ├── auth_routes.py        # Authentication endpoints
│   │   ├── ml_routes.py          # Emotion detection endpoints
│   │   ├── mood_routes.py        # Mood history endpoints
│   │   ├── spotify_routes.py     # Spotify playlist endpoints
│   │   └── spotify_oauth.py      # OAuth flow management
│   ├── ml/                        # ML inference code
│   │   ├── emotion_model.py      # Model inference
│   │   ├── spotify.py            # Spotify playlist generation
│   │   └── best_emotion_model.h5 # Trained CNN model
│   ├── flask_session/            # Session storage (ignored in git)
│   └── uploads/                  # User uploads (ignored in git)
│
├── frontend/emotune-frontend/    # React frontend
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── EmotionDisplay.js
│   │   │   ├── MusicSection.js
│   │   │   ├── WebcamFeed.js
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── Home.js
│   │   │   ├── LoginPage.js
│   │   │   ├── VibeTrackApp.js
│   │   │   └── ...
│   │   ├── api/                  # API client
│   │   └── App.js
│   └── public/                   # Static files
│
├── ml/                            # ML Development & Training
│   ├── baseline_model.ipynb      # Model training notebook
│   ├── preprocessing.py          # Data preprocessing script
│   ├── realtime_emotion.py       # Real-time inference
│   └── data/
│       ├── raw/                  # Raw FER2013 dataset (ignored)
│       └── processed/            # Preprocessed data (ignored)
│
├── VibeTrack_Project_Documentation.md  # Detailed documentation
└── README.md                     # This file
```

---

## ✨ Features

### ✅ Implemented
- [x] Real-time facial emotion detection via webcam
- [x] User authentication (sign up, login, password reset)
- [x] Spotify OAuth integration
- [x] Mood history tracking & visualization
- [x] Personalized music playlist generation based on emotion
- [x] User profile & mood statistics
- [x] Responsive UI for desktop and mobile

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 14+**
- **MySQL Database**
- **Spotify Developer Credentials** ([Get them here](https://developer.spotify.com))

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/VibeTrack.git
   cd VibeTrack/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Create a .env file (template below)
   FLASK_ENV=development
   DATABASE_URL=mysql+pymysql://user:password@localhost/vibetrack
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
   JWT_SECRET_KEY=your_secret_key
   ```

5. **Set up database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   > CREATE DATABASE vibetrack;
   > exit
   ```

6. **Run migrations (if using SQLAlchemy)**
   ```bash
   flask db upgrade
   ```

7. **Start the backend**
   ```bash
   python app.py
   ```
   Backend runs at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend/emotune-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Frontend runs at `http://localhost:3000`

---

## 🧠 ML Model Details

### Emotion Classification CNN
- **Architecture**: 3 Convolutional blocks with Batch Normalization
- **Input**: 48×48 grayscale facial images
- **Output**: 7 emotion classes
- **Performance**: 
  - Training Accuracy: ~82.64%
  - Validation Accuracy: ~54.55%
  
### Key Techniques
- **Batch Normalization** - Stabilizes training
- **Dropout (0.5)** - Prevents overfitting
- **Data Augmentation** - Improves generalization
- **Early Stopping** - Saves best model weights
- **Adam Optimizer** - Fast convergence

### Retraining the Model
```bash
cd ml/
jupyter notebook baseline_model.ipynb
```
---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Training Accuracy | 82.64% |
| Validation Accuracy | 54.55% |
| Model Size | ~50 MB |
| Inference Time | ~100ms per frame |
| Supported Emotions | 7 (Happy, Sad, Angry, Neutral, Surprise, Disgust, Fear) |

---

## 🔐 Security & Best Practices

- ✅ JWT tokens for API authentication
- ✅ Environment variables for sensitive credentials (.env files not in repo)
- ✅ CORS configured for frontend domain
- ✅ Password hashing (bcrypt)

---

## ⚙️ Environment Variables

**Backend (.env)**
```
FLASK_ENV=development
DEBUG=True
DATABASE_URL=mysql+pymysql://user:password@localhost/vibetrack
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SPOTIFY_CLIENT_ID=your_id
```
---

**Made with ❤️ for emotion-aware music discovery**
