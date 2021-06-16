import { PanelProps } from '@grafana/data';
import React from 'react';
import { QuickLogOptions } from 'types';

interface Props extends PanelProps<QuickLogOptions> {}
interface State {
  input: string;
  multiLines: {
    [key: string]: boolean;
  };
}

interface CustomStyle {
  pattern: string;
  style: React.CSSProperties;
}

export class QuickLogPanel extends React.PureComponent<Props, State> {
  state: State = { input: '', multiLines: {} };

  constructor(props: Props) {
    super(props);
  }

  private cssTransformer(style: string[]): CustomStyle[] {
    const _nameStyles: CustomStyle[] = [];
    style.forEach((n) => {
      const _prop = n.split('||');
      const _style: any = {};
      _prop[1].split(';').forEach((css) => {
        const cssProp = css.split(':');
        _style[cssProp[0]] = cssProp[1];
      });
      _nameStyles.push({ pattern: _prop[0], style: _style });
    });
    return _nameStyles;
  }

  toggleVisibility(id: string) {
    const multiLines = { ...this.state.multiLines };
    console.log('toggleVisibility', id, this.state.multiLines[id]);
    multiLines[id] = !multiLines[id];
    this.setState({ input: this.state.input, multiLines });
  }

  multilineDisplayStatus(id: string): string {
    return this.state.multiLines[id] ? 'block' : 'none';
  }

  render() {
    const valueStyles: CustomStyle[] = this.cssTransformer(this.props.options.valueStyles);

    console.log('valueStyles val', JSON.stringify(valueStyles));
    return (
      <div style={{ display: 'flex', height: '100%', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>
        <style>{this.props.options.customCss}</style>
        {console.log('options valueStyles', this.props.options.valueStyles)}
        {this.props.data.series.map((frame) => {
          return (
            <div
              key={`ql-main-container`}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: this.props.width }}
            >
              <div style={{ display: 'flex', flexGrow: 1 }}>
                {console.log(`height change: ${this.props.height}`)}
                <div style={{ overflow: 'auto', height: this.props.height - 37, flexGrow: 1 }}>
                  {console.log(`frame.length: ${frame.length}`)}
                  {frame.fields.map((field) => {
                    console.log(field.type, field.name, field.values.get(0));
                  })}
                  {Array.from({ length: frame.length }).map((_, i) => {
                    let isVisible = true;
                    if (this.state.input.length) {
                      let line = '';
                      frame.fields.map((field) => {
                        line += ` ${JSON.stringify(field.values.get(i)).replace(/\"/g, '')}`;
                      });
                      if (!line.toLowerCase().includes(this.state.input.toLowerCase())) {
                        isVisible = false;
                      }
                    }
                    return (
                      <div
                        key={`ql-row-${i}`}
                        style={{ display: isVisible ? 'flex' : 'none', borderBottom: 'solid 1px #3d3d3d' }}
                      >
                        {frame.fields.map((field, j) => {
                          const _value = JSON.stringify(field.values.get(i)).replace(/\"/g, '').replace(/\\n/g, '\n');
                          const _valueCss = valueStyles.find((cs) => _value.includes(cs.pattern))?.style;
                          const css = _valueCss ? _valueCss : {};
                          const _className = `ql-data-element ql-name-${field.name.replace(/[@,_]/g, '-')}`;
                          css['marginRight'] = '1em';
                          css['alignItems'] = 'flex-start';
                          css['display'] = 'flex';
                          if (_value.includes('\n')) {
                            const _lines = _value.split('\n');
                            const _firstLine = _lines.shift();
                            css['flexDirection'] = 'column';
                            return (
                              <div key={`ql-data-item${i}-${j}`} className={_className} style={css}>
                                <div style={{ display: 'flex' }}>
                                  {_firstLine}
                                  <button
                                    className="ql-data-multiitem-button"
                                    title="Click to open multilines"
                                    style={{
                                      display: 'flex',
                                      backgroundColor: 'rgb(0 0 0 / 0%)',
                                      border: 'none',
                                      color: 'orange',
                                      padding: 0,
                                      marginLeft: '2em',
                                    }}
                                    onClick={() => this.toggleVisibility(`.ql-data-multiitem${i}-${j}`)}
                                  >
                                    multiline
                                  </button>
                                </div>
                                <div
                                  className={`ql-data-multiitem${i}-${j}`}
                                  style={{
                                    whiteSpace: 'pre-line',
                                    wordBreak: 'break-all',
                                    display: this.multilineDisplayStatus(`.ql-data-multiitem${i}-${j}`),
                                  }}
                                >
                                  {_lines.join('\n')}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={`ql-data-item${i}-${j}`} className={_className} style={css}>
                                {_value}
                              </div>
                            );
                          }
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: 'olive solid 1px' }}>
                <div style={{ marginRight: '1em', marginTop: '1em' }}>Quick search:</div>
                <input
                  style={{ marginTop: '1em', flexGrow: 1 }}
                  value={this.state.input}
                  onInput={(e) => this._setInput(e.target)}
                  placeholder="Type to search in the list only!"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  _setInput(target: any) {
    this.setState({ input: target.value, multiLines: this.state.multiLines });
    console.log(`new value on inputChange: ${target.value}`);
  }
}
