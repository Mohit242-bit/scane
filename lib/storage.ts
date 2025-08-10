import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { config } from "./config"

class StorageService {
  private s3: S3Client
  private bucket = config.storage.aws.bucket

  constructor() {
    this.s3 = new S3Client({
      region: config.storage.aws.region,
      credentials: {
        accessKeyId: config.storage.aws.accessKeyId,
        secretAccessKey: config.storage.aws.secretAccessKey,
      },
    })
  }

  async uploadFile(key: string, file: Buffer, contentType: string, metadata?: Record<string, string>): Promise<string> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: contentType,
          Metadata: metadata,
        }),
      )

      return `https://${this.bucket}.s3.${config.storage.aws.region}.amazonaws.com/${key}`
    } catch (error) {
      console.error("File upload error:", error)
      throw new Error("Failed to upload file")
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      return await getSignedUrl(this.s3, command, { expiresIn })
    } catch (error) {
      console.error("Failed to generate signed URL:", error)
      throw new Error("Failed to generate download URL")
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
    } catch (error) {
      console.error("File deletion error:", error)
      throw new Error("Failed to delete file")
    }
  }

  generateKey(type: "prescription" | "report" | "invoice", bookingId: string, filename: string): string {
    const timestamp = Date.now()
    const extension = filename.split(".").pop()
    return `${type}s/${bookingId}/${timestamp}.${extension}`
  }
}

export const storage = new StorageService()
