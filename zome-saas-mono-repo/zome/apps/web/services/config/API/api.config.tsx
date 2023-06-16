import API_DEV from './api-dev';
import API_LOCAL from './api-local';
import API_PROD from './api-prod';
import API_PRE_PROD from './api-pre-prod';
import API_STAGE from './api-stage';
import API_STAGE1 from './api-stage1';
import API_DEV1 from './api-dev1';
let hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const port: any = 30000;
let isLocalApi = port >= 4200;
console.log(hostname);
export const API =
  hostname === 'localhost' && isLocalApi
    ? API_DEV1
    : hostname === 'develop.zomepower.com'
    ? API_DEV
    : hostname === 'staging.zomepower.com'
    ? API_STAGE
    : hostname === 'staging1.zomepower.com'
    ? API_STAGE1
    : hostname === 'develop1.zomepower.com'
    ? API_DEV1
    : API_PROD;
