from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import io
import numpy as np
from scipy.fft import rfft, rfftfreq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def analyze_audio(file: UploadFile = File(...)):
    # Check if file is an audio type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio type")

    try:
        # Load the audio file using pydub
        audio = AudioSegment.from_file(io.BytesIO(await file.read())).set_channels(1)  # mono
        samples = np.array(audio.get_array_of_samples())
        sample_rate = audio.frame_rate

        # Perform FFT to get frequency domain and find the peak frequency
        fft_vals = rfft(samples)
        fft_freqs = rfftfreq(len(samples), d=1/sample_rate)
        dominant_freq = fft_freqs[np.argmax(np.abs(fft_vals))]

        # Check if the dominant frequency is close to 432Hz (within a tolerance range)
        tolerance = 5  # Hz
        result = (
            f"The dominant frequency is {dominant_freq:.2f} Hz, "
            f"{'close to' if abs(dominant_freq - 432) <= tolerance else 'not close to'} 432Hz."
        )

        return {"message": result}

    except IndexError:
        # Handle the case where no audio stream is detected
        raise HTTPException(status_code=400, detail="Invalid audio file or unsupported format")

    except Exception as e:
        # Handle any other exception
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
