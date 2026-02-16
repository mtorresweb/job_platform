import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';
import { FILE_CONFIG } from '@/shared/constants';
import sharp from 'sharp';
import { put, del } from '@vercel/blob';

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
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const quality = parseInt(formData.get('quality') as string) || 80;
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1920;
    const maxHeight = parseInt(formData.get('maxHeight') as string) || 1080;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > FILE_CONFIG.maxFileSize) {
      return NextResponse.json(
        { 
          success: false, 
          message: `El archivo es demasiado grande. Máximo ${FILE_CONFIG.maxFileSize / 1024 / 1024}MB` 
        },
        { status: 400 }
      );
    }    // Validate file type
    const isImage = (FILE_CONFIG.allowedImageTypes as readonly string[]).includes(file.type);
    const isDocument = (FILE_CONFIG.allowedFileTypes as readonly string[]).includes(file.type);

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tipo de archivo no permitido' 
        },
        { status: 400 }
      );
    }

    // Generate unique filename base
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${extension}`;
    const baseKey = `${folder}/${timestamp}-${randomId}`;

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

      return NextResponse.json({
        success: true,
        data: {
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
        },
        message: 'Imagen subida y procesada exitosamente',
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

      return NextResponse.json({
        success: true,
        data: {
          filename,
          originalName: file.name,
          url: upload.url,
          size: file.size,
          type: file.type,
          folder,
        },
        message: 'Archivo subido exitosamente',
      });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al subir archivo' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const blobUrl = searchParams.get('url');
    const filename = searchParams.get('filename');
    const folder = searchParams.get('folder') || 'uploads';

    if (!blobUrl && !filename) {
      return NextResponse.json(
        { success: false, message: 'URL o nombre de archivo requerido' },
        { status: 400 }
      );
    }

    // Prefer explicit blob URL; fallback to constructed URL if base is provided
    let target = blobUrl || '';
    if (!target && filename) {
      const baseUrl = process.env.BLOB_PUBLIC_BASE_URL?.replace(/\/$/, '');
      if (!baseUrl) {
        return NextResponse.json(
          { success: false, message: 'Falta BLOB_PUBLIC_BASE_URL para eliminar por nombre' },
          { status: 400 }
        );
      }
      target = `${baseUrl}/${folder}/${filename}`;
    }

    await del(target, { token: blobToken });

    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al eliminar archivo' 
      },
      { status: 500 }
    );
  }
}
