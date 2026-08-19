CREATE OR REPLACE FUNCTION public.can_view_kr(_kr_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.key_results kr
    JOIN public.objectives o ON o.id = kr.objective_id
    WHERE kr.id = _kr_id AND public.user_can_see_bu(auth.uid(), o.business_unit_id)
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_kr(_kr_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.key_results kr
    WHERE kr.id = _kr_id
      AND (kr.owner_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'okr_master'))
  )
$$;

REVOKE EXECUTE ON FUNCTION public.can_view_kr(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_kr(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_view_kr(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_kr(uuid) TO authenticated;

CREATE TABLE public.kr_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id uuid NOT NULL REFERENCES public.key_results(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  content_type text,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_kr_attachments_kr ON public.kr_attachments(key_result_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.kr_attachments TO authenticated;
GRANT ALL ON public.kr_attachments TO service_role;

ALTER TABLE public.kr_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View KR attachments with KR access"
ON public.kr_attachments FOR SELECT TO authenticated
USING (public.can_view_kr(key_result_id));

CREATE POLICY "KR editors can add attachments"
ON public.kr_attachments FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() AND public.can_edit_kr(key_result_id));

CREATE POLICY "KR editors can delete attachments"
ON public.kr_attachments FOR DELETE TO authenticated
USING (public.can_edit_kr(key_result_id));

CREATE POLICY "Read kr-attachment files with KR access"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kr-attachments' AND public.can_view_kr(((storage.foldername(name))[1])::uuid));

CREATE POLICY "KR editors can upload kr-attachment files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kr-attachments' AND public.can_edit_kr(((storage.foldername(name))[1])::uuid));

CREATE POLICY "KR editors can delete kr-attachment files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kr-attachments' AND public.can_edit_kr(((storage.foldername(name))[1])::uuid));