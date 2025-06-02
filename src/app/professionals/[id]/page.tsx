"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfessional } from "@/shared/hooks/useProfessionals";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Shield,
  MessageSquare,
  Calendar,
  Mail,
  Users,
  Briefcase,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const professionalId = params.id as string;
  const [activeTab, setActiveTab] = useState("services");

  // Fetch professional data
  const { 
    data: professional, 
    isLoading, 
    error,
    refetch 
  } = useProfessional(professionalId);

  const handleContactProfessional = () => {
    console.log("Contact professional:", professional?.id);
  };

  const handleBookService = (serviceId: string) => {
    console.log("Book service:", serviceId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>

        {/* Profile Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Services Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/professionals" className="text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold">Professional Profile</h1>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading professional profile. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/professionals" className="text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold">Professional Profile</h1>
            </div>
          </div>
        </div>

        {/* Not Found */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Professional not found.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/professionals" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Professional Profile</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={professional.user.avatar || ""} />
                    <AvatarFallback className="text-xl">
                      {professional.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {professional.user.name}
                        </h1>                        <p className="text-lg text-gray-600 mt-1">
                          {professional.bio || "Professional"}
                        </p>
                      </div>
                      {professional.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {professional.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{professional.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({professional.reviewCount} reviews)</span>
                      </div>                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{professional.city}, {professional.state}</span>
                      </div>                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          Usually responds quickly
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {professional.services.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{service.title}</h3>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="font-bold text-blue-600">
                                ${service.price}
                              </span>
                              <Badge variant="outline">
                                {service.category.name}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleBookService(service.id)}
                            size="sm"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {professional.services.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No services listed yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>                      <p className="text-gray-600 leading-relaxed">
                        {professional.bio || "No description provided."}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Experience & Qualifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {professional.experience} years experience
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Professional Certified
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {professional.reviewCount} clients served
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Background verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No portfolio items yet
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">                    {professional.reviews?.map((review, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {review.client.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.client.name}</div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No reviews yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleContactProfessional}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
                
                <Separator />
                  <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{professional.user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{professional.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium">{professional.rating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium">{professional.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">
                    {new Date(professional.user.createdAt).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Identity verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email verified</span>
                </div>                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Phone verified</span>
                </div>
                {professional.isVerified && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Professional certified</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
