export type RuleType = 'redirect' | 'mock' | 'modifyHeaders' | 'proxy';

export interface Rule {
  id: string;
  name: string;
  type: RuleType;
  matchUrl: string;
  enabled: boolean;
  targetUrl?: string;
  mockResponse?: string;
  headers?: HeaderRule[];
  proxyConfig?: ProxyConfig;
}

export interface HeaderRule {
  name: string;
  value: string;
  type: 'request' | 'response';
}

export interface ProxyConfig {
  host: string;
  port: number;
  scheme?: 'http' | 'https' | 'socks4' | 'socks5';
  username?: string;
  password?: string;
}