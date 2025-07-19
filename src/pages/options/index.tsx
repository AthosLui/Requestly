import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'
// @ts-expect-error
import '../styles/index.css';
import Layout from './Layout.tsx';

const root = ReactDOM.createRoot(document.getElementById('options-root')!)

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App>
        <Layout />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)