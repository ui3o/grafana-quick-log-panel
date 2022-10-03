import { PanelPlugin } from '@grafana/data';
import { QuickLogOptions } from './types';
import { QuickLogPanel } from './QuickLogPanel';
import { CustomEditor } from 'CustomEditor';

export const plugin = new PanelPlugin<QuickLogOptions>(QuickLogPanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      name: 'Latest at bottom',
      path: 'valueLatestAtBottom',
      description: 'Latest at bottom or top. True means bottom.',
      defaultValue: false,
    })
    .addBooleanSwitch({
      name: 'Multiline',
      path: 'valueMultiline',
      description: 'Enable multiline collection in the log.',
      defaultValue: true,
    })
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
      name: 'Share current panel',
      description: 'Save changes before share the current settings',
      editor: CustomEditor,
    })
    .addTextInput({
      settings: { useTextarea: true },
      name: 'Custom field mapper (javascript)',
      path: 'valueMapper',
      description: 'Custom field mapper one function. E.g.: (f)=>f.name+f.val',
      defaultValue: '',
    });
});
