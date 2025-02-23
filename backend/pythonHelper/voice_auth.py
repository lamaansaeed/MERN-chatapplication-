import sys
import torch
import torchaudio
import numpy as np
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from sklearn.preprocessing import normalize
import json
import warnings

warnings.filterwarnings("ignore")  # Suppress warnings

# Load the speaker embedding model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
embedding_model = PretrainedSpeakerEmbedding(
    "speechbrain/spkrec-ecapa-voxceleb", device=device
)

def preprocess_audio(audio_path):
    """Converts audio to 16kHz, mono-channel format."""
    waveform, sample_rate = torchaudio.load(audio_path)

    # Convert stereo to mono if necessary
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)  # Convert to mono

    # Resample if not 16kHz
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
        waveform = resampler(waveform)

    # Ensure waveform has the correct shape (1, channels, samples)
    waveform = waveform.unsqueeze(0)  # Adds a batch dimension → (1, 1, samples)

    return waveform

def extract_embedding(audio_path):
    """Extracts a fixed-length speaker embedding from an audio file."""
    waveform = preprocess_audio(audio_path)

    # Debugging: Print shape before passing to the model
    print("Waveform shape before embedding:", waveform.shape)  

    # Extract speaker embedding
    embedding = embedding_model(waveform)  

    # Normalize the embedding
    normalized_embedding = normalize(embedding.reshape(1, -1))[0]

    return normalized_embedding


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    embedding = extract_embedding(audio_path)

    # Print JSON output for Node.js
    print(json.dumps({"embedding": embedding.tolist()}))
