import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Globe, MapPin, Award, Wine } from 'lucide-react';

export function BrandPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start space-x-8">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Award className="h-16 w-16 text-gray-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-orange-800 mb-2">Pepe Wines</h1>
              <p className="text-lg text-muted-foreground mb-4">
                Crafting exceptional non-alcoholic wines since 2020. Our commitment to quality and innovation 
                brings you the finest selection of alcohol-free wines that don't compromise on taste.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>İstanbul, Türkiye</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <span>www.pepewines.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>4.8 average rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <Wine className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">2020</p>
                  <p className="text-sm text-muted-foreground">Founded</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Products</CardTitle>
            <CardDescription>Discover our full range of premium non-alcoholic wines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Product */}
              <Card className="border-2 border-orange-200">
                <CardContent className="p-4">
                  <Badge className="mb-2 bg-orange-100 text-orange-800">Featured</Badge>
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Wine className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Super Wine 2024</h3>
                  <p className="text-sm text-muted-foreground mb-2">Our flagship premium blend</p>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">(156 reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-orange-800">$80</span>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Other Products */}
              {[1, 2, 3, 4, 5].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Wine className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Premium Wine {item}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Elegant and refined</p>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">({80 + item * 10} reviews)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-800">${60 + item * 5}</span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Pepe Wines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                Founded in 2020 in the heart of İstanbul, Pepe Wines has been at the forefront of the 
                non-alcoholic wine revolution. Our innovative approach combines traditional winemaking 
                techniques with modern alcohol removal processes to create wines that maintain all the 
                complexity and character of their alcoholic counterparts.
              </p>
              <p className="text-muted-foreground mt-4">
                We source our grapes from the finest vineyards across Türkiye, working closely with 
                local growers who share our commitment to sustainable and ethical farming practices. 
                Every bottle of Pepe Wines represents our dedication to quality, innovation, and the 
                belief that great wine should be accessible to everyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
