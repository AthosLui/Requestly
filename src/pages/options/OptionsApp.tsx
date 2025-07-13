import React, { useState, useEffect } from 'react'
import { Form, Switch, Input, Button, Card, Typography, Space, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { Title } = Typography

interface OptionsData {
  enabled: boolean
  apiKey: string
  autoRefresh: boolean
}

const OptionsApp: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 加载保存的设置
    chrome.storage.sync.get(['options'], (result) => {
      if (result.options) {
        form.setFieldsValue(result.options)
      }
    })
  }, [form])

  const handleSave = async (values: OptionsData) => {
    setLoading(true)
    try {
      await chrome.storage.sync.set({ options: values })
      message.success('设置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>扩展设置</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            enabled: true,
            apiKey: '',
            autoRefresh: false
          }}
        >
          <Form.Item
            name="enabled"
            label="启用扩展"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="输入你的 API Key" />
          </Form.Item>

          <Form.Item
            name="autoRefresh"
            label="自动刷新"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                保存设置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default OptionsApp