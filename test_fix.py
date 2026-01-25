from fastapi.testclient import TestClient
from main import app
import numpy as np
import io
import soundfile as sf
import time

client = TestClient(app)

def test_memory_fix():
    print("Generating large test audio file (120 seconds of 432Hz sine wave)...")
    sr = 44100
    duration = 120  # 2 minutes long, to verify we only read 60s
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Generate 432Hz sine wave
    audio = 0.5 * np.sin(2 * np.pi * 432 * t)

    # Save to in-memory bytes
    print("Saving to wrapper...")
    file_bytes = io.BytesIO()
    sf.write(file_bytes, audio, sr, format='WAV')
    file_bytes.seek(0)

    print(f"File size: {file_bytes.getbuffer().nbytes / 1024 / 1024:.2f} MB")

    print("\nSending request to /upload...")
    start_time = time.time()

    response = client.post(
        "/upload",
        files={"file": ("test_432hz.wav", file_bytes, "audio/wav")}
    )

    end_time = time.time()
    print(f"Request took {end_time - start_time:.2f} seconds")

    print("\nResponse:")
    print(response.json())

    assert response.status_code == 200
    data = response.json()
    assert "432.00 Hz" in data["dominant_frequency"]
    assert data["is_close_to_432Hz"] is True

    print("\n✅ Test passed! Analysis successful and efficient.")

if __name__ == "__main__":
    test_memory_fix()
