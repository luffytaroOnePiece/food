import { useEffect, useRef } from 'react';
import { useBuilderStore } from '@store/builderStore';

/** Auto-loads draft on mount and auto-saves on every state change (debounced). */
export function useLocalDraft() {
  const loadDraft = useBuilderStore((s) => s.loadDraft);
  const saveDraft = useBuilderStore((s) => s.saveDraft);
  const meta = useBuilderStore((s) => s.meta);
  const stages = useBuilderStore((s) => s.stages);
  const loaded = useRef(false);

  // Load once on mount
  useEffect(() => {
    loadDraft();
    loaded.current = true;
  }, [loadDraft]);

  // Auto-save debounced
  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => saveDraft(), 500);
    return () => clearTimeout(timer);
  }, [meta, stages, saveDraft]);
}
