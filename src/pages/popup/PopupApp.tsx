import React, { useState, useEffect } from 'react';
import { Switch, Button, Typography, Space, Spin, Card, message } from 'antd';
import { SettingOutlined, PoweroffOutlined } from '@ant-design/icons';
import { getGlobalSwitch, setGlobalSwitch } from '@/shared/utils/storage';

const { Title, Text } = Typography;

const PopupApp: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initStatus = async () => {
      try {
        const status = await getGlobalSwitch();
        setEnabled(status);
      } catch (err: any) {
        console.log(err.toString());
        message.error('获取状态失败');
      } finally {
        setLoading(false);
      }
    };

    initStatus();
  }, []);

  const handleSwitchChange = async (checked: boolean) => {
    setLoading(true);
    try {
      await setGlobalSwitch(checked);
      setEnabled(checked);
      message.success(checked ? '插件已启用' : '插件已禁用');
    } catch (err) {
      message.error('操作失败');
      setEnabled(!checked);
    } finally {
      setLoading(false);
    }
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <Card
      bordered={false}
      style={{
        width: 300,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <Space
        direction="vertical"
        align="center"
        style={{
          width: '100%',
          padding: '12px 0'
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          <Space>
            <PoweroffOutlined style={{ color: enabled ? '#52c41a' : '#ff4d4f' }} />
            RequestCraft
          </Space>
        </Title>

        <Spin spinning={loading}>
          <Space
            direction="vertical"
            align="center"
            style={{ padding: '16px 0' }}
          >
            <Switch
              checkedChildren="已启用"
              unCheckedChildren="已禁用"
              checked={enabled}
              onChange={handleSwitchChange}
              style={{
                backgroundColor: enabled ? '#52c41a' : 'rgba(0,0,0,0.25)'
              }}
            />
            <Text type={enabled ? 'success' : 'secondary'}>
              {enabled ? '规则生效中' : '规则已停用'}
            </Text>
          </Space>
        </Spin>

        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={openOptionsPage}
          style={{
            width: '100%',
            marginTop: 8
          }}
        >
          进入配置中心
        </Button>
      </Space>
    </Card>
  );
};

export default PopupApp;