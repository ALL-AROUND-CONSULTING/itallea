
-- Custom recipe categories per user
CREATE TABLE public.user_recipe_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🍽️',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique category name per user
CREATE UNIQUE INDEX idx_user_recipe_categories_unique ON public.user_recipe_categories (user_id, name);

ALTER TABLE public.user_recipe_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON public.user_recipe_categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own categories" ON public.user_recipe_categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own categories" ON public.user_recipe_categories FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Users can update own categories" ON public.user_recipe_categories FOR UPDATE USING (user_id = auth.uid());
