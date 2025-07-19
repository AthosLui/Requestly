import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Tag, Space, Modal, message, Drawer } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { Rule } from '@/shared/utils/types';
import { getRules, setRules, generateUUID } from '@/shared/utils/storage';
import RuleForm from '@/pages/components/RuleForm.tsx';
import Manual from './Manual';

const { Header, Content } = Layout;

const OptionsApp: React.FC = () => {
  const [rules, setRulesList] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const rules = await getRules();
      setRulesList(rules);
    } catch (err: any) {
      console.log(err.toString())
      message.error('加载规则失败');
    }
    setLoading(false);
  };

  const handleSave = async (rule: Partial<Rule>) => {
    if (!rule.name || !rule.matchUrl || !rule.type) {
      message.error('请填写必要信息');
      return;
    }

    try {
      let newRules: Rule[];
      if (rule.id) {
        newRules = rules.map(r => r.id === rule.id ? rule as Rule : r);
      } else {
        const newRule = {
          ...rule,
          id: generateUUID(),
          enabled: rule.enabled ?? false
        } as Rule;
        newRules = [...rules, newRule];
      }

      await setRules(newRules);
      setRulesList(newRules);
      setModalVisible(false);
      message.success('保存成功');
    } catch (err: any) {
      console.log(err.toString())
      message.error('保存失败');
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: any = {
          redirect: '重定向',
          mock: 'Mock响应',
          modifyHeaders: '修改请求头',
          proxy: '代理'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '匹配 URL',
      dataIndex: 'matchUrl',
      key: 'matchUrl',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'success' : 'default'}>
          {enabled ? '已启用' : '已禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Rule) => (
        <Space>
          <Button type="link" onClick={() => {
            setEditingRule(record);
            setModalVisible(true);
          }}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleDelete = async (id: string) => {
    try {
      const newRules = rules.filter(r => r.id !== id);
      await setRules(newRules);
      setRulesList(newRules);
      message.success('删除成功');
    } catch (err: any) {
      console.log(err.toString())
      message.error('删除失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <h2>RequestCraft - 配置中心</h2>
        <Space>
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={() => setHelpVisible(true)}
            ghost
          >
            使用说明
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRule(null);
              setModalVisible(true);
            }}
          >
            添加新规则
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rules}
          loading={loading}
        />
      </Content>

      <Modal
        title={editingRule ? '编辑规则' : '添加规则'}
        open={modalVisible}
        onOk={() => handleSave(editingRule!)}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <RuleForm
          value={editingRule || {}}
          onChange={setEditingRule}
        />
      </Modal>

      <Drawer
        title="使用说明"
        placement="right"
        width={500}
        open={helpVisible}
        onClose={() => setHelpVisible(false)}
      >
        <Manual />
      </Drawer>
    </Layout>
  );
};

export default OptionsApp;