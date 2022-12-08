const addRelations = (sequelize) => {
  // Get needed models
  // Any added models should be named here before establishing relations
  const {
    Users,
    Reservation,
    ReservationStatus,
    ReservationType,
    Vehicle,
    Pricing,
    Garage,
    Floor,
    Space,
    SpaceStatus,
  } = sequelize.models;

  try {
    // Relationships

    /* NOTE: 
      Foreign key must be named on both sides of the association.
      This is not normal, I don't know why it is happening. 
      Otherwise, Sequelize will add a second foreign key with a different name, and queries will fail. 
    */

    // Foreign keys on Reservations
    // TODO add FK to garage ID in model AND db
    const reservationFK = {
      memberId: {
        foreignKey: {
          name: 'MEMBER_ID',
          allowNull: false,
        },
      },
      reservationTypeId: {
        foreignKey: {
          name: 'RESERVATION_TYPE_ID',
          allowNull: false,
        },
      },
      vehicleId: {
        foreignKey: {
          name: 'VEHICLE_ID',
          allowNull: true,
        },
      },
      statusId: {
        foreignKey: {
          name: 'STATUS_ID',
          allowNull: false,
        },
      },
      garageId: {
        foreignKey: {
          name: 'GARAGE_ID',
          allowNull: false,
        },
      },
      spaceId: {
        foreignKey: {
          name: 'SPACE_ID',
          allowNull: true,
        },
      },
    };

    Users.hasMany(Reservation, reservationFK.memberId);
    Reservation.belongsTo(Users, reservationFK.memberId);

    ReservationType.hasMany(Reservation, reservationFK.reservationTypeId);
    Reservation.belongsTo(ReservationType, reservationFK.reservationTypeId);

    Vehicle.hasMany(Reservation, reservationFK.vehicleId);
    Reservation.belongsTo(Vehicle, reservationFK.vehicleId);

    ReservationStatus.hasMany(Reservation, reservationFK.statusId);
    Reservation.belongsTo(ReservationStatus, reservationFK.statusId);

    Garage.hasMany(Reservation, reservationFK.garageId);
    Reservation.belongsTo(Garage, reservationFK.garageId);

    Space.hasOne(Reservation, reservationFK.spaceId);
    Reservation.belongsTo(Space, reservationFK.spaceId);

    // Foreign Key on Pricing
    const pricingFK = {
      reservationTypeId: {
        foreignKey: {
          name: 'RESERVATION_TYPE_ID',
          allowNull: false,
        },
      },
    };

    Pricing.belongsTo(ReservationType, pricingFK.reservationTypeId);
    ReservationType.hasOne(Pricing, pricingFK.reservationTypeId);

    // Foreign keys on Vehicle
    const vehicleFK = {
      memberId: {
        foreignKey: {
          name: 'MEMBER_ID',
          allowNull: false,
        },
      },
    };

    Users.hasMany(Vehicle, vehicleFK.memberId);
    Vehicle.belongsTo(Users, vehicleFK.memberId);

    // Foreign keys on Floor
    const floorFK = {
      garageId: {
        foreignKey: {
          name: 'GARAGE_ID',
          allowNull: false,
        },
      },
    };

    Garage.hasMany(Floor, floorFK.garageId);
    Floor.belongsTo(Garage, floorFK.garageId);

    // Foreign keys on Space
    const spaceFK = {
      garageId: {
        foreignKey: {
          name: 'GARAGE_ID',
          allowNull: false,
        },
      },
      floorId: {
        foreignKey: {
          name: 'FLOOR_ID',
          allowNull: false,
        },
      },
      statusId: {
        foreignKey: {
          name: 'STATUS_ID',
          defaultValue: 0,
        },
      },
    };

    Garage.hasMany(Space, spaceFK.garageId);
    Space.belongsTo(Garage, spaceFK.garageId);

    Floor.hasMany(Space, spaceFK.floorId);
    Space.belongsTo(Floor, spaceFK.floorId);

    SpaceStatus.hasMany(Space, spaceFK.statusId);
    Space.belongsTo(SpaceStatus, spaceFK.statusId);

    console.log('Relations added to models.');
  } catch (error) {
    console.log('Failed to add relations to models.');
  }
};

module.exports = addRelations;
