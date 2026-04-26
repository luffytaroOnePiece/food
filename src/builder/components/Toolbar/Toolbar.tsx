import { useState, useCallback } from 'react';
import { Save, Download, Eye, Trash2, Check, AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import { Button } from '@shared/ui/Button/Button';
import { PreviewModal } from '../../PreviewModal/PreviewModal';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const meta = useBuilderStore((s) => s.meta);
  const saveToServer = useBuilderStore((s) => s.saveToServer);
  const exportJSON = useBuilderStore((s) => s.exportJSON);
  const clearCanvas = useBuilderStore((s) => s.clearCanvas);
  const [showPreview, setShowPreview] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [exportFlash, setExportFlash] = useState(false);

  const handleSave = useCallback(async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveToServer();
    if (result.ok) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } else {
      setSaveState('error');
      setSaveError(result.error ?? 'Unknown error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [saveToServer]);

  const handleExport = useCallback(() => {
    exportJSON();
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  }, [exportJSON]);

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) {
      clearCanvas();
    }
  };

  const saveLabel = {
    idle: 'Save to Cookbook',
    saving: 'Saving…',
    saved: 'Saved!',
    error: saveError || 'Error',
  }[saveState];

  const saveIcon = {
    idle: <Save size={14} />,
    saving: <Save size={14} />,
    saved: <Check size={14} />,
    error: <AlertCircle size={14} />,
  }[saveState];

  const saveVariant = {
    idle: 'primary' as const,
    saving: 'ghost' as const,
    saved: 'ghost' as const,
    error: 'danger' as const,
  }[saveState];

  return (
    <>
      <div className={`${styles.toolbar} no-print`}>
        <div className={styles.toolbarLeft}>
          <span className={meta.name ? styles.recipeName : `${styles.recipeName} ${styles.untitled}`}>
            {meta.name || 'Untitled Recipe'}
          </span>
          <span className={styles.autoSave}>
            <span className={styles.dot} />
            Auto-draft
          </span>
        </div>

        <div className={styles.toolbarRight}>
          <Button
            variant={saveVariant}
            size="sm"
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            {saveIcon}
            {saveLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
            <Eye size={14} />
            Preview
          </Button>
          <Button variant={exportFlash ? 'ghost' : 'secondary'} size="sm" onClick={handleExport}>
            {exportFlash ? <Check size={14} /> : <Download size={14} />}
            {exportFlash ? 'Downloaded!' : 'Export JSON'}
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear}>
            <Trash2 size={14} />
            Clear
          </Button>
        </div>
      </div>

      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} />
    </>
  );
}
