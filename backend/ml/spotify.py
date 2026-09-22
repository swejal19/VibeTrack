
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")


class SpotifyAPI:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = self.get_token()
        try:
            self.available_genres = self.get_available_genres()
        except Exception as e:
            print(f"[WARN] Could not fetch genres: {e}")
            self.available_genres = []

    def get_token(self):
        
        auth_str = f"{self.client_id}:{self.client_secret}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()

        headers = {
            "Authorization": f"Basic {b64_auth_str}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)

        if res.status_code == 200:
            return res.json().get("access_token")
        else:
            raise Exception(f"Failed to get Spotify token: {res.text}")

    def get_available_genres(self):
        
        url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
        headers = {"Authorization": f"Bearer {self.token}"}
        res = requests.get(url, headers=headers)

        if res.status_code == 200:
            return res.json().get("genres", [])
        else:
            raise Exception(f"Failed to fetch genres: {res.text}")

    def get_recommendations(self, seed_genres, limit=10):
        
        valid_genres = [g for g in seed_genres if g in self.available_genres]
        
        if not valid_genres:
            valid_genres = seed_genres

        genre_str = ",".join(valid_genres)
        url = f"https://api.spotify.com/v1/recommendations?seed_genres={genre_str}&limit={limit}"

        headers = {"Authorization": f"Bearer {self.token}"}
        res = requests.get(url, headers=headers)

        if res.status_code == 200:
            return res.json()
        else:
            raise Exception(f"Failed to fetch recommendations: {res.text}")


try:
    sp = SpotifyAPI(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
    print("[INFO] SpotifyAPI initialized successfully.")
except Exception as e:
    print(f"[ERROR] SpotifyAPI initialization failed: {e}")
    sp = None
