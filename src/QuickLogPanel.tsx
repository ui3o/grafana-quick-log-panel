import { DataFrame, PanelProps } from '@grafana/data';
import { Button, Tooltip } from '@grafana/ui';
// import { QuickLogConfigure } from 'QuickLogConfigure';
import React from 'react';
import { QuickLogOptions } from 'types';

interface Props extends PanelProps<QuickLogOptions> {}
interface State {
  input: string;
  isLogContainerActive: boolean;
  multiLines: {
    [key: string]: boolean;
  };
}

interface CustomStyle {
  pattern: string;
  style: React.CSSProperties;
}

interface HTMLElement {
  scrollTop: number;
  offsetHeight: number;
  scrollHeight: number;
}

export class QuickLogPanel extends React.PureComponent<Props, State> {
  state: State = { input: '', multiLines: {}, isLogContainerActive: true };
  logContainer = React.createRef<HTMLDivElement>();

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

  onScroll(event: React.UIEvent<HTMLElement>) {
    if (this.props.options.valueLatestAtBottom) {
      this.setState({
        ...this.state,
        isLogContainerActive:
          event.currentTarget.scrollTop + event.currentTarget.offsetHeight === event.currentTarget.scrollHeight,
      });
    } else {
      this.setState({ ...this.state, isLogContainerActive: event.currentTarget.scrollTop === 0 });
    }
  }

  list(frame: DataFrame) {
    const valueStyles: CustomStyle[] = this.cssTransformer(this.props.options.valueStyles);
    const multilineEnabled: boolean = this.props.options.valueMultiline;
    const customMapper = this.props.options.valueMapper;
    const customMapperFunc = new Function(`return ${customMapper}`)();

    return Array.from({ length: frame.length }).map((_, i) => {
      let isVisible = true;
      if (this.state.input.length) {
        let line = '';
        frame.fields.forEach((field) => {
          line += ` ${JSON.stringify(
            customMapper
              ? customMapperFunc({
                  name: field.name,
                  val: field.values.toArray()[i],
                })
              : field.values.toArray()[i]
          ).replace(/\"/g, '')}`;
        });
        if (!line.toLowerCase().includes(this.state.input.toLowerCase())) {
          isVisible = false;
        }
      }
      return (
        <div key={`ql-row-${i}`} style={{ display: isVisible ? 'flex' : 'none', borderBottom: 'solid 1px #3d3d3d' }}>
          {frame.fields.map((field, j) => {
            const _value = JSON.stringify(
              customMapper
                ? customMapperFunc({
                    name: field.name,
                    val: field.values.toArray()[i],
                  })
                : field.values.toArray()[i]
            )
              ?.replace(/\"/g, '')
              .replace(/\\n/g, '\n');
            const _valueCss = valueStyles.find((cs) => _value?.includes(cs.pattern))?.style;
            const css = _valueCss ? _valueCss : {};
            const _className = `ql-data-element ql-name-${field.name.replace(/[@,_,.]/g, '-')}`;
            css['marginRight'] = '1em';
            css['alignItems'] = 'flex-start';
            css['display'] = 'flex';
            if (_value?.includes('\n') && multilineEnabled) {
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
    });
  }

  componentDidUpdate() {
    this.props.options.valueLatestAtBottom &&
      this.state.isLogContainerActive &&
      this.logContainer.current?.scroll({
        top: this.logContainer.current?.scrollHeight,
        behavior: 'smooth',
      });
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
                <div
                  style={{ overflow: 'auto', height: this.props.height - 37, flexGrow: 1 }}
                  onScroll={this.onScroll.bind(this)}
                  ref={this.logContainer}
                >
                  {console.log(`frame.length: ${frame.length}`)}
                  {frame.fields.forEach((field) => {
                    console.log(field.type, field.name, field.values.get(0));
                  })}
                  {this.props.options.valueLatestAtBottom ? this.list(frame).reverse() : this.list(frame)}
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: 'olive solid 1px', alignItems: 'center' }}>
                <Tooltip content="Jump to latest log">
                  <Button
                    icon={this.props.options.valueLatestAtBottom ? 'arrow-down' : 'arrow-up'}
                    size="sm"
                    disabled={this.state.isLogContainerActive}
                    variant="destructive"
                    className="ql-button-scroll-top"
                    onClick={() => {
                      console.log('scroll', this.logContainer.current);
                      if (this.props.options.valueLatestAtBottom) {
                        this.logContainer.current?.scroll({
                          top: this.logContainer.current?.scrollHeight,
                          behavior: 'smooth',
                        });
                      } else {
                        this.logContainer.current?.scroll({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  />
                </Tooltip>
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
    this.setState({
      ...this.state,
      input: target.value,
      multiLines: this.state.multiLines,
      isLogContainerActive: true,
    });
    console.log(`new value on inputChange: ${target.value}`);
  }
}
