/*
# Create vendor_applications table (single-tenant, no auth)

1. Purpose
- Stores stall rental applications submitted from the "Rent Your Online Stall" page.
- The app has no sign-in, so submissions are anonymous public leads.

2. New Tables
- `vendor_applications`
  - `id` (uuid, primary key)
  - `stall_name` (text, not null) — name of the online stall
  - `owner_name` (text, not null) — person running the stall
  - `phone` (text, not null) — WhatsApp/contact phone number
  - `market` (text, not null) — market where the vendor operates
  - `area` (text, not null) — area / location within the market or town
  - `sells` (text, not null) — description of what the vendor sells
  - `status` (text, not null, default 'pending') — application state for the operator
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS on `vendor_applications`.
- Grant INSERT to `anon, authenticated` (visitors submit the form).
- No SELECT/UPDATE/DELETE grants to anon/authenticated: submissions are write-only
  for the public; the operator reads them with the service role.
- Policies scoped TO anon, authenticated for the insert only.
*/

CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  market text NOT NULL,
  area text NOT NULL,
  sells text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

GRANT INSERT (stall_name, owner_name, phone, market, area, sells) ON vendor_applications TO anon, authenticated;

DROP POLICY IF EXISTS "Public can submit vendor application" ON vendor_applications;
CREATE POLICY "Public can submit vendor application"
ON vendor_applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);
