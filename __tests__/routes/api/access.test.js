// Testing libraries
const request = require('supertest');
const app = require('../../../app');
// Models for test reservations
const connectDB = require('../../../config/dbConn');
const sequelize = connectDB();
const { Reservation, Space } = sequelize.models;

jest.setTimeout(30000);
describe('Access Route', () => {
  describe('Enter', () => {
    const url = '/access/enter';

    describe('By license plate', () => {
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
            VEHICLE_ID: 2,
            STATUS_ID: 1,
            GARAGE_ID: 1,
            SPACE_ID: null,
          });

          plateNumber = 'NOBR8X';
          plateState = 'AK';
        } catch (e) {
          console.error(e);
        }

        // Attempt to enter with that reservation
        const body = {
          garageId: reservation.GARAGE_ID,
          plateNumber: plateNumber,
          plateState: plateState,
        };
        const results = await request(app).post(url).send(body);

        // Reload the reservation after space assignment
        reservation.reload();

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

        // Reload the reservation after space assignment
        reservation.reload();

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
          if (reservation.SPACE_ID)
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

    describe('By reservation code', () => {
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

        // Reload the reservation after space assignment
        reservation.reload();

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

        // Reload the reservation after space assignment
        reservation.reload();

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

  describe('Exit', () => {
    const enterUrl = '/access/enter';
    const exitUrl = '/access/exit';

    describe('By license plate', () => {
      let reservation, plateNumber, plateState;

      test('Valid Single Reservation', async () => {
        // Create a new reservation
        const startTime = new Date();
        let endTime = new Date();
        endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

        try {
          reservation = await Reservation.create({
            START_TIME: startTime,
            END_TIME: endTime,
            RES_CODE: 'IJKLMNOP',
            MEMBER_ID: 16,
            RESERVATION_TYPE_ID: 1,
            VEHICLE_ID: 3,
            STATUS_ID: 1,
            GARAGE_ID: 1,
            SPACE_ID: null,
          });

          plateNumber = '4THEWIN';
          plateState = 'ME';
        } catch (e) {
          console.error(e);
        }

        // Check that the reservation was successful
        expect(reservation?.RESERVATION_ID).not.toBeNull();

        // Enter the garage with that reservation
        const body = {
          garageId: reservation.GARAGE_ID,
          plateNumber: plateNumber,
          plateState: plateState,
        };
        const enterResult = await request(app).post(enterUrl).send(body);

        // Check that entry was successful
        expect(enterResult.status).toBe(200);

        // Attempt to exit with that same reservation
        const exitResult = await request(app).post(exitUrl).send(body);

        // Reload the reservation after space assignment
        await reservation.reload();

        expect(exitResult.status).toBe(200);
        expect(reservation.STATUS_ID).toBe(5);
        expect(reservation.SPACE_ID).toBeNull();

        // Delete the reservation
        reservation.destroy();
      });

      test('Valid Monthly Reservation', async () => {
        // Create a new reservation
        const startTime = new Date();
        let endTime = new Date();
        endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

        try {
          reservation = await Reservation.create({
            START_TIME: startTime,
            END_TIME: endTime,
            RES_CODE: 'QRSTUVWX',
            MEMBER_ID: 16,
            RESERVATION_TYPE_ID: 2,
            VEHICLE_ID: 4,
            STATUS_ID: 1,
            GARAGE_ID: 1,
            SPACE_ID: null,
          });

          plateNumber = 'FLIPME';
          plateState = 'CA';
        } catch (e) {
          console.error(e);
        }

        // Check that the reservation was successful
        expect(reservation?.RESERVATION_ID).not.toBeNull();

        // Enter the garage with that reservation
        const body = {
          garageId: reservation.GARAGE_ID,
          plateNumber: plateNumber,
          plateState: plateState,
        };
        const enterResult = await request(app).post(enterUrl).send(body);

        // Check that entry was successful
        expect(enterResult.status).toBe(200);

        // Attempt to exit with that same reservation
        const exitResult = await request(app).post(exitUrl).send(body);

        // Reload the reservation after space assignment
        await reservation.reload();

        expect(exitResult.status).toBe(200);
        expect(reservation.STATUS_ID).toBe(4);
        expect(reservation.SPACE_ID).toBeNull();

        // Delete the reservation
        reservation.destroy();
      });

      test('No Reservation', async () => {
        const body = {
          garageId: 1,
          plateNumber: 'NOBR8X',
          plateState: 'AK',
        };
        const results = await request(app).post(exitUrl).send(body);
        expect(results.status).toBe(404);
        expect(results.body?.message).toEqual('No valid reservation found.');
      });

      test('Incomplete request', async () => {
        const body = {
          garageId: null,
          plateNumber: null,
          plateState: null,
        };
        const result = await request(app).post(exitUrl).send(body);
        expect(result.status).toBe(400);
        expect(result.body?.message).toEqual('Incomplete request.');
      });
    });

    describe('By reservation code', () => {
      let reservation;

      test('Valid Single Reservation', async () => {
        // Create a new reservation
        const startTime = new Date();
        let endTime = new Date();
        endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

        try {
          reservation = await Reservation.create({
            START_TIME: startTime,
            END_TIME: endTime,
            RES_CODE: 'CODEA',
            MEMBER_ID: 16,
            RESERVATION_TYPE_ID: 1,
            VEHICLE_ID: null,
            STATUS_ID: 1,
            GARAGE_ID: 1,
            SPACE_ID: null,
          });
        } catch (e) {
          console.error(e);
        }

        // Check that the reservation was successful
        expect(reservation?.RESERVATION_ID).not.toBeNull();

        // Enter the garage with that reservation
        const body = {
          garageId: reservation.GARAGE_ID,
          reservationCode: reservation.RES_CODE,
        };
        const enterResult = await request(app).post(enterUrl).send(body);

        // Check that entry was successful
        expect(enterResult.status).toBe(200);

        // Attempt to exit with that same reservation
        const exitResult = await request(app).post(exitUrl).send(body);

        // Reload the reservation after space assignment
        await reservation.reload();

        expect(exitResult.status).toBe(200);
        expect(reservation.STATUS_ID).toBe(5);
        expect(reservation.SPACE_ID).toBeNull();

        // Delete the reservation
        reservation.destroy();
      });

      test('Valid Monthly Reservation', async () => {
        // Create a new reservation
        const startTime = new Date();
        let endTime = new Date();
        endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

        try {
          reservation = await Reservation.create({
            START_TIME: startTime,
            END_TIME: endTime,
            RES_CODE: 'CODEB',
            MEMBER_ID: 16,
            RESERVATION_TYPE_ID: 2,
            VEHICLE_ID: null,
            STATUS_ID: 1,
            GARAGE_ID: 1,
            SPACE_ID: null,
          });
        } catch (e) {
          console.error(e);
        }

        // Check that the reservation was successful
        expect(reservation?.RESERVATION_ID).not.toBeNull();

        // Enter the garage with that reservation
        const body = {
          garageId: reservation.GARAGE_ID,
          reservationCode: reservation.RES_CODE,
        };
        console.log('***', body);
        const enterResult = await request(app).post(enterUrl).send(body);
        console.log(enterResult);
        // Check that entry was successful
        expect(enterResult.status).toBe(200);

        // Attempt to exit with that same reservation
        const exitResult = await request(app).post(exitUrl).send(body);

        // Reload the reservation after space assignment
        await reservation.reload();

        expect(exitResult.status).toBe(200);
        expect(reservation.STATUS_ID).toBe(4);
        expect(reservation.SPACE_ID).toBeNull();

        // Delete the reservation
        reservation.destroy();
      });

      test('No Reservation', async () => {
        const body = {
          garageId: 1,
          reservationCode: 'IOIOIOIO',
        };
        const results = await request(app).post(exitUrl).send(body);
        expect(results.status).toBe(404);
        expect(results.body?.message).toEqual('No valid reservation found.');
      });

      test('Incomplete request', async () => {
        const body = {
          garageId: null,
          reservationCode: null,
        };
        const result = await request(app).post(exitUrl).send(body);
        expect(result.status).toBe(400);
        expect(result.body?.message).toEqual('Incomplete request.');
      });
    });
  });
});
