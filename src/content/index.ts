// content.js
console.log("Content script loaded");

const injectExternalScript = () => {
  const script = document.createElement('script');
  // 设置脚本的 src 属性，指向你的外部脚本文件
  // chrome.runtime.getURL 会获取扩展内部资源的完整 URL
  script.src = chrome.runtime.getURL('injected_script.js');
  script.onload = () => {
    // 脚本加载完成后，可以移除这个临时 <script> 标签
    // script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

// 页面加载完成后注入外部脚本
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectExternalScript);
} else {
  injectExternalScript();
}

// 监听来自 popup 的消息 (保持不变)
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      title: document.title,
      url: window.location.href
    });
  }
});