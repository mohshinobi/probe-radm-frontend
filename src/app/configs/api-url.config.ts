import { environment } from "@env/environment";

const baseUrl = environment.baseUrl;

export const apiUrlConfig = {
  auth: {
    login: baseUrl + '/login',
    // login: 'https://127.0.0.1:8000/login',
    forgot: baseUrl + '/api/forgot',
    logout: baseUrl + '/api/logout',
    ping: baseUrl + '/ping',
    // ping: 'https://127.0.0.1:8000/ping',
  }
};

export const proxyBaseUrl = 'api/proxy';

export const proxyPath = {
  web: proxyBaseUrl+'/web',
  core: proxyBaseUrl+'/core',
  config: proxyBaseUrl+'/config',
  mistral: proxyBaseUrl+'/mistral',
  //cti: proxyBaseUrl+'/cti',
  //hoshi: proxyBaseUrl+'/hoshi',
  hunting: proxyBaseUrl+'/hunting',
  discovery: proxyBaseUrl+'/discovery',
  management: proxyBaseUrl+'/management',
  ruleset: proxyBaseUrl+'/ruleset',
};
