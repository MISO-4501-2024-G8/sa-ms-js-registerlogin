jest.mock('../src/database/data', () => {
  const SequelizeMock = require("sequelize-mock");
  const Models = require('../src/database/models');
  class DatabaseMock {
      constructor() {
          this.sequelize = new SequelizeMock('database', 'username', 'password', {
              dialect: 'sqlite',
              storage: ':memory:',
          });
          this.models = new Models(this.sequelize);
      }
  
      async connect() {
          try {
              await this.sequelize.authenticate();
              console.log('Conexión a la base de datos establecida correctamente.');
          } catch (error) {
              console.error('Error al conectar a la base de datos:', error);
          }
      }
  
      async defineModel(modelName, fields) {
          return this.sequelize.define(modelName, fields);
      }
  
      async syncModels() {
          try {
              await this.sequelize.sync();
              console.log('Modelos sincronizados correctamente.');
          } catch (error) {
              console.error('Error al sincronizar modelos:', error);
          }
      }
  }

  return DatabaseMock;
});
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
