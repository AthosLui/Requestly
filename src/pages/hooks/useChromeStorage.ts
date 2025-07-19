// src/common/hooks/useChromeStorage.ts

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (newValue: T) => Promise<void>;

/**
 * 一个通用的自定义 Hook，用于与 chrome.storage.sync 进行交互
 * 它会：
 * 1. 从 storage 中异步加载初始值
 * 2. 提供一个 setter 函数来更新 storage 中的值
 * 3. 监听 storage 的变化，并自动更新组件状态
 *
 * @param key storage 中存储数据的键
 * @param defaultValue 如果 storage 中没有值，则使用的默认值
 * @returns [value, setValue, isLoading]
 */
export function useChromeStorage<T>(key: string, defaultValue: T): [T, SetValue<T>, boolean] {
  const [value, setValueState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // 仅在组件挂载时运行，用于获取初始值
  useEffect(() => {
    setIsLoading(true);
    chrome.storage.sync.get([key])
      .then((result) => {
        // 检查 result 中是否存在 key 对应的值，且不为 undefined
        if (result[key] !== undefined) {
          setValueState(result[key]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key]);

  // 设置监听器，监听来自其他地方（如 background 或其他页面）的更改
  useEffect(() => {
    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      // 我们只关心 sync 区域的变化，并且是当前 hook 关心的 key
      if (area === 'sync' && changes[key]) {
        setValueState(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleChange);

    // 组件卸载时，移除监听器，防止内存泄漏
    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  // 创建一个 memoized setter 函数
  const setValue: SetValue<T> = useCallback(async (newValue: T) => {
    await chrome.storage.sync.set({ [key]: newValue });
    // 注意：这里的 setValueState 是可选的，因为 onChanged 监听器也会更新状态。
    // 但为了更快的 UI 响应，我们可以立即更新本地 state。
    setValueState(newValue);
  }, [key]);

  return [value, setValue, isLoading];
}