CREATE POLICY "BU peers can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.user_shares_bu(auth.uid(), id));