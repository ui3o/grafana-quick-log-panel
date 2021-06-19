import { PanelPlugin } from '@grafana/data';
import { QuickLogOptions } from './types';
import { QuickLogPanel } from './QuickLogPanel';
import { SimpleEditor } from 'SimpleEditor';

export const plugin = new PanelPlugin<QuickLogOptions>(QuickLogPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      name: 'Custom css',
      path: 'customCss',
      description: 'Paste your inline custom css.',
      defaultValue: '',
    })
    .addStringArray({
      name: 'Value include list',
      path: 'valueStyles',
      description: 'It search for text include. Separator is "||". e.g: foo bar||color: red',
      defaultValue: [],
    })
    .addCustomEditor({
      id: 'label',
      path: 'label',
      name: 'Migrate current panel',
      editor: SimpleEditor,
    });
});
