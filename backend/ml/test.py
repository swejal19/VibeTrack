from spotify import sp

# valid seed genres from Spotify (partial list)
valid_genres = ["acoustic", "blues", "classical", "country", "dance", "edm",
                "hip-hop", "jazz", "metal", "pop", "punk", "reggae", "rock", "soul"]

try:
    results = sp.recommendations(seed_genres=["pop"], limit=1)
    print(results["tracks"][0]["name"], "-", results["tracks"][0]["artists"][0]["name"])
except Exception as e:
    print("Error fetching recommendations:", e)
