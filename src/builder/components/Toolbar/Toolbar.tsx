import { useState } from 'react';
import { Save, Download, Eye, Trash2 } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import { Button } from '@shared/ui/Button/Button';
import { PreviewModal } from '../../PreviewModal/PreviewModal';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const meta = useBuilderStore((s) => s.meta);
  const saveDraft = useBuilderStore((s) => s.saveDraft);
  const exportJSON = useBuilderStore((s) => s.exportJSON);
  const clearCanvas = useBuilderStore((s) => s.clearCanvas);
  const [showPreview, setShowPreview] = useState(false);

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) {
      clearCanvas();
    }
  };

  return (
    <>
      <div className={`${styles.toolbar} no-print`}>
        <div className={styles.toolbarLeft}>
          <span className={meta.name ? styles.recipeName : `${styles.recipeName} ${styles.untitled}`}>
            {meta.name || 'Untitled Recipe'}
          </span>
          <span className={styles.autoSave}>
            <span className={styles.dot} />
            Auto-saved
          </span>
        </div>

        <div className={styles.toolbarRight}>
          <Button variant="ghost" size="sm" onClick={() => saveDraft()}>
            <Save size={14} />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
            <Eye size={14} />
            Preview
          </Button>
          <Button variant="primary" size="sm" onClick={() => exportJSON()}>
            <Download size={14} />
            Export JSON
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
