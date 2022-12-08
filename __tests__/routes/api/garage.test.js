const request = require('supertest');
const app = require('../../../app');
// DB and Models for cleanup
const Db = require('../../../config/dbConn')();
const { Op } = require('sequelize');
const { Garage, Floor, Space } = Db.models;

jest.setTimeout(30000);

describe('Garage Route', () => {
  const url = '/garage';

  describe('List all garages', () => {
    test('Returns results', async () => {
      const results = await request(app).post(url + '/getGarages');
      expect(results.status).toBe(200);
      expect(results.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Add a garage', () => {
    const url = '/garage/add';
    test('Valid request', async () => {
      const body = {
        name: 'UnitTestGarage' + Math.random(),
        numFloors: 3,
        spotsPerFloor: [2, 2, 2],
        location: [10, 10],
        overbookRate: 1.5,
        isActive: false,
      };
      const result = await request(app).post(url).send(body);
      //console.log(result.body, result.status);

      expect(result.body.IS_ACTIVE).toEqual(body.isActive);
      expect(result.body.FLOOR_COUNT).toEqual(body.numFloors);
      expect(result.body.LAT).toEqual(`${body.location[0]}`);
      expect(result.body.LONG).toEqual(`${body.location[1]}`);
      expect(result.status).toBe(200);

      // Cleanup created garage
      if (result?.body?.GARAGE_ID) {
        Space.destroy({
          where: {
            GARAGE_ID: result.body.GARAGE_ID,
          },
        });
        Floor.destroy({
          where: {
            GARAGE_ID: result.body.GARAGE_ID,
          },
        });
        Garage.destroy({
          where: {
            GARAGE_ID: result.body.GARAGE_ID,
          },
        });
      }
    });

    test('Incomplete request', async () => {
      const result = await request(app).post(url).send({});
      expect(result.body).toEqual({ message: 'Incomplete request' });
      expect(result.status).toBe(400);
    });

    test('Invalid # of floors', async () => {
      const body = {
        name: 'UnitTestGarage',
        numFloors: 0.5,
        spotsPerFloor: [5, 5, 5],
        location: [10, 10],
        overbookRate: 1.5,
        isActive: false,
      };

      const result = await request(app).post(url).send(body);
      expect(result.body).toEqual({ message: 'Number of floors must be >= 1.' });
      expect(result.status).toBe(400);
    });

    test('Invalid spaces per floor', async () => {
      const body = {
        name: 'UnitTestGarage',
        numFloors: 3,
        spotsPerFloor: [5, 5, -1],
        location: [10, 10],
        overbookRate: 1.5,
        isActive: false,
      };

      const result = await request(app).post(url).send(body);
      expect(result.body).toEqual({ message: 'Every floor must have at least 0 spots.' });
      expect(result.status).toBe(400);
    });

    test('Spaces array wrong size', async () => {
      const body = {
        name: 'UnitTestGarage',
        numFloors: 2,
        spotsPerFloor: [5, 5, 5],
        location: [10, 10],
        overbookRate: 1.5,
        isActive: false,
      };

      const result = await request(app).post(url).send(body);
      expect(result.body).toEqual({ message: 'Number of floors does not match length of spotsPerFloor array.' });
      expect(result.status).toBe(400);
    });

    test('Invalid overbook rate', async () => {
      const body = {
        name: 'UnitTestGarage',
        numFloors: 3,
        spotsPerFloor: [5, 5, 5],
        location: [10, 10],
        overbookRate: 0.5,
        isActive: false,
      };

      const result = await request(app).post(url).send(body);
      expect(result.body).toEqual({ message: 'Overbook rate must be at least 100%.' });
      expect(result.status).toBe(400);
    });
  });

  describe('Update a garage', () => {
    const url = '/garage/updateGarage';
    const body = {
      id: 1,
      description: 'Spotula',
      overbookRate: 1.5,
      numFloors: 3,
      spotsPerFloor: 3,
      location: [1, 1],
      isActive: true,
    };

    test('Valid request', async () => {
      const result = await request(app).post(url).send(body);
      //console.log(result.body);
      expect(result.status).toBe(200);
      expect(result.body.GARAGE_ID).toEqual(body.id);
      expect(result.body.DESCRIPTION).toEqual(body.description);
      expect(result.body.OVERBOOK_RATE).toEqual(body.overbookRate);
      expect(result.body.IS_ACTIVE).toEqual(body.isActive);
    });

    test('Invalid request', async () => {
      const result = await request(app).post(url).send({});
      expect(result.status).toBe(500);
    });

    test('Invalid overbook rate', async () => {
      const body = {
        overbookRate: 0.5,
      };
      const result = await request(app).post(url).send(body);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Overbook rate must be at least 100%.' });
    });
  });

  /* describe('Delete a garage', () => {
    test('Valid request', async () => {
      const body = {
        name: 'Test - DeleteMe',
        numFloors: 3,
        spotsPerFloor: [5, 5],
        location: [10, 10],
        overbookRate: 1.5,
        isActive: false,
      };
      const added = await request(app)
        .post(url + '/add')
        .send(body);
      expect(added.status).toBe(200);

      const deleted = await (await request(app).post(url)).send({ garageId: added.body.GARAGE_ID });

      expect(deleted.body).toEqual({ message: 'Garage deleted.' });
      expect(deleted.status).toBe(200);
    });

    test('Invalid request', async () => {
      const result = await request(app).delete(url).send({});
      expect(result.body).toEqual({ message: 'garageId is required.' });
      expect(result.status).toBe(400);
    });
  }); */
});
