from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import io
import numpy as np
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
        # Read the file efficiently without holding it in memory
        audio_data = io.BytesIO(await file.read())
        
        # Convert to mono and load audio
        audio = AudioSegment.from_file(audio_data).set_channels(1)
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        sample_rate = audio.frame_rate

        # Free up memory
        audio_data.close()

        # Perform FFT to get frequency domain and find the peak frequency
        fft_vals = rfft(samples)
        fft_freqs = rfftfreq(len(samples), d=1/sample_rate)
        dominant_freq = fft_freqs[np.argmax(np.abs(fft_vals))]

        # Check if the dominant frequency is close to 432Hz
        tolerance = 5  # Hz
        is_close_to_432 = bool(abs(dominant_freq - 432) <= tolerance)  # Convert numpy.bool to Python bool

        return {
            "dominant_frequency": f"{dominant_freq:.2f} Hz",
            "is_close_to_432Hz": is_close_to_432,
            "message": f"The dominant frequency is {dominant_freq:.2f} Hz, "
                       f"{'close to' if is_close_to_432 else 'not close to'} 432Hz."
        }

    except IndexError:
        raise HTTPException(status_code=400, detail="Invalid audio file or unsupported format")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

