// src/common/storage.ts

// src/common/types/index.ts

/**
 * 定义规则的类型，用于 Select 组件和逻辑判断
 */
export type RuleType = 'redirect' | 'mock' | 'modifyHeaders';

/**
 * 定义请求头/响应头的键值对结构
 */
export interface HeaderPair {
  key: string;
  value: string;
  // 可以添加 'enabled' 字段来单独控制每个 header
}

/**
 * 定义核心的“规则”对象结构
 * 这是我们应用中最重要的数据模型
 */
export interface Rule {
  /**
   * 规则的唯一标识符，使用 UUID 生成
   */
  id: string;

  /**
   * 用户自定义的规则名称，便于识别
   * @example "Mock 用户信息接口"
   */
  name: string;

  /**
   * 规则匹配的 URL Filter，支持 Chrome 的通配符
   * @example "*://api.example.com/data/*"
   */
  matchUrl: string;

  /**
   * 规则的类型
   */
  type: RuleType;

  /**
   * 该条规则是否启用
   */
  enabled: boolean;

  // --- 以下是根据 RuleType 变化的可选字段 ---

  /**
   * 当 type 为 'redirect' 时，指定重定向的目标 URL
   */
  redirectUrl?: string;

  /**
   * 当 type 为 'mock' 时，指定要返回的响应体内容 (通常是 JSON 字符串)
   */
  mockContent?: string;

  /**
   * 当 type 为 'modifyHeaders' 时，指定要修改的请求头
   */
  requestHeaders?: HeaderPair[];

  /**
   * 当 type 为 'modifyHeaders' 时，指定要修改的响应头
   */
  responseHeaders?: HeaderPair[];
}

// 使用常量定义存储键，避免硬编码字符串和拼写错误
const STORAGE_KEYS = {
  RULES: 'requestCraftRules',
  GLOBAL_SWITCH: 'requestCraftGlobalSwitch',
};

/**
 * 获取所有规则
 * @returns {Promise<Rule[]>} 返回规则数组，如果不存在则返回空数组
 */
export const getRules = async (): Promise<Rule[]> => {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.RULES);
  // Array.isArray 检查确保返回的是数组，增强代码健壮性
  return Array.isArray(result[STORAGE_KEYS.RULES]) ? result[STORAGE_KEYS.RULES] : [];
};

/**
 * 保存规则数组
 * @param {Rule[]} rules 要保存的完整规则数组
 * @returns {Promise<void>}
 */
export const setRules = async (rules: Rule[]): Promise<void> => {
  await chrome.storage.sync.set({ [STORAGE_KEYS.RULES]: rules });
};

/**
 * 获取全局总开关的状态
 * @returns {Promise<boolean>} 返回开关状态，如果不存在则默认为 true (首次安装时激活)
 */
export const getGlobalSwitch = async (): Promise<boolean> => {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.GLOBAL_SWITCH);
  if (typeof result[STORAGE_KEYS.GLOBAL_SWITCH] === 'boolean') {
    return result[STORAGE_KEYS.GLOBAL_SWITCH];
  }
  // 默认值为 true
  return true;
};

/**
 * 设置全局总开关的状态
 * @param {boolean} isEnabled 开关状态
 * @returns {Promise<void>}
 */
export const setGlobalSwitch = async (isEnabled: boolean): Promise<void> => {
  await chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL_SWITCH]: isEnabled });
};