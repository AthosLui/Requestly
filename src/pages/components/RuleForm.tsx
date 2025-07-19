import React from 'react';
import { Form, Input, Select, Switch, Space } from 'antd';
import type { Rule, RuleType } from '@/shared/utils/types';
import ProxyForm from './ProxyForm';

interface RuleFormProps {
  value?: Partial<Rule>;
  onChange?: (values: Partial<Rule>) => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ value, onChange }) => {
  const handleTypeChange = (type: RuleType) => {
    onChange?.({ ...value, type });
  };

  return (
    <Form layout="vertical">
      <Form.Item label="规则名称" required>
        <Input
          value={value?.name}
          onChange={e => onChange?.({ ...value, name: e.target.value })}
          placeholder="输入规则名称"
        />
      </Form.Item>

      <Form.Item label="规则类型" required>
        <Select
          value={value?.type}
          onChange={handleTypeChange}
          options={[
            { label: '重定向', value: 'redirect' },
            { label: 'Mock响应', value: 'mock' },
            { label: '修改请求头', value: 'modifyHeaders' },
            { label: '代理', value: 'proxy' }
          ]}
        />
      </Form.Item>

      <Form.Item label="匹配 URL" required>
        <Input
          value={value?.matchUrl}
          onChange={e => onChange?.({ ...value, matchUrl: e.target.value })}
          placeholder="支持通配符 *，例如: *://api.example.com/*"
        />
      </Form.Item>

      {value?.type === 'redirect' && (
        <Form.Item label="目标 URL" required>
          <Input
            value={value.targetUrl}
            onChange={e => onChange?.({ ...value, targetUrl: e.target.value })}
            placeholder="输入重定向目标 URL"
          />
        </Form.Item>
      )}

      {value?.type === 'mock' && (
        <Form.Item label="Mock 响应" required>
          <Input.TextArea
            value={value.mockResponse}
            onChange={e => onChange?.({ ...value, mockResponse: e.target.value })}
            placeholder="输入 JSON 格式的 Mock 数据"
            rows={4}
          />
        </Form.Item>
      )}

      {value?.type === 'proxy' && (
        <Form.Item label="代理配置" required>
          <ProxyForm
            value={value.proxyConfig}
            onChange={proxyConfig => onChange?.({ ...value, proxyConfig })}
          />
        </Form.Item>
      )}

      <Form.Item>
        <Space>
          <span>启用规则：</span>
          <Switch
            checked={value?.enabled}
            onChange={checked => onChange?.({ ...value, enabled: checked })}
          />
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RuleForm;