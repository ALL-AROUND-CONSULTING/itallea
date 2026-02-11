
-- Water logs table
CREATE TABLE public.water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_ml integer NOT NULL DEFAULT 250,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs" ON public.water_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own water logs" ON public.water_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own water logs" ON public.water_logs FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_water_logs_user_date ON public.water_logs (user_id, logged_at);

-- Weight logs table
CREATE TABLE public.weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weight_kg numeric NOT NULL,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, logged_at)
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs" ON public.weight_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own weight logs" ON public.weight_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own weight logs" ON public.weight_logs FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_weight_logs_user_date ON public.weight_logs (user_id, logged_at);
