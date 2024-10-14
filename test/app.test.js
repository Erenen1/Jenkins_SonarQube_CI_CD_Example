const request = require('supertest');
const { Sequelize } = require('sequelize');
const redis = require('redis');
const app = require('../app'); // Burada Express uygulamanı dışa aktarman gerekiyor
require("dotenv").config({ path: `.env.test` });

let sequelize;
let redisClient;

// PostgreSQL ve Redis bağlantılarını taklit eden mocklar
beforeAll(async () => {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
  });
  
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // Test için tabloyu sıfırla
  
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });
  
  await redisClient.connect();
});

afterAll(async () => {
  await sequelize.close();
  await redisClient.quit();
});

describe('User API Tests', () => {
  it('POST /users - should create a new user', async () => {
    const newUser = { name: 'John Doe', age: 30 };
    
    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(200);
    
    // Veritabanında kullanıcının oluşturulduğunu doğrula
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.age).toBe(newUser.age);
  });

  it('GET /users/:id - should retrieve user from Redis cache or database', async () => {
    // Önce bir kullanıcı ekleyelim
    const newUser = { name: 'Jane Doe', age: 25 };
    
    const createResponse = await request(app)
      .post('/users')
      .send(newUser)
      .expect(200);
    
    const userId = createResponse.body.id;

    // Cache'den ve veritabanından kullanıcıyı almak için GET isteği yapalım
    const getResponse = await request(app)
      .get(`/users/${userId}`)
      .expect(200);

    // Veriyi doğrula
    expect(getResponse.body).toHaveProperty('id');
    expect(getResponse.body.name).toBe(newUser.name);
    expect(getResponse.body.age).toBe(newUser.age);

    // Cache'den aldığımıza emin olalım
    const cachedUser = await redisClient.get(`user:${userId}`);
    expect(JSON.parse(cachedUser)).toHaveProperty('name', newUser.name);
  });

  it('GET /users/:id - should return 404 for non-existing user', async () => {
    await request(app)
      .get('/users/9999')
      .expect(404);
  });
});
