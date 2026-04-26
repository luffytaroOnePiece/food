import { useLocalDraft } from '@hooks/useLocalDraft';
import { Canvas } from './components/Canvas/Canvas';
import { MetaPanel } from './components/MetaPanel/MetaPanel';
import { Toolbar } from './components/Toolbar/Toolbar';

const builderPageStyles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 56px)',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  canvasArea: {
    flex: 1,
    overflow: 'auto',
  },
};

export default function BuilderPage() {
  useLocalDraft();

  return (
    <div style={builderPageStyles.page}>
      <Toolbar />
      <div style={builderPageStyles.body}>
        <div style={builderPageStyles.canvasArea}>
          <Canvas />
        </div>
        <MetaPanel />
      </div>
    </div>
  );
}
