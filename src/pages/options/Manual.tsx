import React from 'react';
import { Typography, Space, Tag } from 'antd';

const { Title, Paragraph, Text } = Typography;

const Manual: React.FC = () => (
  <Typography>
    <Title level={3}>RequestCraft 使用手册</Title>

    <Title level={4}>规则类型说明</Title>
    <Space direction="vertical">
      <div>
        <Tag color="blue">重定向</Tag>
        <Paragraph>
          将请求重定向到指定的目标 URL
          <Text type="secondary" className="block">
            示例：将 api.example.com/v1/* 重定向到 api.example.com/v2/*
          </Text>
        </Paragraph>
      </div>

      <div>
        <Tag color="green">Mock响应</Tag>
        <Paragraph>
          拦截请求并返回自定义的 JSON 数据
          <Text type="secondary" className="block">
            适用于前端开发和测试场景，可以模拟各种 API 响应
          </Text>
        </Paragraph>
      </div>

      <div>
        <Tag color="purple">修改请求头</Tag>
        <Paragraph>
          修改请求头或响应头字段
          <Text type="secondary" className="block">
            可以添加、修改或删除 HTTP 头部字段
          </Text>
        </Paragraph>
      </div>

      <div>
        <Tag color="orange">代理</Tag>
        <Paragraph>
          通过代理服务器转发请求
          <Text type="secondary" className="block">
            支持 HTTP、HTTPS、SOCKS4、SOCKS5 代理协议
          </Text>
        </Paragraph>
      </div>
    </Space>

    <Title level={4}>URL 匹配规则</Title>
    <Paragraph>
      支持使用通配符 <Text code>*</Text> 匹配 URL：
      <ul>
        <li><Text code>*://api.example.com/*</Text> - 匹配任意协议</li>
        <li><Text code>https://*.example.com/api/*</Text> - 匹配任意子域名</li>
        <li><Text code>*://example.com/api/v1/*</Text> - 匹配特定路径前缀</li>
      </ul>
    </Paragraph>

    <Title level={4}>使用建议</Title>
    <ul>
      <li>规则按照列表顺序从上到下匹配，首个匹配的规则将被应用</li>
      <li>建议在添加新规则时先禁用，调试无误后再启用</li>
      <li>使用 Mock 响应时，确保返回的是有效的 JSON 格式数据</li>
      <li>代理设置需要确保代理服务器可用且配置正确</li>
    </ul>
  </Typography>
);

export default Manual;