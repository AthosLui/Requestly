// src/popup/App.tsx
import React, { useState, useEffect } from 'react';
import { Switch, Button, Typography, Space, Spin, Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { getGlobalSwitch, setGlobalSwitch } from '@/shared/utils/storage';

const { Title, Text } = Typography;

const PopupApp: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getGlobalSwitch().then(status => {
      setEnabled(status);
      setLoading(false);
    });
  }, []);

  const handleSwitchChange = (checked: boolean) => {
    setLoading(true);
    setEnabled(checked);
    setGlobalSwitch(checked).finally(() => setLoading(false));
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <Card bordered={false} style={{ width: 300 }}>
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        <Title level={4}>RequestCraft</Title>
        <Spin spinning={loading}>
          <Space direction="vertical" align="center">
            <Switch
              checkedChildren="ON"
              unCheckedChildren="OFF"
              checked={enabled}
              onChange={handleSwitchChange}
              aria-label="Global enable/disable switch"
            />
            <Text type="secondary">{enabled ? '插件已激活' : '插件已关闭'}</Text>
          </Space>
        </Spin>
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={openOptionsPage}
          style={{ marginTop: 20 }}
        >
          进入配置中心
        </Button>
      </Space>
    </Card>
  );
};

export default PopupApp;