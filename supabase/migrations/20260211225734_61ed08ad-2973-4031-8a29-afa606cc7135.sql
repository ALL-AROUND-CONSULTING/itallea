
-- Step B1: Tabelle per tracking nutrizionale

-- 1. Prodotti database centrale
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT UNIQUE,
  kcal_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  protein_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fiber_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  salt_per_100g NUMERIC(6,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'openfoodfacts', 'ocr')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Prodotti personali utente
CREATE TABLE public.user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  kcal_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  protein_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fiber_per_100g NUMERIC(6,1) NOT NULL DEFAULT 0,
  salt_per_100g NUMERIC(6,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Pesate (log alimentare)
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

CREATE TABLE public.weighings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_product_id UUID REFERENCES public.user_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  grams NUMERIC(6,1) NOT NULL,
  meal_type meal_type NOT NULL,
  kcal NUMERIC(7,1) NOT NULL DEFAULT 0,
  protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat NUMERIC(6,1) NOT NULL DEFAULT 0,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_ref_check CHECK (product_id IS NOT NULL OR user_product_id IS NOT NULL)
);

-- 4. Indici
CREATE INDEX idx_weighings_user_date ON public.weighings (user_id, logged_at);
CREATE INDEX idx_weighings_meal ON public.weighings (user_id, logged_at, meal_type);
CREATE INDEX idx_products_barcode ON public.products (barcode);
CREATE INDEX idx_user_products_user ON public.user_products (user_id);

-- 5. Trigger updated_at su user_products
CREATE TRIGGER update_user_products_updated_at
  BEFORE UPDATE ON public.user_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS products (leggibile da tutti gli autenticati, inserimento solo admin o sistema)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. RLS user_products (CRUD solo proprietario)
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON public.user_products FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products"
  ON public.user_products FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products"
  ON public.user_products FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products"
  ON public.user_products FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 8. RLS weighings (CRUD solo proprietario)
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weighings"
  ON public.weighings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own weighings"
  ON public.weighings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own weighings"
  ON public.weighings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own weighings"
  ON public.weighings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
