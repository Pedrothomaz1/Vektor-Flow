
DROP POLICY IF EXISTS "Admin/OKR master/owner can create key_results" ON public.key_results;
DROP POLICY IF EXISTS "Admin/OKR master/owner can update key_results" ON public.key_results;

CREATE POLICY "BU peers can create key_results"
ON public.key_results
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'okr_master')
  OR (
    EXISTS (
      SELECT 1 FROM public.objectives o
      WHERE o.id = objective_id
        AND public.user_can_see_bu(auth.uid(), o.business_unit_id)
    )
    AND public.user_shares_bu(auth.uid(), owner_id)
  )
);

CREATE POLICY "BU peers can update key_results"
ON public.key_results
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'okr_master')
  OR owner_id = auth.uid()
  OR (
    EXISTS (
      SELECT 1 FROM public.objectives o
      WHERE o.id = objective_id
        AND public.user_can_see_bu(auth.uid(), o.business_unit_id)
    )
    AND public.user_shares_bu(auth.uid(), owner_id)
  )
);
