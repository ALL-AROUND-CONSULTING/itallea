CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (id = auth.uid());