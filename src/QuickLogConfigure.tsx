import { StandardEditorContext } from '@grafana/data';
import {
  Alert,
  AlertVariant,
  Checkbox,
  Drawer,
  HorizontalGroup,
  Icon,
  Input,
  ToolbarButton,
  ToolbarButtonRow,
  VerticalGroup,
} from '@grafana/ui';
import { Dashboard, Panel } from 'dto/dashboard.dto';
import { Dashboards } from 'dto/dashboards.dto';
import React from 'react';

interface Props {
  onClose: () => void;
  context: StandardEditorContext<any>;
}
interface State {
  saveStatus?: {
    visible?: boolean;
    severity?: AlertVariant;
    title?: string;
  };
  filter: string;
  saveInProgress?: boolean;
  showEqualsOnly?: boolean;
  isOpen?: boolean;
  dashboards: Dashboard[];
  panels: Panel[];
}

export class QuickLogConfigure extends React.PureComponent<Props, State> {
  state: State = {
    filter: '',
    dashboards: [],
    panels: [],
  };
  prefixEl = (<Icon name="filter" />);

  constructor(props: Props) {
    super(props);
    console.log('QuickLogConfigure const.');
  }

  async componentDidMount() {
    await this.initialize();
  }

  async initialize() {
    this.setState({ ...this.state, dashboards: [], panels: [] });
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
              _panel._equal_ = JSON.stringify(_panel.options) === JSON.stringify(this.props.context.options);
              _panel._marked_ = false;
              _panel._visible_ = !_panel._equal_;
              _panel._name_ = `${dashboard.meta?.folderTitle}/${dashboard.dashboard.title}/${_panel.title}`;
              _panel._id_ = `${dashboard.meta?.folderTitle}/${dashboard.dashboard.title}/${_panel.id}`;
              _panel._dashboardUid_ = dashboard.dashboard.uid;
              dashboard.folderId = dashboard.meta?.folderId;
              dashboard.folderUid = dashboard.meta?.folderUid;
              dashboard.overwrite = true;
              dashboard.message = 'ui3o-quicklog-panel setting update';
              this.setState({
                ...this.state,
                panels: [...this.state.panels, _panel],
              });
            }
          });
          this.setState({
            ...this.state,
            dashboards: [...this.state.dashboards, dashboard],
          });
        }
      }
    });
  }

  toggleModal() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  setPanelToEqual(panel: Panel) {
    panel._marked_ = !panel._marked_;
    const _panels = [...this.state.panels];
    const _index = _panels.findIndex((p) => p._id_ === panel._id_);
    _panels[_index] = { ...panel };
    this.setState({
      ...this.state,
      panels: _panels,
    });
    console.log(panel);
  }

  render() {
    return (
      <Drawer
        title="Migrate"
        subtitle="Migrate current QuickLog Panel Settings to other Dashboard panels"
        closeOnMaskClick={true}
        scrollableContent={true}
        width="40%"
        onClose={() => {
          this.props.onClose();
        }}
      >
        {this.state.saveStatus?.visible && (
          <Alert
            title={this.state.saveStatus.title ? this.state.saveStatus.title : ''}
            severity={this.state.saveStatus.severity}
            onRemove={() => {
              this.setState({ ...this.state, saveStatus: { visible: false } });
            }}
          />
        )}
        <VerticalGroup>
          <Input
            prefix={this.prefixEl}
            type="text"
            placeholder="Type to filter "
            value={this.state.filter}
            onInput={(e) => this._setInput(e.target)}
            disabled={this.state.saveInProgress}
          />
          <HorizontalGroup justify="flex-end">
            <ToolbarButtonRow>
              <ToolbarButton
                icon={this.state.showEqualsOnly ? 'arrow-random' : 'exchange-alt'}
                tooltip={
                  this.state.showEqualsOnly
                    ? 'Show only panels with not the same options'
                    : 'Show only panels with same options'
                }
                onClick={() => this.toggleEqualsOnly()}
                disabled={this.state.saveInProgress}
              >
                {this.state.showEqualsOnly ? 'Distinct' : 'Equal'}
              </ToolbarButton>
              <ToolbarButton
                icon={this.isMarkedAny() ? 'circle' : 'check-circle'}
                tooltip="Select for changes only filtered"
                variant="active"
                disabled={this.state.showEqualsOnly || this.state.saveInProgress}
                onClick={() => this.toggleMarkAll()}
              >
                {this.isMarkedAny() ? 'Deselect all' : 'Select all'}
              </ToolbarButton>
              <ToolbarButton
                icon={this.state.saveInProgress ? 'fa fa-spinner' : 'cloud-upload'}
                tooltip="Save changes"
                variant="primary"
                onClick={() => this.save()}
                disabled={this.state.showEqualsOnly || !this.isAnyChanged() || this.state.saveInProgress}
              >
                Save
              </ToolbarButton>
            </ToolbarButtonRow>
          </HorizontalGroup>
          <div style={{ paddingLeft: '1em' }}>
            <VerticalGroup>
              {this.state.panels.map((p) => {
                return (
                  <div style={{ display: p._visible_ ? 'block' : 'none' }}>
                    <Checkbox
                      key={p._id_}
                      value={p._equal_ ? true : p._marked_}
                      onChange={() => {
                        this.setPanelToEqual(p);
                      }}
                      label={p._name_}
                      disabled={p._equal_ || this.state.saveInProgress}
                    />
                  </div>
                );
              })}
            </VerticalGroup>
          </div>
        </VerticalGroup>
      </Drawer>
    );
  }

  async save() {
    this.setState({ ...this.state, saveInProgress: true });
    const _dashboards = [...this.state.dashboards];
    this.state.panels.forEach((p) => {
      if (!p._equal_ && p._marked_) {
        _dashboards.forEach((d) => {
          if (d.dashboard.uid === p._dashboardUid_) {
            d.dashboard.panels.forEach((dp) => {
              if (dp.id === p.id) {
                dp.options = { ...this.props.context.options };
                d._changed_ = true;
              }
            });
          }
        });
      }
    });
    console.log('save start', _dashboards);
    const _changes = _dashboards.filter((d) => d._changed_);
    for (const d of _changes) {
      const _d = { ...d };
      delete _d.meta;
      delete _d._changed_;
      await fetch(`./api/dashboards/db`, {
        method: 'post',
        body: JSON.stringify(_d),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    this.setState({
      ...this.state,
      saveInProgress: false,
      saveStatus: { title: 'Save: Success', severity: 'success', visible: true },
    });
    console.log('save done', _changes);
    await this.initialize();
  }

  isAnyChanged(): boolean {
    return this.state.panels.some((p) => p._marked_);
  }

  isMarkedAny(): boolean {
    return this.state.panels.some((p) => p._marked_ && p._visible_);
  }

  toggleMarkAll(): void {
    const _panels = [...this.state.panels];
    const _isMarkedAny = this.isMarkedAny();
    _panels.forEach((p) => {
      if (p._visible_) {
        p._marked_ = !_isMarkedAny;
      }
    });
    this.setState({
      ...this.state,
      panels: _panels,
    });
  }

  _setInput(target: any) {
    const _input: string = target.value;
    const _panels = [...this.state.panels];
    _panels.forEach((p) => {
      if (!_input.length || p._name_.toLowerCase().includes(_input.toLowerCase())) {
        p._visible_ = this.state.showEqualsOnly ? p._equal_ : !p._equal_;
      } else {
        p._visible_ = false;
      }
    });
    this.setState({
      ...this.state,
      filter: _input,
      panels: _panels,
    });
    console.log(`new value on inputChange: ${target.value}`);
  }

  toggleEqualsOnly() {
    const _panels = [...this.state.panels];
    const _equalsOnly = !this.state.showEqualsOnly;
    _panels.forEach((p) => {
      p._visible_ = _equalsOnly ? p._equal_ : !p._equal_;
      if (this.state.filter.length && !p._name_.toLowerCase().includes(this.state.filter.toLowerCase())) {
        p._visible_ = false;
      }
    });
    this.setState({
      ...this.state,
      showEqualsOnly: _equalsOnly,
      panels: _panels,
    });
    console.log(`toggleEqualsOnly: ${_equalsOnly}`);
  }
}
