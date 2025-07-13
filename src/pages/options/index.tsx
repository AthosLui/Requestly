import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import OptionsApp from './OptionsApp';

const root = ReactDOM.createRoot(document.getElementById('options-root')!)

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App>
        <OptionsApp />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)