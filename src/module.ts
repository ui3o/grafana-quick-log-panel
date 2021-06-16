import { PanelPlugin } from '@grafana/data';
import { QuickLogOptions } from './types';
import { QuickLogPanel } from './QuickLogPanel';

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
    });
});
