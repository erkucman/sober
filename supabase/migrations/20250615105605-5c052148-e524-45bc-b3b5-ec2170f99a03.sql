
-- Add new property types for the Aromatic Profile
INSERT INTO public.property_types (name, description, data_type)
VALUES
('Aromatic - Body', 'A measure of the texture or weight of the beverage in the mouth (0-100)', 'number'),
('Aromatic - Acidity', 'A measure of the tartness or crispness of the beverage (0-100)', 'number'),
('Aromatic - Tannin', 'A measure of the bitterness or astringency, often found in wine (0-100)', 'number'),
('Aromatic - Sweetness', 'A measure of the amount of residual sugar in the beverage (0-100)', 'number'),
('Aromatic - Fruit', 'A measure of the prominence of fruit flavors and aromas (0-100)', 'number');
