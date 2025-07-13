console.log('Content script loaded')

// 向页面注入一些功能
const injectScript = () => {
  const script = document.createElement('script')
  script.textContent = `
    console.log('Script injected by Chrome Extension')
  `
  document.head.appendChild(script)
}

// 页面加载完成后注入脚本
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript)
} else {
  injectScript()
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      title: document.title,
      url: window.location.href
    })
  }
})