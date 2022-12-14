-- DROP SCHEMA g10;

CREATE SCHEMA g10;

-- g10."GARAGES" definition

-- Drop table

-- DROP TABLE g10."GARAGES";

CREATE TABLE g10."GARAGES" (
	"GARAGE_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(128) NOT NULL,
	"FLOOR_COUNT" int4 NOT NULL,
	"LAT" varchar(64) NOT NULL,
	"LONG" varchar(64) NOT NULL,
	"OVERBOOK_RATE" float8 NULL,
	"IS_ACTIVE" bool NOT NULL,
	CONSTRAINT "GARAGES_DESCRIPTION_key" UNIQUE ("DESCRIPTION"),
	CONSTRAINT "GARAGES_pkey" PRIMARY KEY ("GARAGE_ID")
);


-- g10."RESERVATION_STATUS" definition

-- Drop table

-- DROP TABLE g10."RESERVATION_STATUS";

CREATE TABLE g10."RESERVATION_STATUS" (
	"STATUS_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(64) NOT NULL,
	CONSTRAINT "RESERVATION_STATUS_pkey" PRIMARY KEY ("STATUS_ID")
);


-- g10."RESERVATION_TYPE" definition

-- Drop table

-- DROP TABLE g10."RESERVATION_TYPE";

CREATE TABLE g10."RESERVATION_TYPE" (
	"RESERVATION_TYPE_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(64) NOT NULL,
	CONSTRAINT "RESERVATION_TYPE_pkey" PRIMARY KEY ("RESERVATION_TYPE_ID")
);


-- g10."SPACE_STATUS" definition

-- Drop table

-- DROP TABLE g10."SPACE_STATUS";

CREATE TABLE g10."SPACE_STATUS" (
	"STATUS_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(64) NOT NULL,
	CONSTRAINT "SPACE_STATUS_pkey" PRIMARY KEY ("STATUS_ID")
);


-- g10."USERS" definition

-- Drop table

-- DROP TABLE g10."USERS";

CREATE TABLE g10."USERS" (
	"MEMBER_ID" serial4 NOT NULL,
	"USERNAME" varchar(24) NOT NULL,
	"PW" varchar(64) NOT NULL,
	"FIRST_NAME" varchar(64) NOT NULL,
	"LAST_NAME" varchar(64) NOT NULL,
	"EMAIL" varchar(64) NOT NULL,
	"PHONE" varchar(16) NULL,
	"IS_OPERATOR" bool NOT NULL,
	CONSTRAINT "USERS_USERNAME_key" UNIQUE ("USERNAME"),
	CONSTRAINT "USERS_pkey" PRIMARY KEY ("MEMBER_ID")
);


-- g10."FLOORS" definition

-- Drop table

-- DROP TABLE g10."FLOORS";

CREATE TABLE g10."FLOORS" (
	"FLOOR_ID" serial4 NOT NULL,
	"FLOOR_NUM" int4 NOT NULL,
	"SPACE_COUNT" int4 NOT NULL,
	"GARAGE_ID" int4 NOT NULL,
	CONSTRAINT "FLOORS_pkey" PRIMARY KEY ("FLOOR_ID"),
	CONSTRAINT "FLOORS_GARAGE_ID_fkey" FOREIGN KEY ("GARAGE_ID") REFERENCES g10."GARAGES"("GARAGE_ID") ON DELETE CASCADE ON UPDATE CASCADE
);


-- g10."PRICING" definition

-- Drop table

-- DROP TABLE g10."PRICING";

CREATE TABLE g10."PRICING" (
	"PRICING_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(64) NOT NULL,
	"COST" varchar(24) NOT NULL,
	"DAILY_MAX" int4 NOT NULL,
	"RESERVATION_TYPE_ID" int4 NOT NULL,
	CONSTRAINT "PRICING_pkey" PRIMARY KEY ("PRICING_ID"),
	CONSTRAINT "PRICING_RESERVATION_TYPE_ID_fkey" FOREIGN KEY ("RESERVATION_TYPE_ID") REFERENCES g10."RESERVATION_TYPE"("RESERVATION_TYPE_ID") ON UPDATE CASCADE
);


-- g10."SPACES" definition

