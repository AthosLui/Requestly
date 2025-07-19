import React, { useState, useEffect } from 'react';
import { Button, Input, Form, List, Typography, message, Card, Switch, Tabs } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

// 定义重定向规则的类型
interface RedirectRule {
  id: number;
  sourceUrl: string;
  targetUrl: string;
}

// 定义代理规则的类型
interface ProxyRule {
  id: number;
  pattern: string;   // 匹配的 URL 模式
  proxyUrl: string;  // 目标代理服务器地址
}

const OptionsApp: React.FC = () => {
  const [redirectRules, setRedirectRules] = useState<RedirectRule[]>([]);
  const [proxyRules, setProxyRules] = useState<ProxyRule[]>([]);
  const [redirectForm] = Form.useForm();
  const [proxyForm] = Form.useForm();
  const [isProxyEnabled, setIsProxyEnabled] = useState<boolean>(false);

  // 加载所有规则和代理开关状态
  useEffect(() => {
    const loadAllData = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['redirectRules', 'proxyRules', 'isProxyEnabled']);
        setRedirectRules(result.redirectRules || []);
        setProxyRules(result.proxyRules || []);
        setIsProxyEnabled(result.isProxyEnabled !== undefined ? result.isProxyEnabled : false);
      } else {
        console.warn('Chrome API not available. Using mock data for development.');
        setRedirectRules([
          { id: 1, sourceUrl: 'https://www.google.com/', targetUrl: 'https://www.bing.com/' },
        ]);
        setProxyRules([
          { id: 1, pattern: 'api.example.com', proxyUrl: 'PROXY localhost:8080' },
        ]);
        setIsProxyEnabled(false);
      }
    };
    loadAllData();
  }, []);

  // --- 重定向规则相关逻辑 ---
  const saveRedirectRules = async (updatedRules: RedirectRule[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ redirectRules: updatedRules });
      setRedirectRules(updatedRules);
      message.success('重定向规则已保存并更新！');
    } else {
      setRedirectRules(updatedRules);
      message.info('重定向规则在开发模式下已更新 (未保存到Chrome Storage)。');
    }
  };

  const onAddRedirectRule = async (values: { sourceUrl: string; targetUrl: string }) => {
    const { sourceUrl, targetUrl } = values;
    if (redirectRules.some(rule => rule.sourceUrl === sourceUrl)) {
      message.error('该源 URL 已存在重定向规则！');
      return;
    }
    const currentMaxId = redirectRules.length > 0 ? Math.max(...redirectRules.map(rule => rule.id)) : 0;
    const newRule: RedirectRule = { id: currentMaxId + 1, sourceUrl, targetUrl };
    await saveRedirectRules([...redirectRules, newRule]);
    redirectForm.resetFields();
  };

  const onDeleteRedirectRule = async (id: number) => {
    const updatedRules = redirectRules.filter(rule => rule.id !== id);
    await saveRedirectRules(updatedRules);
  };

  // --- 代理规则相关逻辑 ---
  const saveProxyRules = async (updatedRules: ProxyRule[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ proxyRules: updatedRules });
      setProxyRules(updatedRules);
      message.success('代理规则已保存并更新！');
    } else {
      setProxyRules(updatedRules);
      message.info('代理规则在开发模式下已更新 (未保存到Chrome Storage)。');
    }
  };

  const onAddProxyRule = async (values: { pattern: string; proxyUrl: string }) => {
    const { pattern, proxyUrl } = values;
    if (proxyRules.some(rule => rule.pattern === pattern)) {
      message.error('该匹配模式已存在代理规则！');
      return;
    }
    // 简单验证 proxyUrl 格式
    if (!proxyUrl.startsWith('PROXY ') && !proxyUrl.startsWith('SOCKS5 ')) {
      message.error('代理地址格式不正确，应以 PROXY 或 SOCKS5 开头，例如：PROXY localhost:8080');
      return;
    }

    const currentMaxId = proxyRules.length > 0 ? Math.max(...proxyRules.map(rule => rule.id)) : 0;
    const newRule: ProxyRule = { id: currentMaxId + 1, pattern, proxyUrl };
    await saveProxyRules([...proxyRules, newRule]);
    proxyForm.resetFields();
  };

  const onDeleteProxyRule = async (id: number) => {
    const updatedRules = proxyRules.filter(rule => rule.id !== id);
    await saveProxyRules(updatedRules);
  };

  // 切换代理功能状态
  const onToggleProxy = async (checked: boolean) => {
    setIsProxyEnabled(checked);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ isProxyEnabled: checked });
      message.success(`代理功能已${checked ? '开启' : '关闭'}！`);
    } else {
      message.info(`代理功能在开发模式下已切换为${checked ? '开启' : '关闭'}。`);
    }
  };


  const items = [
    {
      key: 'redirect',
      label: 'URL 重定向',
      children: (
        <>
          <Card title="添加新重定向规则" style={{ marginBottom: '20px' }}>
            <Form
              form={redirectForm}
              name="redirect_rule"
              onFinish={onAddRedirectRule}
              layout="vertical"
            >
              <Form.Item
                name="sourceUrl"
                label="源 URL (精确匹配，例如: https://www.baidu.com/)"
                rules={[
                  { required: true, message: '请输入源 URL!' },
                  { type: 'url', message: '请输入有效的 URL 格式!' }
                ]}
              >
                <Input placeholder="例如: https://www.baidu.com/" />
              </Form.Item>
              <Form.Item
                name="targetUrl"
                label="目标 URL (例如: https://cn.bing.com/)"
                rules={[
                  { required: true, message: '请输入目标 URL!' },
                  { type: 'url', message: '请输入有效的 URL 格式!' }
                ]}
              >
                <Input placeholder="例如: https://cn.bing.com/" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  添加规则
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="当前重定向规则列表">
            <List
              itemLayout="horizontal"
              dataSource={redirectRules}
              locale={{ emptyText: '暂无重定向规则' }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteRedirectRule(item.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Typography.Text strong>{item.sourceUrl}</Typography.Text>}
                    description={`重定向至: ${item.targetUrl}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </>
      ),
    },
    {
      key: 'proxy',
      label: '代理配置',
      children: (
        <>
          <Card title="代理功能总开关" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text strong>启用代理</Typography.Text>
              <Switch
                checked={isProxyEnabled}
                onChange={onToggleProxy}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </div>
            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
              {isProxyEnabled ? '所有配置的代理规则均已生效。' : '代理功能已禁用，所有请求将直连。'}
            </Typography.Text>
          </Card>

          <Card title="添加新代理规则" style={{ marginBottom: '20px' }}>
            <Form
              form={proxyForm}
              name="proxy_rule"
              onFinish={onAddProxyRule}
              layout="vertical"
            >
              <Form.Item
                name="pattern"
                label="匹配模式 (URL中包含的字符串，例如: api.example.com)"
                rules={[
                  { required: true, message: '请输入匹配模式!' }
                ]}
              >
                <Input placeholder="例如: /api/v1 或 example.com/data" />
              </Form.Item>
              <Form.Item
                name="proxyUrl"
                label="目标代理地址 (例如: PROXY localhost:8080 或 SOCKS5 127.0.0.1:1080)"
                rules={[
                  { required: true, message: '请输入目标代理地址!' },
                  { pattern: /^(PROXY|SOCKS5)\s+[\w\d.-]+:\d+$/, message: '格式不正确，应为 PROXY host:port 或 SOCKS5 host:port' }
                ]}
              >
                <Input placeholder="例如: PROXY localhost:8080" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  添加规则
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="当前代理规则列表">
            <List
              itemLayout="horizontal"
              dataSource={proxyRules}
              locale={{ emptyText: '暂无代理规则' }}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteProxyRule(item.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Typography.Text strong>{item.pattern}</Typography.Text>}
                    description={`代理至: ${item.proxyUrl}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>扩展设置</Typography.Title>
      <Tabs defaultActiveKey="redirect" items={items} />
    </div>
  );
};

export default OptionsApp;