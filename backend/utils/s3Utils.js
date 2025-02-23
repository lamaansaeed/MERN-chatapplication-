const { TranscribeClient, 
  StartTranscriptionJobCommand, 
  GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");

const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
  } = require("@aws-sdk/client-s3");
  const fs = require("fs");

// Configure AWS clients
const transcribeClient = new TranscribeClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

  // Configure AWS SDK
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    
  });
  
  // Function to upload a file to S3
  const uploadDocument = async (bucket, key, filePath) => {
    const fileContent = fs.readFileSync(filePath);
    console.log(process.env.AWS_ACCESS_KEY_ID)
    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ACL: "public-read", // Make the file publicly accessible
    };
  
    try {
      const data = await s3.send(new PutObjectCommand(params));
      return { Location: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
    } catch (err) {
      console.error("Error uploading to S3:", err);
      throw err;
    }
  };
  
  // Start transcription job
const startTranscription = async (mediaUri) => {
  const params = {
    TranscriptionJobName: `job-${Date.now()}`,
    LanguageCode: "en-US",
    Media: { MediaFileUri: mediaUri },
    Settings: {
      ShowSpeakerLabels: true,
      MaxSpeakerLabels: 2
    }
  };
  return transcribeClient.send(new StartTranscriptionJobCommand(params));
};

// Get transcription results
const getTranscriptionResults = async (jobName) => {
  const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
  const response = await transcribeClient.send(command);
  return response.TranscriptionJob;
};
  const downloadFileFromS3 = async (fileUrl, outputPath) => {
    try {
      const urlParts = fileUrl.split("/");
      const bucketName = urlParts[2].split(".")[0];
      const fileKey = urlParts.slice(3).join("/");
  
      const params = {
        Bucket: bucketName,
        Key: fileKey,
      };
  
      const data = await s3.send(new GetObjectCommand(params));
      const fileStream = fs.createWriteStream(outputPath);
      data.Body.pipe(fileStream);
  
      return new Promise((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });
    } catch (error) {
      console.error("Error downloading file from S3:", error);
      throw error;
    }
  };
  
  module.exports = { downloadFileFromS3 ,uploadDocument,startTranscription,getTranscriptionResults};