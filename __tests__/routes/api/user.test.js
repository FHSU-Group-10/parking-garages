const request = require('supertest');
const app = require('../../../app');

describe('User Route', () => {
  describe('Login', () => {
    let body = {
      Login: {
        username: 'Do Not Delete',
        password: 'aaaa',
      },
    };

    test('Valid query', async () => {
      let result = await request(app).post('/user/login').send(body);
      console.log(result.body);
      expect(result.status).toBe(200);
      expect(result.body.username).toEqual(body.Login.username);
    });
  });

  describe('Register', () => {
    let body = {
      username: 'User' + Math.random(),
      password: 'aaaa',
      first_name: 'People',
      last_name: 'Person',
      email: 'user@domain.com',
      phone: '1234561212',
      is_operator: false,
    };

    test('Valid query', async () => {
      let result = await request(app).post('/user/register').send(body);

      expect(result.status).toBe(200);
      expect(result.body.FIRST_NAME).toEqual(body.first_name);
    });
  });
});
