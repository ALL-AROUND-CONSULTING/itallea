
-- Notifications table for admin-sent notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  url TEXT,
  sent_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_to_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Product submissions table for user-submitted corrections
CREATE TABLE public.product_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  barcode TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  kcal_per_100g NUMERIC NOT NULL DEFAULT 0,
  protein_per_100g NUMERIC NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC NOT NULL DEFAULT 0,
  fat_per_100g NUMERIC NOT NULL DEFAULT 0,
  fiber_per_100g NUMERIC NOT NULL DEFAULT 0,
  salt_per_100g NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;

-- Users can submit and view their own submissions
CREATE POLICY "Users can insert own submissions"
  ON public.product_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own submissions"
  ON public.product_submissions FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admins can update/delete submissions
CREATE POLICY "Admins can update submissions"
  ON public.product_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
  ON public.product_submissions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
