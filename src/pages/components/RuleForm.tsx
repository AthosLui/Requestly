// src/components/RuleForm.tsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import type { Rule } from '@/shared/utils/storage';

const { Option } = Select;
const { TextArea } = Input;

interface RuleFormProps {
  initialValues?: Rule | null;
  onSubmit: (values: Omit<Rule, 'id' | 'enabled'>) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [ruleType, setRuleType] = useState(initialValues?.type || 'redirect');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setRuleType(initialValues.type);
    } else {
      form.resetFields();
      setRuleType('redirect');
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ type: 'redirect' }}>
      <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
        <Input placeholder="例如：Mock 用户信息接口" />
      </Form.Item>
      <Form.Item name="matchUrl" label="匹配 URL (支持通配符*)" rules={[{ required: true, message: '请输入要匹配的URL' }]}>
        <Input placeholder="例如：*://api.example.com/user/*" />
      </Form.Item>
      <Form.Item name="type" label="规则类型" rules={[{ required: true }]}>
        <Select onChange={setRuleType}>
          <Option value="redirect">重定向 (Redirect)</Option>
          <Option value="mock">伪造响应 (Mock)</Option>
          <Option value="modifyHeaders">修改头 (Modify Headers)</Option>
        </Select>
      </Form.Item>

      {/* 根据规则类型显示不同表单项 */}
      {ruleType === 'redirect' && (
        <Form.Item name="redirectUrl" label="重定向至" rules={[{ required: true, type: 'url' }]}>
          <Input placeholder="例如：http://localhost:3000/mock/user" />
        </Form.Item>
      )}

      {ruleType === 'mock' && (
        <Form.Item name="mockContent" label="Mock 响应内容 (JSON)" rules={[{ required: true }]}>
          <TextArea rows={6} placeholder='例如：{ "id": 1, "name": "Mock User" }' />
        </Form.Item>
      )}

      {ruleType === 'modifyHeaders' && (
        <p>（修改头部的UI可以在此扩展，例如使用可增减的表单列表）</p>
        // Ant Design's Form.List can be used here for dynamic fields
      )}

      <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">保存</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RuleForm;