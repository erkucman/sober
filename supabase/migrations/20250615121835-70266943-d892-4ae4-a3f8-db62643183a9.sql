
CREATE OR REPLACE FUNCTION get_product_details(p_id uuid)
RETURNS TABLE (
    id uuid,
    brand_id uuid,
    name text,
    description text,
    price numeric,
    currency text,
    category_id uuid,
    images text[],
    is_alcohol_free boolean,
    is_gluten_free boolean,
    is_vegan boolean,
    status submission_status,
    created_at timestamptz,
    updated_at timestamptz,
    brands json,
    categories json,
    vintage text,
    country text,
    region text,
    beverage_type text,
    wine_varietal text,
    grape_varieties text,
    serving_temperature text,
    shelf_duration text,
    purchase_link text,
    aromatic_body text,
    aromatic_acidity text,
    aromatic_tannin text,
    aromatic_sweetness text,
    aromatic_fruit text,
    awards json[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    prop_map jsonb := '{}'::jsonb;
    prop_record record;
BEGIN
    FOR prop_record IN
        SELECT pt.name as prop_name, pp.value as prop_value
        FROM product_properties pp
        JOIN property_types pt ON pp.property_type_id = pt.id
        WHERE pp.product_id = p_id
    LOOP
        prop_map := jsonb_set(prop_map, ARRAY[lower(replace(prop_record.prop_name, ' ', '_'))], to_jsonb(prop_record.prop_value));
    END LOOP;

    RETURN QUERY
    SELECT
        p.*,
        to_json(b) as brands,
        to_json(c) as categories,
        prop_map->>'vintage',
        prop_map->>'country',
        prop_map->>'region',
        prop_map->>'beverage_type',
        prop_map->>'wine_varietal',
        prop_map->>'grape_varieties',
        prop_map->>'serving_temperature',
        prop_map->>'shelf_duration',
        prop_map->>'purchase_link',
        prop_map->>'aromatic_-_body',
        prop_map->>'aromatic_-_acidity',
        prop_map->>'aromatic_-_tannin',
        prop_map->>'aromatic_-_sweetness',
        prop_map->>'aromatic_-_fruit',
        array_agg(to_json(pa)) FILTER (WHERE pa.id IS NOT NULL) as awards
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_awards pa ON p.id = pa.product_id
    WHERE p.id = p_id
    GROUP BY p.id, b.id, c.id;
END;
$$;


CREATE OR REPLACE FUNCTION create_or_update_product(
    p_id uuid,
    p_brand_id uuid,
    p_name text,
    p_description text,
    p_price numeric,
    p_currency text,
    p_category_id uuid,
    p_images text[],
    p_is_alcohol_free boolean,
    p_is_gluten_free boolean,
    p_is_vegan boolean,
    p_awards jsonb[],
    p_properties jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_id uuid;
    prop_key text;
    prop_value text;
    prop_type_id uuid;
    award jsonb;
BEGIN
    IF p_id IS NOT NULL THEN
        -- Update existing product
        UPDATE products
        SET
            brand_id = p_brand_id,
            name = p_name,
            description = p_description,
            price = p_price,
            currency = p_currency,
            category_id = p_category_id,
            images = p_images,
            is_alcohol_free = p_is_alcohol_free,
            is_gluten_free = p_is_gluten_free,
            is_vegan = p_is_vegan,
            updated_at = now()
        WHERE id = p_id
        RETURNING id INTO v_product_id;
    ELSE
        -- Insert new product
        INSERT INTO products (
            brand_id, name, description, price, currency, category_id, images,
            is_alcohol_free, is_gluten_free, is_vegan, status
        ) VALUES (
            p_brand_id, p_name, p_description, p_price, p_currency, p_category_id, p_images,
            p_is_alcohol_free, p_is_gluten_free, p_is_vegan, 'approved'
        ) RETURNING id INTO v_product_id;
    END IF;

    -- Clear existing properties and awards for simplicity
    DELETE FROM product_properties WHERE product_id = v_product_id;
    DELETE FROM product_awards WHERE product_id = v_product_id;

    -- Insert/update properties
    FOR prop_key, prop_value IN SELECT * FROM jsonb_each_text(p_properties)
    LOOP
        IF prop_value IS NOT NULL AND prop_value != '' THEN
            SELECT id INTO prop_type_id FROM property_types WHERE name = prop_key;
            IF prop_type_id IS NOT NULL THEN
                INSERT INTO product_properties (product_id, property_type_id, value)
                VALUES (v_product_id, prop_type_id, prop_value);
            END IF;
        END IF;
    END LOOP;

    -- Insert awards
    IF p_awards IS NOT NULL THEN
        FOREACH award IN ARRAY p_awards
        LOOP
            INSERT INTO product_awards (product_id, name, year)
            VALUES (v_product_id, award->>'name', (award->>'year')::integer);
        END LOOP;
    END IF;
END;
$$;
