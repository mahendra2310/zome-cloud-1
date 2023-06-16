const protocol = 'http';
const host = '192.168.29.210:30000/zomecloud/api/v1';

const port = '';
const trailUrl = '';

const hostUrl = `${protocol}://${host}${port ? ':' + port : ''}`;
const endpoint = `${protocol}://${host}${port ? ':' + port : ''}${trailUrl}`;

export default {
  protocol: protocol,
  host: host,
  port: port,
  apiUrl: trailUrl,
  endpoint: endpoint,
  hostUrl: hostUrl,
};
