import { Drawer, IconButton, Input } from '@grafana/ui';
import { Dashboard, Panel } from 'dto/dashboard.dto';
import { Dashboards } from 'dto/dashboards.dto';
import React from 'react';

interface Props {
  onClose: () => void;
}
interface State {
  isOpen: boolean;
  dashboards: Dashboard[];
  panels: Panel[];
}

export class QuickLogConfigure extends React.PureComponent<Props, State> {
  state: State = {
    isOpen: false,
    dashboards: [],
    panels: [],
  };

  constructor(props: Props) {
    super(props);
    console.log('QuickLogConfigure const.');
  }

  addPanel(panel: Panel) {
    this.setState({
      isOpen: this.state.isOpen,
      dashboards: this.state.dashboards,
      panels: [...this.state.panels, panel],
    });
  }

  addDashboards(dashboard: Dashboard) {
    this.setState({
      isOpen: this.state.isOpen,
      dashboards: [...this.state.dashboards, dashboard],
      panels: this.state.panels,
    });
  }

  async componentDidMount() {
    const response = await fetch(`./api/search?limit=5000`);
    const dashboards: Dashboards[] = await response.json();
    dashboards.forEach(async (d) => {
      if (d.type === 'dash-db') {
        const _boardProp = await fetch(`./api/dashboards/uid/${d.uid}`);
        const dashboard: Dashboard = await _boardProp.json();
        if (dashboard.dashboard.panels.some((p) => p.type === 'ui3o-quicklog-panel')) {
          dashboard.dashboard.panels.forEach((p) => {
            const _panel: Panel = { ...p };
            if (_panel.type === 'ui3o-quicklog-panel') {
              _panel._visible_ = true;
              _panel._name_ = `${dashboard.meta.folderTitle}/${dashboard.dashboard.title}/${_panel.title}`;
              _panel._dashboardUid_ = dashboard.dashboard.uid;
              this.addPanel(_panel);
            }
          });
          this.addDashboards(dashboard);
        }
      }
    });
  }

  toggleModal() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  setPanelToEqual(panel: Panel) {
    panel._visible_ = !panel._visible_;
    const _panels = [...this.state.panels];
    const _index = _panels.findIndex((p) => p._name_ === panel._name_);
    _panels[_index] = { ...panel };
    this.setState({
      isOpen: this.state.isOpen,
      dashboards: this.state.dashboards,
      panels: _panels,
    });
    console.log(panel);
  }

  render() {
    console.log('config mode');
    return (
      <Drawer
        title="Migrate"
        subtitle="Migrate current QuickLog Panel Settings to other Dashboard panels"
        closeOnMaskClick={false}
        scrollableContent={true}
        width="40%"
        onClose={() => {
          this.props.onClose();
        }}
      >
        <div style={{ padding: '10px' }}>
          <Input prefix="text" type="text" placeholder="Type to filter " />
          <ul>
            {this.state.panels.map((p) => {
              return (
                <li key={p._name_}>
                  <IconButton
                    style={{ color: 'green' }}
                    name={p._visible_ ? 'circle' : 'check-circle'}
                    size="sm"
                    onClick={() => {
                      this.setPanelToEqual(p);
                    }}
                  />
                  {p._name_}
                </li>
              );
            })}
          </ul>
        </div>
      </Drawer>
    );
  }
}
// <div style={{ display: 'flex', height: '100%', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>
//   <style>{this.props.options.customCss}</style>
// </div>
// {console.log('options valueStyles', this.props.options.valueStyles)}
// <div
//   key={`ql-main-container`}
//   style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: this.props.width }}
// >
//   <div style={{ display: 'flex', flexGrow: 1 }}>
//     {console.log(`height change: ${this.props.height}`)}
//     <div style={{ overflow: 'auto', height: this.props.height - 37, flexGrow: 1 }}>
//       {console.log(`frame.length: ${frame.length}`)}
//       {frame.fields.map((field) => {
//         console.log(field.type, field.name, field.values.get(0));
//       })}
//       {Array.from({ length: frame.length }).map((_, i) => {
//         let isVisible = true;
//         if (this.state.input.length) {
//           let line = '';
//           frame.fields.map((field) => {
//             line += ` ${JSON.stringify(field.values.get(i)).replace(/\"/g, '')}`;
//           });
//           if (!line.toLowerCase().includes(this.state.input.toLowerCase())) {
//             isVisible = false;
//           }
//         }
//         return (
//           <div
//             key={`ql-row-${i}`}
//             style={{ display: isVisible ? 'flex' : 'none', borderBottom: 'solid 1px #3d3d3d' }}
//           >
//             {frame.fields.map((field, j) => {
//               const _value = JSON.stringify(field.values.get(i)).replace(/\"/g, '').replace(/\\n/g, '\n');
//               const _valueCss = valueStyles.find((cs) => _value.includes(cs.pattern))?.style;
//               const css = _valueCss ? _valueCss : {};
//               const _className = `ql-data-element ql-name-${field.name.replace(/[@,_]/g, '-')}`;
//               css['marginRight'] = '1em';
//               css['alignItems'] = 'flex-start';
//               css['display'] = 'flex';
//               if (_value.includes('\n')) {
//                 const _lines = _value.split('\n');
//                 const _firstLine = _lines.shift();
//                 css['flexDirection'] = 'column';
//                 return (
//                   <div key={`ql-data-item${i}-${j}`} className={_className} style={css}>
//                     <div style={{ display: 'flex' }}>
//                       {_firstLine}
//                       <button
//                         className="ql-data-multiitem-button"
//                         title="Click to open multilines"
//                         style={{
//                           display: 'flex',
//                           backgroundColor: 'rgb(0 0 0 / 0%)',
//                           border: 'none',
//                           color: 'orange',
//                           padding: 0,
//                           marginLeft: '2em',
//                         }}
//                         onClick={() => this.toggleVisibility(`.ql-data-multiitem${i}-${j}`)}
//                       >
//                         multiline
//                       </button>
//                     </div>
//                     <div
//                       className={`ql-data-multiitem${i}-${j}`}
//                       style={{
//                         whiteSpace: 'pre-line',
//                         wordBreak: 'break-all',
//                         display: this.multilineDisplayStatus(`.ql-data-multiitem${i}-${j}`),
//                       }}
//                     >
//                       {_lines.join('\n')}
//                     </div>
//                   </div>
//                 );
//               } else {
//                 return (
//                   <div key={`ql-data-item${i}-${j}`} className={_className} style={css}>
//                     {_value}
//                   </div>
//                 );
//               }
//             })}
//           </div>
//         );
//       })}
//     </div>
//   </div>
//   <div style={{ display: 'flex', borderTop: 'olive solid 1px' }}>
//     <div style={{ marginRight: '1em', marginTop: '1em' }}>Quick search:</div>
//     <input
//       style={{ marginTop: '1em', flexGrow: 1 }}
//       value={this.state.input}
//       onInput={(e) => this._setInput(e.target)}
//       placeholder="Type to search in the list only!"
//     />
//   </div>
// </div>
