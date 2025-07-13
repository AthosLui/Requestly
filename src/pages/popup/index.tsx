import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import PopupApp from './PopupApp'

const root = ReactDOM.createRoot(document.getElementById('popup-root')!)

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App>
        <PopupApp />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)