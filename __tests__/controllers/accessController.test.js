// Controller to test
const accessController = require('../../controllers/accessController');
// Models involved
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Reservation, Space } = sequelize.models;

jest.setTimeout(10000);
// TODO Ensure spaces are freed if occupied by a test
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
      const match = await accessController.reservationSearch(reservation.GARAGE_ID, plate.number, plate.state);
      expect(match).not.toBeNull();
      expect(match.RESERVATION_ID).toBe(reservation.RESERVATION_ID);
    });

    test('Invalid Plate', async () => {
      const match = await accessController.reservationSearch(reservation.GARAGE_ID, '        ', 'nostate');
      expect(match).toBeNull();
    });

    test('Invalid Garage', async () => {
      const match = await accessController.reservationSearch(0, plate.number, plate.state);
      expect(match).toBeNull();
    });

    test('Too Early', async () => {
      // Destroy first reservation to replace it
      await Reservation.destroy({
        where: {
          RESERVATION_ID: reservation.RESERVATION_ID,
        },
      });

      // Create a new reservation for tomorrow
      let startTime = new Date();
      startTime.setTime(startTime.getTime() + 24 * 60 * 60 * 1000); // One day later
      let endTime = new Date(startTime);
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'WXYZABCD',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: 2,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error('****', e);
      }
      console.log(reservation);

      // Try to use tomorrow's reservation
      const match = await accessController.reservationSearch(reservation.GARAGE_ID, plate.number, plate.state);
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

    test('Too Early', async () => {
      // Destroy first reservation to replace it
      await Reservation.destroy({
        where: {
          RESERVATION_ID: reservation.RESERVATION_ID,
        },
      });

      // Create a new reservation for tomorrow
      let startTime = new Date();
      startTime.setTime(startTime.getTime() + 24 * 60 * 60 * 1000); // One day later
      let endTime = new Date(startTime);
      endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);

      try {
        reservation = await Reservation.create({
          START_TIME: startTime,
          END_TIME: endTime,
          RES_CODE: 'WXYZABCD',
          MEMBER_ID: 16,
          RESERVATION_TYPE_ID: 1,
          VEHICLE_ID: null,
          STATUS_ID: 1,
          GARAGE_ID: 1,
        });
      } catch (e) {
        console.error('****', e);
      }
      console.log(reservation);

      // Try to use tomorrow's reservation
      const match = await accessController.reservationCodeSearch(reservation.GARAGE_ID, reservation.RES_CODE);
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
      accessController.updateState('entry', reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    test('Entering with valid guaranteed reservation for the first time', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 1 }; // guaranteed, created
      accessController.updateState('entry', reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    test('Entering with valid guaranteed reservation that has been used before', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 4 }; // guaranteed, valid
      accessController.updateState('entry', reservation);
      expect(reservation.STATUS_ID).toBe(3); // inGarage
    });

    // These tests must be updated to pass garageId and spaceId. Should prob make a reservation before each and clean up after
    /* 
    test('Exiting with single reservation', () => {
      reservation = { RESERVATION_TYPE_ID: 1, STATUS_ID: 3 }; // single, inGarage
      accessController.updateState('exit', reservation);
      expect(reservation.STATUS_ID).toBe(5); // complete
    });

    test('Exiting with guaranteed reservation', () => {
      reservation = { RESERVATION_TYPE_ID: 2, STATUS_ID: 3 }; // guaranteed, inGarage
      accessController.updateState('exit', reservation);
      expect(reservation.STATUS_ID).toBe(4); // valid 
    });*/
  });

  describe('assignSpace', () => {
    let reservation;

    beforeEach(() => {
      reservation = {};
    });

    test('Valid space assigned', async () => {
      reservation.GARAGE_ID = 1;
      reservation.assigned = await accessController.assignSpace(reservation);

      expect(reservation.assigned.spaceNumber).not.toBeNull();
      expect(reservation.assigned.floorNumber).not.toBeNull();
    });

    test('Invalid garageID', async () => {
      reservation.GARAGE_ID = 0;
      reservation.assigned = await accessController.assignSpace(reservation);

      expect(reservation.assigned.spaceNumber).toBeNull();
      expect(reservation.assigned.floorNumber).toBeNull();
    });

    afterEach(async () => {
      // Cleanup spaces
      if (reservation.assigned.spaceNumber)
        Space.update(
          { STATUS_ID: 0 },
          {
            where: {
              GARAGE_ID: reservation.GARAGE_ID,
              SPACE_NUM: reservation.assigned.spaceNumber,
              FLOOR_NUM: reservation.assigned.floorNumber,
            },
          }
        );
    });
  });

  describe('callElevator', () => {
    test('Function exists', async () => {
      await accessController.callElevator();
      expect(true).toBe(true);
    });
  });
});
