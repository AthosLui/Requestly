import type { Rule } from './types';

// 存储键名常量
const STORAGE_KEYS = {
  RULES: 'rules',
  GLOBAL_SWITCH: 'globalSwitch'
} as const;

// 获取规则列表
export const getRules = async (): Promise<Rule[]> => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.RULES);
  return result[STORAGE_KEYS.RULES] || [];
};

// 保存规则列表
export const setRules = async (rules: Rule[]): Promise<void> => {
  await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: rules });
};

// 获取全局开关状态
export const getGlobalSwitch = async (): Promise<boolean> => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GLOBAL_SWITCH);
  return result[STORAGE_KEYS.GLOBAL_SWITCH] ?? false;
};

// 设置全局开关状态
export const setGlobalSwitch = async (enabled: boolean): Promise<void> => {
  await chrome.storage.local.set({ [STORAGE_KEYS.GLOBAL_SWITCH]: enabled });
};

// 生成唯一ID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 清除所有存储数据
export const clearStorage = async (): Promise<void> => {
  await chrome.storage.local.clear();
};

// 获取单个规则
export const getRule = async (id: string): Promise<Rule | undefined> => {
  const rules = await getRules();
  return rules.find(rule => rule.id === id);
};

// 删除单个规则
export const deleteRule = async (id: string): Promise<void> => {
  const rules = await getRules();
  await setRules(rules.filter(rule => rule.id !== id));
};

// 更新单个规则
export const updateRule = async (rule: Rule): Promise<void> => {
  const rules = await getRules();
  const index = rules.findIndex(r => r.id === rule.id);
  if (index > -1) {
    rules[index] = rule;
    await setRules(rules);
  }
};