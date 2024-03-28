const supertest = require('supertest');
const app = require('../src/index');

describe('health check', () => {
  let request;
  let server;
  beforeAll((done) => {
    server = app.listen(done);
    request = supertest(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 status', async () => {
    await request.get('/').then((response) => {
      expect(response.status).toBe(200);
    });
  });
  it('should return html', async () => {
    await request.get('/index').then((response) => {
      expect(response.text).toBe('<h1>Welcome to my API!</h1>');
    });
  });
  it('should return health ok 200', async () => {
    await request.get('/health/status').then((response) => {
      expect(response.status).toBe(200);
    });
  });
  it('should return error', async () => {
    await request.get('/health/error').then((response) => {
      expect(response.status).toBe(404);
    });
  });

});
