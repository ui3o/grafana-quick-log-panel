export interface Dashboard {
  meta: Meta;
  dashboard: DashB;
}

export interface DashB {
  annotations: Annotations;
  editable: boolean;
  gnetId: null;
  graphTooltip: number;
  id: number;
  links: any[];
  panels: Panel[];
  refresh: string;
  schemaVersion: number;
  style: string;
  tags: string[];
  templating: Annotations;
  time: Time;
  timepicker: Timepicker;
  timezone: string;
  title: string;
  uid: string;
  version: number;
  _changed_: boolean;
}

export interface Annotations {
  list: List[];
}

export interface List {
  builtIn: number;
  datasource: string;
  enable: boolean;
  hide: boolean;
  iconColor: string;
  name: string;
  type: string;
}

export interface Panel {
  datasource: null;
  fieldConfig: FieldConfig;
  gridPos: GridPos;
  id: number;
  options: Options;
  pluginVersion: string;
  targets: Target[];
  title: string;
  type: string;
  _visible_: boolean;
  _name_: string;
  _dashboardUid_: string;
}

export interface FieldConfig {
  defaults: Defaults;
  overrides: any[];
}

export interface Defaults {
  custom: Timepicker;
}

export interface Timepicker {}

export interface GridPos {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface Options {
  customCss: string;
  valueStyles: any[];
}

export interface Target {
  alias: string;
  bucketAggs: BucketAgg[];
  metrics: Metric[];
  query: string;
  refId: string;
  timeField: string;
}

export interface BucketAgg {
  id: string;
  settings: Settings;
  type: string;
}

export interface Settings {
  interval: string;
}

export interface Metric {
  id: string;
  type: string;
}

export interface Time {
  from: string;
  to: string;
}

export interface Meta {
  type: string;
  canSave: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canStar: boolean;
  slug: string;
  url: string;
  expires: Date;
  created: Date;
  updated: Date;
  updatedBy: string;
  createdBy: string;
  version: number;
  hasAcl: boolean;
  isFolder: boolean;
  folderId: number;
  folderTitle: string;
  folderUrl: string;
  provisioned: boolean;
  provisionedExternalId: string;
}
