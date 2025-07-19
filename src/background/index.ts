import type { Rule } from '../shared/utils/types';
import { getRules } from '../shared/utils/storage';

let activeRules: Rule[] = [];

// 初始化和更新规则
const updateRules = async () => {
  activeRules = (await getRules()).filter(rule => rule.enabled);
  await updateProxySettings();
  await updateNetRequestRules();
};

// 监听存储变化
chrome.storage.onChanged.addListener((changes) => {
  if (changes.rules) {
    updateRules();
  }
});

// 更新代理设置
const updateProxySettings = async () => {
  const proxyRules = activeRules.filter(rule => rule.type === 'proxy');
  const pacScript = `
    function FindProxyForURL(url, host) {
      const rules = ${JSON.stringify(proxyRules)};
      for (let i = 0; i < rules.length; i++) {
        const currentRule = rules[i];
        if (currentRule.type === 'proxy' && currentRule.enabled) {
          if (shExpMatch(url, currentRule.matchUrl)) {
            const scheme = currentRule.proxyConfig ? (currentRule.proxyConfig.scheme || 'PROXY') : 'PROXY';
            const host = currentRule.proxyConfig ? currentRule.proxyConfig.host : '';
            const port = currentRule.proxyConfig ? currentRule.proxyConfig.port : '';
            return scheme + ' ' + host + ':' + port;
          }
        }
      }
      return 'DIRECT';
    }
  `;

  await chrome.proxy.settings.set({
    value: {
      mode: "pac_script",
      pacScript: {
        data: pacScript
      }
    },
    scope: 'regular'
  });
};

// 更新请求拦截规则
const updateNetRequestRules = async () => {
  const rules = activeRules.filter(rule =>
    rule.type === 'redirect' || rule.type === 'modifyHeaders'
  );

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((_, index) => index + 1),
    addRules: rules.map((rule, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: rule.type === 'redirect' ? 'redirect' : 'modifyHeaders',
        redirect: rule.type === 'redirect' ? { url: rule.targetUrl || '' } : undefined,
        responseHeaders: rule.type === 'modifyHeaders' ?
          rule.headers?.filter(h => h.type === 'response')
            .map(h => ({
              header: h.name,
              value: h.value,
              operation: 'set' as chrome.declarativeNetRequest.HeaderOperation
            })) : undefined
      },
      condition: {
        urlFilter: rule.matchUrl,
        resourceTypes: [
          'main_frame',
          'sub_frame',
          'stylesheet',
          'script',
          'image',
          'font',
          'object',
          'xmlhttprequest',
          'ping',
          'csp_report',
          'media',
          'websocket',
          'other'
        ] as chrome.declarativeNetRequest.ResourceType[]
      }
    }))
  });
};

// 处理 Mock 响应
// const handleMockResponse = (rule: Rule) => {
//   if (rule.type !== 'mock' || !rule.mockResponse) return;
//
//   chrome.webRequest.onBeforeRequest.addListener(
//     (details) => {
//       return {
//         redirectUrl: `data:application/json,${encodeURIComponent(rule.mockResponse || '')}`
//       };
//     },
//     { urls: [rule.matchUrl] },
//     ['blocking']
//   );
// };

// 初始化
updateRules();