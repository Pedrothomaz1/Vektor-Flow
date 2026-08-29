ALTER TABLE public.cycles
  ADD COLUMN IF NOT EXISTS parent_cycle_id uuid REFERENCES public.cycles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS period_type text NOT NULL DEFAULT 'annual';

ALTER TABLE public.cycles
  ADD CONSTRAINT cycles_period_type_check CHECK (period_type IN ('annual','quarterly'));

CREATE INDEX IF NOT EXISTS idx_cycles_parent_cycle_id ON public.cycles(parent_cycle_id);