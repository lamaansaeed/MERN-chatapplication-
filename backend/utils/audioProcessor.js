const lamejs = require("lamejs");
const wav = require("node-wav");
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


// Function to convert audio files to standard WAV format
exports.convertToStandardWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le') // Convert to 16-bit PCM
      .audioFrequency(44100) // Set sample rate to 44100 Hz
      .audioChannels(1) // Set to stereo
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

exports.compressAudio = async (inputPath, outputPath) => {
  try {
    // Convert the file to a standard WAV format
    const standardWavPath = inputPath.replace(/\.[^/.]+$/, "_standard.wav");
    await convertToStandardWav(inputPath, standardWavPath);

    // Step 2: Convert standard WAV to MP3
    const outputPath = inputPath.replace(/\.[^/.]+$/, "_compressed.mp3");
    const wavFile = fs.readFileSync(standardWavPath);
  

    // Decode the WAV file using node-wav
    const result = wav.decode(wavFile);
    if (!result) {
      throw new Error("Failed to decode WAV file");
    }

    const channels = result.channelData.length; // Number of channels
    const sampleRate = result.sampleRate; // Sample rate
    const samples = result.channelData[0]; // PCM data (first channel)
    //console.log(channels);

    // Convert Float32Array to Int16Array
    const pcmData = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      pcmData[i] = Math.max(-1, Math.min(1, samples[i])) * 32767; // Convert float to 16-bit integer
    }

    // Create MP3 encoder
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps bitrate
    const mp3Data = [];

    const sampleBlockSize = 1152; // Number of samples per frame
    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
      const chunk = pcmData.subarray(i, i + sampleBlockSize);
      //console.log(chunk);
      const mp3Buffer = mp3Encoder.encodeBuffer(chunk);
      if (mp3Buffer.length > 0) {
        mp3Data.push(Buffer.from(mp3Buffer));
      }
    }

    // Finalize MP3 encoding
    const mp3Buffer = mp3Encoder.flush();
    if (mp3Buffer.length > 0) {
      mp3Data.push(Buffer.from(mp3Buffer));
    }

    // Write MP3 file
    const mp3File = Buffer.concat(mp3Data);
    fs.writeFileSync(outputPath, mp3File);

    // Clean up temporary files
    //fs.unlinkSync(standardWavPath); // Delete the standard WAV file

    return { standardWavPath, compressedMp3Path: outputPath };
  } catch (error) {
    throw error;
  }
};