-- Drop table

-- DROP TABLE g10."SPACES";

CREATE TABLE g10."SPACES" (
	"SPACE_ID" serial4 NOT NULL,
	"WALK_IN" bool NULL DEFAULT false,
	"SPACE_NUM" int4 NOT NULL,
	"GARAGE_ID" int4 NOT NULL,
	"FLOOR_ID" int4 NOT NULL,
	"STATUS_ID" int4 NULL,
	CONSTRAINT "SPACES_pkey" PRIMARY KEY ("SPACE_ID"),
	CONSTRAINT "SPACES_FLOOR_ID_fkey" FOREIGN KEY ("FLOOR_ID") REFERENCES g10."FLOORS"("FLOOR_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "SPACES_GARAGE_ID_fkey" FOREIGN KEY ("GARAGE_ID") REFERENCES g10."GARAGES"("GARAGE_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "SPACES_STATUS_ID_fkey" FOREIGN KEY ("STATUS_ID") REFERENCES g10."SPACE_STATUS"("STATUS_ID") ON DELETE SET NULL ON UPDATE CASCADE
);


-- g10."VEHICLES" definition

-- Drop table

-- DROP TABLE g10."VEHICLES";

CREATE TABLE g10."VEHICLES" (
	"VEHICLE_ID" serial4 NOT NULL,
	"DESCRIPTION" varchar(64) NULL,
	"PLATE_NUMBER" varchar(16) NOT NULL,
	"PLATE_STATE" varchar(16) NOT NULL,
	"IS_ACTIVE" bool NOT NULL,
	"MEMBER_ID" int4 NOT NULL,
	CONSTRAINT "VEHICLES_pkey" PRIMARY KEY ("VEHICLE_ID"),
	CONSTRAINT "VEHICLES_MEMBER_ID_fkey" FOREIGN KEY ("MEMBER_ID") REFERENCES g10."USERS"("MEMBER_ID") ON DELETE CASCADE ON UPDATE CASCADE
);


-- g10."RESERVATIONS" definition

-- Drop table

-- DROP TABLE g10."RESERVATIONS";

CREATE TABLE g10."RESERVATIONS" (
	"RESERVATION_ID" serial4 NOT NULL,
	"START_TIME" timestamptz NOT NULL,
	"END_TIME" timestamptz NULL,
	"DATE_CREATED" timestamptz NULL,
	"EXTRA_GRACE" bool NULL,
	"RES_CODE" varchar(8) NOT NULL,
	"MEMBER_ID" int4 NOT NULL,
	"RESERVATION_TYPE_ID" int4 NOT NULL,
	"VEHICLE_ID" int4 NULL,
	"STATUS_ID" int4 NOT NULL,
	"GARAGE_ID" int4 NOT NULL,
	"SPACE_ID" int4 NULL,
	CONSTRAINT "RESERVATIONS_RES_CODE_key" UNIQUE ("RES_CODE"),
	CONSTRAINT "RESERVATIONS_pkey" PRIMARY KEY ("RESERVATION_ID"),
	CONSTRAINT "RESERVATIONS_GARAGE_ID_fkey" FOREIGN KEY ("GARAGE_ID") REFERENCES g10."GARAGES"("GARAGE_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "RESERVATIONS_MEMBER_ID_fkey" FOREIGN KEY ("MEMBER_ID") REFERENCES g10."USERS"("MEMBER_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "RESERVATIONS_RESERVATION_TYPE_ID_fkey" FOREIGN KEY ("RESERVATION_TYPE_ID") REFERENCES g10."RESERVATION_TYPE"("RESERVATION_TYPE_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "RESERVATIONS_SPACE_ID_fkey" FOREIGN KEY ("SPACE_ID") REFERENCES g10."SPACES"("SPACE_ID") ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT "RESERVATIONS_STATUS_ID_fkey" FOREIGN KEY ("STATUS_ID") REFERENCES g10."RESERVATION_STATUS"("STATUS_ID") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "RESERVATIONS_VEHICLE_ID_fkey" FOREIGN KEY ("VEHICLE_ID") REFERENCES g10."VEHICLES"("VEHICLE_ID") ON DELETE SET NULL ON UPDATE CASCADE
);