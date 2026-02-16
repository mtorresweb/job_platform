import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';
import { FILE_CONFIG } from '@/shared/constants';
import sharp from 'sharp';
import { put } from '@vercel/blob';

// Configure maximum file size for Next.js
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { success: false, message: 'Configuración de almacenamiento no disponible' },
        { status: 500 }
      );
    }

    // Check authentication: prefer better-auth, fallback to NextAuth
    let userId: string | null = null;

    const betterSession = await auth.api.getSession({ headers: request.headers });
    if (betterSession?.user?.id) {
      userId = betterSession.user.id;
    }

    if (!userId) {
      const nextAuthSession = await getServerSession(authOptions);
      if (nextAuthSession?.user?.id) {
        userId = nextAuthSession.user.id;
      }
    }

    if (!userId) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token?.sub) {
        userId = String(token.sub);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';
    const quality = parseInt(formData.get('quality') as string) || 80;
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1920;
    const maxHeight = parseInt(formData.get('maxHeight') as string) || 1080;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    // Validate maximum number of files
    if (files.length > FILE_CONFIG.maxImagesPerService) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Máximo ${FILE_CONFIG.maxImagesPerService} archivos permitidos` 
        },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file size
        if (file.size > FILE_CONFIG.maxFileSize) {
          errors.push({
            index: i,
            filename: file.name,
            error: `Archivo demasiado grande. Máximo ${FILE_CONFIG.maxFileSize / 1024 / 1024}MB`,
          });
          continue;
        }        // Validate file type
        const isImage = (FILE_CONFIG.allowedImageTypes as readonly string[]).includes(file.type);
        const isDocument = (FILE_CONFIG.allowedFileTypes as readonly string[]).includes(file.type);

        if (!isImage && !isDocument) {
          errors.push({
            index: i,
            filename: file.name,
            error: 'Tipo de archivo no permitido',
          });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomId}-${i}.${extension}`;
        const baseKey = `${folder}/${timestamp}-${randomId}-${i}`;

        if (isImage) {
          // Process image with sharp
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          let sharpInstance = sharp(buffer);
          
          // Get image metadata
          const metadata = await sharpInstance.metadata();
          
          // Resize if necessary
          if (metadata.width && metadata.height) {
            if (metadata.width > maxWidth || metadata.height > maxHeight) {
              sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
              });
            }
          }

          // Convert to WebP for better compression and set quality
          const processedBuffer = await sharpInstance
            .webp({ quality })
            .toBuffer();

          // Update filename for WebP
          const webpFilename = filename.replace(/\.[^/.]+$/, '.webp');
          const webpKey = `${baseKey}.webp`;

          const webpUpload = await put(webpKey, processedBuffer, {
            access: 'public',
            contentType: 'image/webp',
            token: blobToken,
          });

          // Also save original if it's not WebP
          let originalUrl: string | null = null;
          if (file.type !== 'image/webp') {
            const originalUpload = await put(`${baseKey}.${extension}`, buffer, {
              access: 'public',
              contentType: file.type,
              token: blobToken,
            });
            originalUrl = originalUpload.url;
          }

          uploadedFiles.push({
            index: i,
            filename: webpFilename,
            originalName: file.name,
            url: webpUpload.url,
            originalUrl,
            size: processedBuffer.length,
            originalSize: file.size,
            type: 'image/webp',
            originalType: file.type,
            folder,
            metadata: {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
            },
          });
        } else {
          // Handle document files
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const upload = await put(`${baseKey}.${extension}`, buffer, {
            access: 'public',
            contentType: file.type,
            token: blobToken,
          });

          uploadedFiles.push({
            index: i,
            filename,
            originalName: file.name,
            url: upload.url,
            size: file.size,
            type: file.type,
            folder,
          });
        }

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        errors.push({
          index: i,
          filename: file.name,
          error: 'Error procesando archivo',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploaded: uploadedFiles,
        errors,
        summary: {
          total: files.length,
          successful: uploadedFiles.length,
          failed: errors.length,
        },
      },
      message: `${uploadedFiles.length} de ${files.length} archivos subidos exitosamente`,
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al subir archivos' 
      },
      { status: 500 }
    );
  }
}
