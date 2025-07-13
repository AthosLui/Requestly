console.log('Background script loaded')

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message received in background:', request)

  if (request.action === 'getData') {
    // 处理数据请求
    sendResponse({ data: 'Hello from background!' })
  }

  return true // 保持消息通道开启
})
