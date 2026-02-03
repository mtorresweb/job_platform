import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  category: z.enum(["general", "technical", "billing", "feedback", "report"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Get user session if authenticated
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ 
        headers: request.headers 
      });
      userId = session?.user?.id || null;
    } catch {
      // User not authenticated, continue without userId
      console.log("No authenticated user for contact form");
    }

    // Create contact submission record
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        category: validatedData.category || "general",
        priority: validatedData.priority || "medium",
        phone: validatedData.phone,
        userId: userId,
        status: "pending",
        metadata: {
          userAgent: request.headers.get("user-agent"),
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          timestamp: new Date().toISOString(),
        },
      },
    });

    // TODO: Send email notification to support team
    // TODO: Send confirmation email to user
    // TODO: Create support ticket in ticketing system if configured
    
    // For now, we'll just log the submission
    console.log("Contact form submission:", {
      id: contactSubmission.id,
      name: validatedData.name,
      email: validatedData.email,
      category: validatedData.category,
      priority: validatedData.priority,
    });

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      id: contactSubmission.id,
    }, { status: 201 });

  } catch (error) {
    console.error("Contact form submission error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow admin users to view contact submissions
    let session;
    try {
      session = await auth.api.getSession({ 
        headers: request.headers 
      });
    } catch {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
      }, { status: 401 });
    }
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
      }, { status: 401 });
    }

    // TODO: Add proper admin role check
    // For now, we'll return a basic response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    
    const where: { status?: string; category?: string } = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}
