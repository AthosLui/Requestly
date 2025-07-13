import React, { useState, useEffect } from 'react'
import { Button, Card, Typography, Space, Divider, Badge } from 'antd'
import { SettingOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const PopupApp: React.FC = () => {
  const [pageInfo, setPageInfo] = useState<{title: string, url: string} | null>(null)
  const [loading, setLoading] = useState(false)

  const getPageInfo = async () => {
    setLoading(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' })
        setPageInfo(response)
      }
    } catch (error) {
      console.error('Error getting page info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPageInfo()
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <Title level={4}>Chrome Extension</Title>

        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>当前页面信息:</Text>
            {pageInfo && (
              <div style={{ marginTop: '8px' }}>
                <Text>标题: {pageInfo.title}</Text>
                <br />
                <Text>URL: {pageInfo.url}</Text>
              </div>
            )}
          </div>

          <Divider />

          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={getPageInfo}
            >
              刷新信息
            </Button>

            <Button
              icon={<SettingOutlined />}
              onClick={openOptions}
            >
              设置
            </Button>
          </Space>

          <Badge count={1} offset={[10, 0]}>
            <Button icon={<InfoCircleOutlined />}>
              关于
            </Button>
          </Badge>
        </Space>
      </Card>
    </div>
  )
}

export default PopupApp