import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { FILE_CONFIG } from '@/shared/constants';
import sharp from 'sharp';

// Configure maximum file size for Next.js
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${extension}`;

    // Create upload directory structure
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    const publicUrl = `/uploads/${folder}/${filename}`;

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
      const webpFilePath = join(uploadDir, webpFilename);
      const webpPublicUrl = `/uploads/${folder}/${webpFilename}`;

      await writeFile(webpFilePath, processedBuffer);

      // Also save original if it's not WebP
      if (file.type !== 'image/webp') {
        await writeFile(filePath, buffer);
      }

      return NextResponse.json({
        success: true,
        data: {
          filename: webpFilename,
          originalName: file.name,
          url: webpPublicUrl,
          originalUrl: file.type !== 'image/webp' ? publicUrl : null,
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
      
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        data: {
          filename,
          originalName: file.name,
          url: publicUrl,
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
    const filename = searchParams.get('filename');
    const folder = searchParams.get('folder') || 'uploads';

    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'Nombre de archivo requerido' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'public', 'uploads', folder, filename);
    
    try {
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
        return NextResponse.json({
        success: true,
        message: 'Archivo eliminado exitosamente',
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json(
          { success: false, message: 'Archivo no encontrado' },
          { status: 404 }
        );
      }
      throw error;
    }

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
