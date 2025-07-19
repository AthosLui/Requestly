// background.ts

// 定义存储中重定向规则的类型 (保持不变)
interface StoredRedirectRule {
  id: number;
  sourceUrl: string;
  targetUrl: string;
}

// 定义存储中代理规则的类型
interface StoredProxyRule {
  id: number;
  pattern: string;   // 匹配的 URL 模式 (例如: 'api.example.com' 或 '/api/')
  proxyUrl: string;  // 目标代理服务器地址 (例如: 'PROXY localhost:8080' 或 'SOCKS5 127.0.0.1:1080')
}

interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

// 辅助函数：更新 declarativeNetRequest 规则 (保持不变)
async function updateDeclarativeNetRequestRules(
  rules: StoredRedirectRule[],
  isEnabled: boolean
): Promise<void> {
  const removeRuleIds: number[] = [];
  const addRules: chrome.declarativeNetRequest.Rule[] = [];

  const existingDynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  existingDynamicRules.forEach(rule => removeRuleIds.push(rule.id));

  if (isEnabled) {
    rules.forEach(rule => {
      try {
        new URL(rule.sourceUrl);
        new URL(rule.targetUrl);
      } catch (e) {
        console.error(`Invalid URL in redirect rule (ID: ${rule.id}):`, rule.sourceUrl, rule.targetUrl, e);
        return;
      }
      addRules.push({
        id: rule.id,
        priority: 1,
        action: { type: "redirect", redirect: { url: rule.targetUrl } },
        condition: { urlFilter: rule.sourceUrl, resourceTypes: ["main_frame"] }
      });
    });
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeRuleIds, addRules: addRules });
    console.log(`Declarative Net Request rules updated. Enabled: ${isEnabled}, Added: ${addRules.length}, Removed: ${removeRuleIds.length}`);
  } catch (error: any) {
    console.error('Failed to update Declarative Net Request rules:', error.message || error);
  }
}

// 辅助函数：生成 PAC 脚本
function generatePacScript(proxyRules: StoredProxyRule[]): string {
  // FIND_PROXY_FOR_URL 是 PAC 脚本的核心函数
  let script = `function FindProxyForURL(url, host) {\n`;

  // 遍历代理规则，生成匹配逻辑
  proxyRules.forEach(rule => {
    // 确保 pattern 是字符串且不为空
    if (typeof rule.pattern !== 'string' || rule.pattern.trim() === '') {
      console.warn('Skipping proxy rule with invalid pattern:', rule);
      return;
    }
    // 对 pattern 进行转义，以确保其在 JavaScript 字符串中是安全的
    const escapedPattern = rule.pattern.replace(/'/g, "\\'").replace(/"/g, '\\"');

    // PAC 脚本可以使用多种匹配函数：
    // - url.includes() 是最简单的字符串包含匹配
    // - shExpMatch(url, "*.example.com/api/*") 支持 Shell 风格的通配符匹配
    // - host.endsWith("example.com") 匹配主机名
    // - etc.
    // 这里我们使用 shExpMatch 作为一个更灵活的示例，但如果用户输入的是纯字符串，
    // url.includes 也能工作。为了更好的匹配能力，鼓励使用 shExpMatch。

    script += `  // Rule ID: ${rule.id}, Pattern: ${escapedPattern}\n`;
    script += `  if (shExpMatch(url, "*${escapedPattern}*")) {\n`; // 使用 shExpMatch 进行通配符匹配
    script += `    return "${rule.proxyUrl}";\n`;
    script += `  }\n`;
  });

  // 如果没有规则匹配，则直连
  script += `  return "DIRECT";\n`;
  script += `}`;
  return script;
}

// 辅助函数：更新 Chrome 代理设置
async function updateProxySettings(
  proxyRules: StoredProxyRule[],
  isProxyEnabled: boolean // 代理总开关
): Promise<void> {
  let config: chrome.proxy.ProxyConfig;

  if (isProxyEnabled && proxyRules.length > 0) {
    const pacScript = generatePacScript(proxyRules);
    console.log("Generated PAC Script:\n", pacScript);

    config = {
      mode: "pac_script",
      pacScript: {
        data: pacScript
      }
    };
  } else {
    // 如果代理未启用或没有规则，则设置为直连
    config = {
      mode: "direct"
    };
  }

  try {
    await chrome.proxy.settings.set({ value: config, scope: "regular" });
    console.log("Chrome proxy settings updated successfully to mode:", config.mode);
  } catch (error: any) {
    console.error("Failed to update proxy settings:", error.message || error);
    // 如果是权限错误，可能需要指导用户重新启用扩展或检查权限
    if (error.message && error.message.includes("permission")) {
      console.error("Proxy permission might be missing or revoked. Please check manifest.json or reinstall the extension.");
    }
  }
}


// Service Worker 启动时进行初始化
(async () => {
  console.log('Service Worker starting up. Initializing rules.');
  const result = await chrome.storage.local.get(['redirectRules', 'isRedirectEnabled', 'proxyRules', 'isProxyEnabled']);

  const redirectRules = result.redirectRules as StoredRedirectRule[] || [];
  const isRedirectEnabled = result.isRedirectEnabled !== undefined ? result.isRedirectEnabled : true; // 默认启用

  const proxyRules = result.proxyRules as StoredProxyRule[] || [];
  const isProxyEnabled = result.isProxyEnabled !== undefined ? result.isProxyEnabled : false; // 默认代理关闭

  await updateDeclarativeNetRequestRules(redirectRules, isRedirectEnabled);
  await updateProxySettings(proxyRules, isProxyEnabled);
})();


// 监听存储中的规则和启用状态变化
chrome.storage.local.onChanged.addListener(async (changes: StorageChanges) => {
  console.log('Storage changed:', changes);

  // 获取最新的所有规则和启用状态
  const result = await chrome.storage.local.get(['redirectRules', 'isRedirectEnabled', 'proxyRules', 'isProxyEnabled']);
  const latestRedirectRules = result.redirectRules as StoredRedirectRule[] || [];
  const latestIsRedirectEnabled = result.isRedirectEnabled !== undefined ? result.isRedirectEnabled : true;
  const latestProxyRules = result.proxyRules as StoredProxyRule[] || [];
  const latestIsProxyEnabled = result.isProxyEnabled !== undefined ? result.isProxyEnabled : false;


  if (changes.isRedirectEnabled || changes.redirectRules) {
    await updateDeclarativeNetRequestRules(latestRedirectRules, latestIsRedirectEnabled);
  }

  // 代理相关的变化才触发代理设置更新
  if (changes.isProxyEnabled || changes.proxyRules) {
    await updateProxySettings(latestProxyRules, latestIsProxyEnabled);
  }
});

// 插件安装或更新时进行初始化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed or updated, ensuring initial settings are set.');
  const result = await chrome.storage.local.get(['isRedirectEnabled', 'isProxyEnabled']);
  if (result.isRedirectEnabled === undefined) {
    await chrome.storage.local.set({ isRedirectEnabled: true });
  }
  if (result.isProxyEnabled === undefined) {
    await chrome.storage.local.set({ isProxyEnabled: false }); // 默认代理关闭
  }
});

// 确保 Service Worker 在需要时保持活动状态 (可选)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ping") {
    sendResponse({ status: "pong" });
  }
  return true;
});