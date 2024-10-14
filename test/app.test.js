const request = require('supertest');
const app = require('../app');

let server; // Sunucuyu burada tanımlıyoruz

beforeAll(() => {
  // Sunucuyu test öncesinde başlat
  server = app.listen(4000, () => {
    console.log('Test server 4000 portunda çalışıyor');
  });
});

afterAll(() => {
  // Test bittikten sonra sunucuyu kapat
  server.close();
});

describe('GET /', () => {
  it('"Merhaba Dünya!" dönmeli', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Merhaba Dünya!');
  });
});
