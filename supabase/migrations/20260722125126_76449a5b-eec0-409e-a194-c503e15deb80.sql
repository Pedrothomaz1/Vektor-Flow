
CREATE TABLE public.initiative_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_initiative_comments_initiative ON public.initiative_comments(initiative_id, created_at);

GRANT SELECT, INSERT ON public.initiative_comments TO authenticated;
GRANT ALL ON public.initiative_comments TO service_role;

ALTER TABLE public.initiative_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View comments if can see initiative BU"
ON public.initiative_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.initiatives i
    WHERE i.id = initiative_comments.initiative_id
      AND public.user_can_see_bu(auth.uid(), i.business_unit_id)
  )
);

CREATE POLICY "Insert comments if can see initiative BU"
ON public.initiative_comments FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.initiatives i
    WHERE i.id = initiative_comments.initiative_id
      AND public.user_can_see_bu(auth.uid(), i.business_unit_id)
  )
);
