import { sql } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
  scheduler?: string;
}

export interface Image {
  id: string;
  userId: string;
  prompt: string;
  url: string;
  createdAt: Date;
}

export class ImageService {
  async generateImage(userId: string, request: GenerateImageRequest): Promise<Image[]> {
    // Call Models service to generate image
    const [imageUrls] = await this.getGeneratedImage(request);

    const images: Image[] = [];

    for (const url of imageUrls) {
      const imageId = uuidv4();
      const now = new Date();

      // Download image and upload to S3
      const s3Url = await this.uploadImageToS3(url, imageId);

      // Save to database
      const [image] = await sql`
        INSERT INTO images (id, user_id, prompt, url, created_at, is_publishing)
        VALUES (${imageId}, ${userId}, ${request.prompt}, ${s3Url}, ${now}, false)
        RETURNING *
      `;

      images.push({
        id: image.id,
        userId: image.user_id,
        prompt: image.prompt,
        url: image.url,
        createdAt: image.created_at,
      });
    }

    return images;
  }

  async getGeneratedImage(request: GenerateImageRequest): Promise<[string[], any]> {
    const response = await fetch(`${config.modelsUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return [[data.imageUrl || data.url], data];
  }

  async uploadImageToS3(imageUrl: string, imageId: string): Promise<string> {
    try {
      // Download image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload to S3
      const key = `images/${imageId}.png`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.aws.s3Bucket,
          Key: key,
          Body: Buffer.from(imageBuffer),
          ContentType: 'image/png',
        })
      );

      return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload failed:', error);
      return imageUrl; // Fallback to original URL
    }
  }

  async getImages(userId: string, pageNumber: number, pageSize: number): Promise<any> {
    const offset = pageNumber * pageSize;

    const images = await sql`
      SELECT * FROM images
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM images
      WHERE user_id = ${userId}
    `;

    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return {
      content: images,
      totalElements: total,
      totalPages,
      size: pageSize,
      number: pageNumber,
    };
  }

  async getPublishingImages(query: string, pageNumber: number, pageSize: number): Promise<any> {
    const offset = pageNumber * pageSize;
    const searchPattern = `%${query}%`;

    let images;
    let countResult;

    if (query) {
      images = await sql`
        SELECT * FROM images
        WHERE is_publishing = true
          AND prompt ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total FROM images
        WHERE is_publishing = true
          AND prompt ILIKE ${searchPattern}
      `;
    } else {
      images = await sql`
        SELECT * FROM images
        WHERE is_publishing = true
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total FROM images
        WHERE is_publishing = true
      `;
    }

    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return {
      content: images,
      totalElements: total,
      totalPages,
      size: pageSize,
      number: pageNumber,
    };
  }

  async getImageBase64(imageId: string): Promise<string> {
    const [image] = await sql`
      SELECT url FROM images WHERE id = ${imageId}
    `;

    if (!image) {
      throw new Error('Image not found');
    }

    // Fetch image and convert to base64
    const response = await fetch(image.url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return `data:image/png;base64,${base64}`;
  }
}
