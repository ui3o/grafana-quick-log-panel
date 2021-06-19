import React from 'react';
import { Button } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { QuickLogConfigure } from 'QuickLogConfigure';

export const SimpleEditor: React.FC<StandardEditorProps<boolean>> = ({ value, onChange }) => {
  const [configureOpen, setConfigureOpen] = React.useState<boolean>();

  return (
    <div>
      <Button
        onClick={() => {
          setConfigureOpen(true);
        }}
      >
        Migrate
      </Button>
      {configureOpen && <QuickLogConfigure onClose={() => setConfigureOpen(false)} />}
    </div>
  );
};
