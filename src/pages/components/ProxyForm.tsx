import React from 'react';
import { Form, Input, Select } from 'antd';
import type { ProxyConfig } from '@/shared/utils/types';

interface ProxyFormProps {
  value?: ProxyConfig;
  onChange?: (value: ProxyConfig) => void;
}

const ProxyForm: React.FC<ProxyFormProps> = ({ value, onChange }) => {
  const handleChange = (changedValue: Partial<ProxyConfig>) => {
    onChange?.({ ...value, ...changedValue } as ProxyConfig);
  };

  return (
    <div>
      <Form.Item label="代理协议">
        <Select
          value={value?.scheme}
          onChange={v => handleChange({ scheme: v })}
          options={[
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' },
            { label: 'SOCKS4', value: 'socks4' },
            { label: 'SOCKS5', value: 'socks5' }
          ]}
        />
      </Form.Item>
      <Form.Item label="主机地址" required>
        <Input
          value={value?.host}
          onChange={e => handleChange({ host: e.target.value })}
          placeholder="例如: 127.0.0.1"
        />
      </Form.Item>
      <Form.Item label="端口" required>
        <Input
          type="number"
          value={value?.port}
          onChange={e => handleChange({ port: parseInt(e.target.value) })}
          placeholder="例如: 8080"
        />
      </Form.Item>
      <Form.Item label="用户名">
        <Input
          value={value?.username}
          onChange={e => handleChange({ username: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="密码">
        <Input.Password
          value={value?.password}
          onChange={e => handleChange({ password: e.target.value })}
        />
      </Form.Item>
    </div>
  );
};

export default ProxyForm;