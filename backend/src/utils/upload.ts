import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images allowed'))
    }
  },
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const filename = `avatars/${crypto.randomUUID()}${path.extname(file.originalname)}`
  
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
  }

  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
  })

  await upload.done()

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
}

export default upload;

