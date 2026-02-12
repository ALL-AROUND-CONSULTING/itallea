
CREATE TABLE public.device_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  profile_index integer NOT NULL DEFAULT 1,
  name text NOT NULL DEFAULT 'Profilo 1',
  linked_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, profile_index)
);

ALTER TABLE public.device_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device owner can view profiles"
  ON public.device_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can insert profiles"
  ON public.device_profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can update profiles"
  ON public.device_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can delete profiles"
  ON public.device_profiles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

ALTER TABLE public.weighings
  ADD COLUMN device_profile_id uuid REFERENCES public.device_profiles(id);
