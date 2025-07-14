
import React, { useState } from 'react';
import { useFoods } from '@/hooks/useFoods';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FoodForm } from '@/components/forms/FoodForm';

export function FoodsTab() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: foods, isLoading, error } = useFoods();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Foods</CardTitle>
          <CardDescription>View and manage all food items.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load food items. Please try again later.
          </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <FoodForm 
          onSuccess={() => setShowAddForm(false)}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manage Foods</CardTitle>
                <CardDescription>View and manage all food items in the database.</CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Food Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Attributes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foods?.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell className="font-medium">{food.name}</TableCell>
                    <TableCell>{food.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {food.is_vegan && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegan</Badge>}
                        {food.is_vegetarian && <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-200">Vegetarian</Badge>}
                        {food.is_halal && <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">Halal</Badge>}
                        {food.is_gluten_free && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Gluten-Free</Badge>}
                        {food.is_keto && <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Keto</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
