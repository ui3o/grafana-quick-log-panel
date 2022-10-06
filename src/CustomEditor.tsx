import { StandardEditorProps } from '@grafana/data';
import { Icon, Modal, ToolbarButton } from '@grafana/ui';
import { Dashboard } from 'dto/dashboard.dto';
import { QuickLogConfigure } from 'QuickLogConfigure';
import React from 'react';
import _ from 'lodash';

export const isEqualsExistsKeys = (src: any, dest: any) => {
  const srcKeys = Object.keys(src);
  const destKeys = Object.keys(dest);
  for (const k of srcKeys) {
    if (destKeys.some((d) => d === k) && !_.isEqual(src[k], dest[k])) {
      return false;
    }
  }
  return true;
};

export const CustomEditor: React.FC<StandardEditorProps<boolean>> = ({ value, onChange, item, context }) => {
  const [configureOpen, setConfigureOpen] = React.useState<boolean>();
  const [modalVisible, setModalVisible] = React.useState<boolean>();

  const getDashboard = async () => {
    console.log('getDashboard');
    if (location.pathname.includes('/d/')) {
      const _uid = location.pathname.split('/d/')[1].split('/')[0];
      const _panelId = Number(new URLSearchParams(window.location.search).get('editPanel'));
      const _boardProp = await fetch(`./api/dashboards/uid/${_uid}`);
      const dashboard: Dashboard = await _boardProp.json();
      const _panel = dashboard.dashboard.panels.filter((p) => p.id === _panelId)[0];
      if (!isEqualsExistsKeys(_panel.options, context.options)) {
        setModalVisible(true);
      } else {
        setConfigureOpen(true);
      }
    } else {
      setModalVisible(true);
    }
  };

  return (
    <div>
      <ToolbarButton icon="share-alt" variant="primary" onClick={getDashboard}>
        Share
      </ToolbarButton>
      <Modal
        title={
          <div className="modal-header-title">
            <Icon name="exclamation-triangle" size="lg" />
            <span className="p-l-1">Warning</span>
          </div>
        }
        onDismiss={() => setModalVisible(false)}
        isOpen={modalVisible}
      >
        You have unsaved changes. Please save your dashboard changes before share!
      </Modal>
      {configureOpen && <QuickLogConfigure onClose={() => setConfigureOpen(false)} context={context} />}
    </div>
  );
};
