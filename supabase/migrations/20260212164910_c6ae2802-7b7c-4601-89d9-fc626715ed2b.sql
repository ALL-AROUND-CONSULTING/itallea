
-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Primi',
  servings INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_product_id UUID REFERENCES public.user_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  grams NUMERIC NOT NULL DEFAULT 0,
  kcal NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipes
CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for recipe_ingredients (via recipe ownership)
CREATE POLICY "Users can view own recipe ingredients"
  ON public.recipe_ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own recipe ingredients"
  ON public.recipe_ingredients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own recipe ingredients"
  ON public.recipe_ingredients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own recipe ingredients"
  ON public.recipe_ingredients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()
  ));

-- Trigger for updated_at on recipes
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
