from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
from scipy.fft import rfft, rfftfreq

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def analyze_audio(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio type")

    # Check file size before reading
    if file.size and file.size > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="File size should not exceed 20MB.")

    try:
        # Load audio using librosa
        # We load only 60 seconds to save memory
        # sr=None preserves the native sampling rate
        # mono=True mixes down to mono (standard for frequency analysis)
        y, sr = librosa.load(file.file, sr=None, mono=True, duration=60)

        # Perform FFT to get frequency domain and find the peak frequency
        fft_vals = rfft(y)
        fft_freqs = rfftfreq(len(y), d=1/sr)

        # Find peak frequency
        # We index [1:] to skip the 0Hz (DC) component which often dominates
        peak_idx = np.argmax(np.abs(fft_vals[1:])) + 1
        dominant_freq = fft_freqs[peak_idx]

        # Check if the dominant frequency is close to 432Hz
        tolerance = 5  # Hz
        is_close_to_432 = bool(abs(dominant_freq - 432) <= tolerance)

        return {
            "dominant_frequency": f"{dominant_freq:.2f} Hz",
            "is_close_to_432Hz": is_close_to_432,
            "message": f"The dominant frequency is {dominant_freq:.2f} Hz, "
                       f"{'close to' if is_close_to_432 else 'not close to'} 432Hz."
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

