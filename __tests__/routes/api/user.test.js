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

      expect(result.status).toBe(200);
      expect(result.body.username).toEqual(body.Login.username);
    });

    test('Empty query', async () => {
      let result = await request(app)
        .post('/user/login')
        .send({ Login: { password: 'nope' } });

      expect(result.status).toBe(400);
      expect(result.body).toEqual({ error: `Incomplete Login attempt, username is required!` });
    });

    test('Incorrect password', async () => {
      let result = await request(app)
        .post('/user/login')
        .send({ Login: { username: 'Do Not Delete', password: 'zzzz' } });

      expect(result.status).toBe(400);
      expect(result.body).toEqual({ error: 'Password Incorrect' });
    });

    test('User does not exist', async () => {
      let result = await request(app)
        .post('/user/login')
        .send({ Login: { username: 'NotARealBoy', password: 'zzzz' } });

      expect(result.status).toBe(404);
      expect(result.body).toEqual({ error: 'User does not exist.' });
    });
  });

  describe('Register', () => {
    let body = {
      newUser: {
        username: 'User' + Math.random(),
        password: 'aaaa',
        first_name: 'People',
        last_name: 'Person',
        email: 'user@domain.com',
        phone: '1234561212',
        is_operator: false,
      }
    };

    test('Valid query', async () => {
      let result = await request(app).post('/user/register').send(body);

      expect(result.status).toBe(200);
      expect(result.body.FIRST_NAME).toEqual(body.newUser.first_name);
    });

    test('Duplicate user', async () => {
      let result = await request(app)
        .post('/user/register')
        .send({ newUser: {...body.newUser, username: 'Do Not Delete' }});

      expect(result.status).toBe(400);
      expect(result.body).toEqual('Username already in use.');
    });

    test('Missing username', async () => {
      let result = await request(app).post('/user/register').send({
        newUser: {
          password: 'aaaa',
          first_name: 'People',
          last_name: 'Person',
          email: 'user@domain.com',
          phone: '1234561212',
          is_operator: false,
        }
      });
      console.log(result.body);
      expect(result.status).toBe(400);
      expect(result.body.errors[0].message).toEqual('Users.USERNAME cannot be null');
    });
  });
});
