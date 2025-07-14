import React from 'react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart, ResponsiveContainer, Legend, Tooltip, PolarRadiusAxis } from 'recharts';

interface AromaticProfileChartProps {
  product?: any;
  data?: Array<{ subject: string; value: number }>;
}

export function AromaticProfileChart({ product, data }: AromaticProfileChartProps) {
  // Map product_properties to a flat object if product is provided
  let aromaticData = data;
  if (!aromaticData && product && product.product_properties) {
    const propertiesMap: { [key: string]: string } = {};
    product.product_properties.forEach((prop: any) => {
      const propertyName = prop.property_types?.name;
      if (propertyName) {
        propertiesMap[propertyName] = prop.value;
      }
    });
    aromaticData = [
      { subject: 'Body', value: parseInt(propertiesMap['Aromatic - Body'] || '1') },
      { subject: 'Acidity', value: parseInt(propertiesMap['Aromatic - Acidity'] || '1') },
      { subject: 'Tannin', value: parseInt(propertiesMap['Aromatic - Tannin'] || '1') },
      { subject: 'Sweetness', value: parseInt(propertiesMap['Aromatic - Sweetness'] || '1') },
      { subject: 'Fruit', value: parseInt(propertiesMap['Aromatic - Fruit'] || '1') },
    ];
  } else if (!aromaticData && product) {
    aromaticData = [
      { subject: 'Body', value: parseInt(product?.aromatic_body || '1') },
      { subject: 'Acidity', value: parseInt(product?.aromatic_acidity || '1') },
      { subject: 'Tannin', value: parseInt(product?.aromatic_tannin || '1') },
      { subject: 'Sweetness', value: parseInt(product?.aromatic_sweetness || '1') },
      { subject: 'Fruit', value: parseInt(product?.aromatic_fruit || '1') },
    ];
  }

  // Show chart if any value is present (not just >1)
  const hasAromaticData = aromaticData && aromaticData.some(item => item.value && !isNaN(item.value));

  if (!hasAromaticData) {
    return null;
  }

  // Placeholder for future toggle (admin/user profile)
  // In the future, add state and logic to switch between admin/user profiles
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Aromatic Profile</h3>
        <span className="text-xs text-muted-foreground">(Admin profile, user toggle coming soon)</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aromaticData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Tooltip />
          <Radar name="Profile" dataKey="value" stroke="#ea580c" fill="#ea580c" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
