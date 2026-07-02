DROP POLICY IF EXISTS "Authenticated can view business_units" ON public.business_units;

CREATE POLICY "BU-aware view business_units"
ON public.business_units
FOR SELECT
TO authenticated
USING (public.user_can_see_bu(auth.uid(), id));