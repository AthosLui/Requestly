// src/options/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Table, Modal, message, Tag, Space, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRules, setRules, type Rule } from '@/shared/utils/storage';
import RuleForm from '../components/RuleForm'; // 【封装的组件】

const { Header, Content } = Layout;

function generateUUID() {
  let d = new Date().getTime(); // Timestamp
  let d2 = (performance && performance.now && performance.now() * 1000) || 0; // High-res timestamp

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16; // Random number between 0 and 16

    if (d > 0) { // Use timestamp until it's consumed
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else { // Use high-res timestamp if available
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }

    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const OptionsApp: React.FC = () => {
  const [rules, setRulesState] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const loadRules = useCallback(async () => {
    setLoading(true);
    const storedRules = await getRules();
    setRulesState(storedRules);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleSave = async (values: Omit<Rule, 'id' | 'enabled'>) => {
    let newRules: Rule[];
    if (editingRule) {
      // 编辑
      newRules = rules.map(r => r.id === editingRule.id ? { ...editingRule, ...values } : r);
    } else {
      // 新增
      newRules = [...rules, { ...values, id: generateUUID(), enabled: true }];
    }
    await setRules(newRules);
    setRulesState(newRules);
    message.success(editingRule ? '规则已更新' : '规则已添加');
    setIsModalVisible(false);
    setEditingRule(null);
  };

  const handleDelete = async (id: string) => {
    const newRules = rules.filter(r => r.id !== id);
    await setRules(newRules);
    setRulesState(newRules);
    message.success('规则已删除');
  };

  const handleToggleEnable = async (id: string, enabled: boolean) => {
    const newRules = rules.map(r => r.id === id ? { ...r, enabled } : r);
    await setRules(newRules);
    setRulesState(newRules);
  };

  const columns = [
    { title: '状态', dataIndex: 'enabled', render: (enabled: boolean, record: Rule) => (
        <Switch checked={enabled} onChange={(checked) => handleToggleEnable(record.id, checked)} />
      )},
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '匹配类型', dataIndex: 'type', key: 'type', render: (type: string) => {
        const colors: { [key: string]: string } = { redirect: 'blue', mock: 'green', modifyHeaders: 'purple' };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      }},
    { title: '匹配 URL (Filter)', dataIndex: 'matchUrl', key: 'matchUrl' },
    { title: '操作', key: 'action', render: (_: any, record: Rule) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => { setEditingRule(record); setIsModalVisible(true); }}>编辑</Button>
          <Popconfirm title="确定删除此规则吗?" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        </Space>
      )},
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>RequestCraft - 配置中心</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRule(null); setIsModalVisible(true); }}>
          添加新规则
        </Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Table rowKey="id" columns={columns} dataSource={rules} loading={loading} />
      </Content>
      <Modal
        title={editingRule ? '编辑规则' : '创建新规则'}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setEditingRule(null); }}
        footer={null} // 表单自带提交按钮
        destroyOnClose // 关闭时销毁内部组件状态
      >
        <RuleForm
          initialValues={editingRule}
          onSubmit={handleSave}
          onCancel={() => { setIsModalVisible(false); setEditingRule(null); }}
        />
      </Modal>
    </Layout>
  );
};

export default OptionsApp;