// Testing libraries
const request = require('supertest');
const app = require('../../../app');
// Models for test reservations
const connectDB = require('../../../config/dbConn');
const sequelize = connectDB();
const { Reservation, Space } = sequelize.models;

jest.setTimeout(30000);
// TODO Ensure spaces are freed if occupied by a test
describe('Access Route', () => {
  describe('Enter by license plate', () => {
    const url = '/access/enter';
    let reservation, plateNumber, plateState;

    test('Valid Reservation', async () => {
      // Create a new reservation
      const startTime = new Date();
      let endTime = new Date();
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'ABCDEFGH',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: null,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error(e);
      }

      // Attempt to enter with that reservation
      const body = {
        garageId: reservation.GARAGE_ID,
        reservationCode: reservation.RES_CODE,
      };
      const results = await request(app).post(url).send(body);
      //console.log(results);
      expect(results.status).toBe(200);
      expect(results.body.spaceNumber).not.toBeNull();
      expect(results.body.floorNumber).not.toBeNull();
    });

    test('No Reservation', async () => {
      const body = {
        garageId: 1,
        plateNumber: 'NOBR8X',
        plateState: 'AK',
      };
      const results = await request(app).post(url).send(body);
      expect(results.status).toBe(404);
      expect(results.body?.message).toEqual('No valid reservation found.');
    });

    test('Too Early for Reservation', async () => {
      // Create a new reservation for tomorrow
      let startTime = new Date();
      startTime.setTime(startTime.getTime() + 24 * 60 * 60 * 1000); // One day later
      let endTime = new Date(startTime);
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'ABCDEFGH',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: 2,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error(e);
      }

      // Attempt to enter with reservation
      const body = {
        garageId: reservation.GARAGE_ID,
        plateNumber: 'NOBR8X',
        plateState: 'AK',
      };
      const results = await request(app).post(url).send(body);

      expect(results.status).toBe(404);
      expect(results.body?.message).toEqual('No valid reservation found.');
    });

    test('Incomplete request', async () => {
      const body = {
        garageId: null,
        plateNumber: null,
        plateState: null,
      };
      const result = await request(app).post(url).send(body);
      expect(result.status).toBe(400);
      expect(result.body?.message).toEqual('Incomplete request.');
    });

    afterEach(async () => {
      // Remove the reservation
      if (reservation?.RESERVATION_ID) {
        // Free the space
        await Space.update(
          { STATUS_ID: 0 },
          {
            where: {
              GARAGE_ID: reservation.GARAGE_ID,
              SPACE_ID: reservation.SPACE_ID,
            },
          }
        );
        // Destroy the reservation
        await Reservation.destroy({
          where: {
            RESERVATION_ID: reservation.RESERVATION_ID,
          },
        });
      }
    });
  });

  describe('Enter by reservation code', () => {
    const url = '/access/enter';
    let reservation, reservationCode;

    test('Valid Reservation', async () => {
      // Create a new reservation
      const startTime = new Date();
      let endTime = new Date();
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'ABCDEFGH',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: null,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error(e);
      }

      // Attempt to enter with that reservation
      const body = {
        garageId: reservation.GARAGE_ID,
        reservationCode: reservation.RES_CODE,
      };
      const results = await request(app).post(url).send(body);
      //console.log(results);
      expect(results.status).toBe(200);
      expect(results.body.spaceNumber).not.toBeNull();
      expect(results.body.floorNumber).not.toBeNull();
    });

    test('No Reservation', async () => {
      const body = {
        garageId: 1,
        reservationCode: 'OIOIOIOI',
      };
      const results = await request(app).post(url).send(body);
      expect(results.status).toBe(404);
      expect(results.body?.message).toEqual('No valid reservation found.');
    });

    test('Too Early for Reservation', async () => {
      // Create a new reservation for tomorrow
      let startTime = new Date();
      startTime.setTime(startTime.getTime() + 24 * 60 * 60 * 1000); // One day later
      let endTime = new Date(startTime);
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'ABCDEFGH',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: null,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error(e);
      }

      // Attempt to enter with reservation
      const body = {
        garageId: reservation.GARAGE_ID,
        reservationCode: reservation.RES_CODE,
      };
      const results = await request(app).post(url).send(body);

      expect(results.status).toBe(404);
      expect(results.body?.message).toEqual('No valid reservation found.');
    });

    test('Incomplete request', async () => {
      const body = {
        garageId: null,
        reservationCode: null,
      };
      const result = await request(app).post(url).send(body);
      expect(result.status).toBe(400);
      expect(result.body?.message).toEqual('Incomplete request.');
    });

    afterEach(async () => {
      // Remove the reservation
      if (reservation?.RESERVATION_ID) {
        // Free the space
        await Space.update(
          { STATUS_ID: 0 },
          {
            where: {
              GARAGE_ID: reservation.GARAGE_ID,
              SPACE_ID: reservation.SPACE_ID,
            },
          }
        );
        // Destroy the reservation
        await Reservation.destroy({
          where: {
            RESERVATION_ID: reservation.RESERVATION_ID,
          },
        });
      }
    });
  });
});
