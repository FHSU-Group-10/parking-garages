// Controller to test
const accessController = require('../../controllers/accessController');
// Other controllers involved in tests
const reservationController = require('../../controllers/reservationController');
// Models involved
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Reservation } = sequelize.models;

jest.setTimeout(10000);

describe('Access Controller', () => {
  describe('reservationSearch', () => {
    let reservation;
    const plate = {
      number: 'NOBR8X',
      state: 'AK',
    };

    beforeEach(async () => {
      const startTime = new Date();
      let endTime = new Date();
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);
      //endTime.setHours(endTime.getHours() + 4);
      const a = await Reservation.findOne();

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
    });

    test('Valid Plate', async () => {
      const match = await accessController.reservationCodeSearch(reservation.GARAGE_ID, plate.number, plate.state);
      expect(match).not.toBeNull();
      expect(match.RESERVATION_ID).toBe(reservation.RESERVATION_ID);
    });

    test('Invalid Plate', async () => {
      const match = await accessController.reservationCodeSearch(reservation.GARAGE_ID, '        ', 'nostate');
      expect(match).toBeNull();
    });

    test('Invalid Garage', async () => {
      const match = await accessController.reservationCodeSearch(0, plate.number, plate.state);
      expect(match).toBeNull();
    });

    afterEach(async () => {
      await Reservation.destroy({
        where: {
          RESERVATION_ID: reservation.RESERVATION_ID,
        },
      });
    });
  });

  describe('reservationCodeSearch', () => {
    let reservation;

    beforeEach(async () => {
      const startTime = new Date();
      let endTime = new Date();
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);
      //endTime.setHours(endTime.getHours() + 4);
      const a = await Reservation.findOne();

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
        console.error('****', e);
      }
    });

    test('Valid Code', async () => {
      const match = await accessController.reservationCodeSearch(reservation.GARAGE_ID, reservation.RES_CODE);
      expect(match).not.toBeNull();
      expect(match.RESERVATION_ID).toBe(reservation.RESERVATION_ID);
    });

    test('Invalid Code', async () => {
      const match = await accessController.reservationCodeSearch(reservation.GARAGE_ID, 'OIOIOIOI');
      expect(match).toBeNull();
    });

    test('Invalid Garage', async () => {
      const match = await accessController.reservationCodeSearch(0, reservation.RES_CODE);
      expect(match).toBeNull();
    });

    afterEach(async () => {
      await Reservation.destroy({
        where: {
          RESERVATION_ID: reservation.RESERVATION_ID,
        },
      });
    });
  });

  describe('updateState', () => {
    let reservation;

    beforeEach(() => {
      reservation = {};
    });

    test('Entering with valid single reservation', () => {
      reservation = { RESERVATION_TYPE_ID: 1, STATUS_ID: 1 }; // single, created
      accessController.updateState(reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    test('Entering with valid guaranteed reservation for the first time', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 1 }; // guaranteed, created
      accessController.updateState(reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    test('Entering with valid guaranteed reservation that has been used before', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 4 }; // guaranteed, valid
      accessController.updateState(reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    test('Exiting with single reservation', () => {
      reservation = { RESERVATION_TYPE_ID: 1, STATUS_ID: 3 }; // single, inGarage
      accessController.updateState(reservation);
      expect(reservation.STATUS_ID).toBe(5); // complete
    });

    test('Exiting with guaranteed reservation', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 3 }; // guaranteed, inGarage
      accessController.updateState(reservation);
      expect(reservation.STATUS_ID).toBe(4); // valid
    });
  });

  describe('assignSpace', () => {
    let reservation;

    beforeEach(() => {
      reservation = {};
    });

    test('Valid space assigned', async () => {
      reservation.GARAGE_ID = 1;
      const assigned = await accessController.assignSpace(reservation);

      expect(assigned.spaceNumber).not.toBeNull();
      expect(assigned.floorNumber).not.toBeNull();
    });

    test('Invalid garageID', async () => {
      reservation.GARAGE_ID = 0;
      const assigned = await accessController.assignSpace(reservation);

      expect(assigned.spaceNumber).toBeNull();
      expect(assigned.floorNumber).toBeNull();
    });
  });

  describe('callElevator', () => {
    test('Function exists', async () => {
      await accessController.callElevator();
      expect(true).toBe(true);
    });
  });
});
