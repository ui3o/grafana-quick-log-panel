import React from 'react';
import { Button } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { QuickLogConfigure } from 'QuickLogConfigure';

export const SimpleEditor: React.FC<StandardEditorProps<boolean>> = ({ value, onChange, item, context }) => {
  const [configureOpen, setConfigureOpen] = React.useState<boolean>();

  console.log(item, context);
  return (
    <div>
      <Button
        onClick={() => {
          setConfigureOpen(true);
        }}
      >
        Migrate
      </Button>
      {configureOpen && <QuickLogConfigure onClose={() => setConfigureOpen(false)} context={context} />}
    </div>
  );
};
