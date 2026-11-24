/*
# Create Jossy Cakes and Kitchen Hub stall shop

1. Purpose
- Adds the public stall record for JOSSY CAKES AND KITCHEN HUB.
- Adds the product catalog used by the stall page, home stall card, basket, and vendor upload page.
- Adds server-checked functions for vendor-created product uploads, edits, and deletes.

2. New Tables
- `stalls`
  - `id` (uuid, primary key)
  - `slug` (text, unique route key)
  - `brand_name` (text)
  - `location` (text)
  - `category` (text)
  - `contact` (text, admin-managed vendor contact)
  - `rating` (numeric)
  - `item_count` (integer, displayed stall count)
  - `verified` (boolean)
  - `cover_image_url` (text, optional uploaded cover image)
  - `created_at` (timestamptz)
- `stall_products`
  - `id` (uuid, primary key)
  - `stall_id` (uuid, foreign key to `stalls`)
  - `name` (text)
  - `price` (numeric, nullable when price varies)
  - `price_varies` (boolean)
  - `unit` (text)
  - `category` (text)
  - `description` (text)
  - `image_url` (text, optional product picture or data URL)
  - `vendor_key_hash` (text, private edit/delete credential hash)
  - `created_at` (timestamptz)

3. Seeded data
- Creates the Jossy stall with its admin-managed contact, Ifite Awka location,
  Cakes / Small Chops / Kitchen Hub category, 4.9 rating, 32 items, and verified status.
- Creates five initial catalog items: Celebration Cake, Small Chops Box, Chin Chin,
  Wedding Cake, and Birthday Cake. Their prices start as "Price Varies" until the vendor sets them.

4. Security
- RLS is enabled on both tables.
- Public visitors can read stall and product display columns.
- Direct public writes are not granted on `stall_products`.
- Public vendor mutations use SECURITY DEFINER functions that hash and compare a browser-held
  access key on the server. The private hash is not included in public SELECT grants.
- Mutation functions validate names, units, prices, descriptions, image data size, and ownership.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.stalls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand_name text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  contact text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stall_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_id uuid NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(12,2),
  price_varies boolean NOT NULL DEFAULT true,
  unit text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  vendor_key_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stall_products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.stalls TO anon, authenticated;
GRANT SELECT (id, stall_id, name, price, price_varies, unit, category, description, image_url, created_at)
  ON public.stall_products TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read stalls" ON public.stalls;
CREATE POLICY "Public can read stalls"
ON public.stalls FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Public cannot insert stalls" ON public.stalls;
CREATE POLICY "Public cannot insert stalls"
ON public.stalls FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot update stalls" ON public.stalls;
CREATE POLICY "Public cannot update stalls"
ON public.stalls FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot delete stalls" ON public.stalls;
CREATE POLICY "Public cannot delete stalls"
ON public.stalls FOR DELETE
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Public can read stall products" ON public.stall_products;
CREATE POLICY "Public can read stall products"
ON public.stall_products FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Public cannot insert stall products" ON public.stall_products;
CREATE POLICY "Public cannot insert stall products"
ON public.stall_products FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot update stall products" ON public.stall_products;
CREATE POLICY "Public cannot update stall products"
ON public.stall_products FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot delete stall products" ON public.stall_products;
CREATE POLICY "Public cannot delete stall products"
ON public.stall_products FOR DELETE
TO anon, authenticated
USING (false);

INSERT INTO public.stalls (slug, brand_name, location, category, contact, rating, item_count, verified)
VALUES (
  'jossy-cakes',
  'JOSSY CAKES AND KITCHEN HUB',
  'Ifite Awka, Anambra State',
  'Cakes / Small Chops / Kitchen Hub',
  '08161280254',
  4.9,
  32,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stall_products (stall_id, name, price_varies, unit, category, description)
SELECT s.id, item.name, true, item.unit, item.category, item.description
FROM public.stalls s
CROSS JOIN (
  VALUES
    ('Celebration Cake', 'per cake', 'Cakes', 'Custom celebration cakes made for your special moments.'),
    ('Small Chops Box', 'per box', 'Small Chops', 'Samosa, spring rolls, puff puff, and chicken in one box.'),
    ('Chin Chin', 'per pack', 'Kitchen Hub', 'Crunchy, golden chin chin for sharing or gifting.'),
    ('Wedding Cake', 'per cake', 'Cakes', 'Elegant two-tier white wedding cake made to order.'),
    ('Birthday Cake', 'per cake', 'Cakes', 'Pink drip birthday cake with a joyful custom finish.')
) AS item(name, unit, category, description)
WHERE s.slug = 'jossy-cakes'
  AND NOT EXISTS (
    SELECT 1 FROM public.stall_products existing
    WHERE existing.stall_id = s.id AND existing.name = item.name
  );

CREATE OR REPLACE FUNCTION public.create_jossy_product(
  p_access_key text,
  p_name text,
  p_price numeric,
  p_price_varies boolean,
  p_unit text,
  p_category text,
  p_description text,
  p_image_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_stall_id uuid;
  v_product_id uuid;
BEGIN
  IF p_access_key IS NULL OR length(p_access_key) < 32 THEN
    RAISE EXCEPTION 'Invalid access key';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) < 2 OR length(trim(p_name)) > 120 THEN
    RAISE EXCEPTION 'Invalid product name';
  END IF;
  IF p_unit NOT IN ('per cake', 'per box', 'per pack', 'per portion', 'per tray') THEN
    RAISE EXCEPTION 'Invalid product unit';
  END IF;
  IF p_category IS NULL OR length(trim(p_category)) < 2 OR length(trim(p_category)) > 80 THEN
    RAISE EXCEPTION 'Invalid product category';
  END IF;
  IF p_price_varies = false AND (p_price IS NULL OR p_price < 0) THEN
    RAISE EXCEPTION 'Invalid product price';
  END IF;
  IF p_price_varies = true AND p_price IS NOT NULL AND p_price < 0 THEN
    RAISE EXCEPTION 'Invalid product price';
  END IF;
  IF p_description IS NULL OR length(p_description) > 1000 THEN
    RAISE EXCEPTION 'Invalid product description';
  END IF;
  IF p_image_url IS NOT NULL AND length(p_image_url) > 2500000 THEN
    RAISE EXCEPTION 'Product picture is too large';
  END IF;

  SELECT id INTO v_stall_id FROM public.stalls WHERE slug = 'jossy-cakes';
  IF v_stall_id IS NULL THEN
    RAISE EXCEPTION 'Stall is unavailable';
  END IF;

  INSERT INTO public.stall_products (
    stall_id, name, price, price_varies, unit, category, description, image_url, vendor_key_hash
  ) VALUES (
    v_stall_id,
    trim(p_name),
    CASE WHEN p_price_varies THEN NULL ELSE p_price END,
    p_price_varies,
    p_unit,
    trim(p_category),
    trim(p_description),
    p_image_url,
    encode(digest(p_access_key, 'sha256'), 'hex')
  )
  RETURNING id INTO v_product_id;

  RETURN v_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_jossy_product(
  p_access_key text,
  p_product_id uuid,
  p_name text,
  p_price numeric,
  p_price_varies boolean,
  p_unit text,
  p_category text,
  p_description text,
  p_image_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF p_access_key IS NULL OR length(p_access_key) < 32 THEN
    RAISE EXCEPTION 'Invalid access key';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) < 2 OR length(trim(p_name)) > 120 THEN
    RAISE EXCEPTION 'Invalid product name';
  END IF;
  IF p_unit NOT IN ('per cake', 'per box', 'per pack', 'per portion', 'per tray') THEN
    RAISE EXCEPTION 'Invalid product unit';
  END IF;
  IF p_category IS NULL OR length(trim(p_category)) < 2 OR length(trim(p_category)) > 80 THEN
    RAISE EXCEPTION 'Invalid product category';
  END IF;
  IF p_price_varies = false AND (p_price IS NULL OR p_price < 0) THEN
    RAISE EXCEPTION 'Invalid product price';
  END IF;
  IF p_price_varies = true AND p_price IS NOT NULL AND p_price < 0 THEN
    RAISE EXCEPTION 'Invalid product price';
  END IF;
  IF p_description IS NULL OR length(p_description) > 1000 THEN
    RAISE EXCEPTION 'Invalid product description';
  END IF;
  IF p_image_url IS NOT NULL AND length(p_image_url) > 2500000 THEN
    RAISE EXCEPTION 'Product picture is too large';
  END IF;

  UPDATE public.stall_products
  SET name = trim(p_name),
      price = CASE WHEN p_price_varies THEN NULL ELSE p_price END,
      price_varies = p_price_varies,
      unit = p_unit,
      category = trim(p_category),
      description = trim(p_description),
      image_url = p_image_url
  WHERE id = p_product_id
    AND stall_id = (SELECT id FROM public.stalls WHERE slug = 'jossy-cakes')
    AND vendor_key_hash = encode(digest(p_access_key, 'sha256'), 'hex');

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_jossy_product(
  p_access_key text,
  p_product_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF p_access_key IS NULL OR length(p_access_key) < 32 THEN
    RAISE EXCEPTION 'Invalid access key';
  END IF;

  DELETE FROM public.stall_products
  WHERE id = p_product_id
    AND stall_id = (SELECT id FROM public.stalls WHERE slug = 'jossy-cakes')
    AND vendor_key_hash = encode(digest(p_access_key, 'sha256'), 'hex');

  RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_jossy_product(text, text, numeric, boolean, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_jossy_product(text, uuid, text, numeric, boolean, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_jossy_product(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_jossy_product(text, text, numeric, boolean, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_jossy_product(text, uuid, text, numeric, boolean, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_jossy_product(text, uuid) TO anon, authenticated;
