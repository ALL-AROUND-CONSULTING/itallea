
-- Devices table for scale pairing
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hardware_device_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  serial_number TEXT,
  paired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
CREATE POLICY "Users can view own devices"
  ON public.devices FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert (pair) their own devices
CREATE POLICY "Users can insert own devices"
  ON public.devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update own devices (e.g. deactivate)
CREATE POLICY "Users can update own devices"
  ON public.devices FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete own devices (unpair)
CREATE POLICY "Users can delete own devices"
  ON public.devices FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all devices
CREATE POLICY "Admins can view all devices"
  ON public.devices FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
