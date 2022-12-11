INSERT INTO g10."FLOORS" ("FLOOR_NUM","SPACE_COUNT","GARAGE_ID") VALUES
	 (1,3,2),
	 (2,3,2),
	 (1,3,1),
	 (2,3,1),
	 (3,3,1),
	 (1,3,3),
	 (2,3,3),
	 (3,3,3),
	 (1,2,4),
	 (2,2,4);
INSERT INTO g10."FLOORS" ("FLOOR_NUM","SPACE_COUNT","GARAGE_ID") VALUES
	 (3,2,4),
	 (4,2,4),
	 (5,2,4),
	 (1,2,5),
	 (2,2,5);
INSERT INTO g10."VEHICLES" ("DESCRIPTION","PLATE_NUMBER","PLATE_STATE","IS_ACTIVE","MEMBER_ID") VALUES
	 ('La Ferrari','ABC123','StateOfMind',true,12),
	 ('My jeep','FLIPME','CA',true,16),
	 ('My moped','BUZZZZ','VT',false,16),
	 ('My Truck','NOBR8X','AK',true,16),
	 ('My car','4THEWIN','ME',true,16);
INSERT INTO g10."SPACES" ("WALK_IN","SPACE_NUM","GARAGE_ID","FLOOR_ID","STATUS_ID") VALUES
	 (false,1,1,2,0),
	 (false,1,4,15,0),
	 (false,1,2,11,0),
	 (false,1,3,12,0),
	 (false,2,3,12,0),
	 (false,3,3,12,0),
	 (false,1,3,13,0),
	 (false,2,3,13,0),
	 (false,3,3,13,0),
	 (false,1,3,14,0);
INSERT INTO g10."SPACES" ("WALK_IN","SPACE_NUM","GARAGE_ID","FLOOR_ID","STATUS_ID") VALUES
	 (false,2,3,14,0),
	 (false,3,3,14,0),
	 (false,2,4,15,0),
	 (false,1,4,16,0),
	 (false,2,4,16,0),
	 (false,1,4,17,0),
	 (false,2,4,17,0),
	 (false,1,4,18,0),
	 (false,2,4,18,0),
	 (false,1,4,19,0);
INSERT INTO g10."SPACES" ("WALK_IN","SPACE_NUM","GARAGE_ID","FLOOR_ID","STATUS_ID") VALUES
	 (false,2,4,19,0),
	 (false,1,5,20,0),
	 (false,2,5,20,0),
	 (false,1,5,21,0),
	 (false,2,5,21,0),
	 (false,2,1,1,0),
	 (false,1,1,1,1),
	 (false,3,1,1,0),
	 (false,3,1,2,0),
	 (false,1,1,3,0);
INSERT INTO g10."SPACES" ("WALK_IN","SPACE_NUM","GARAGE_ID","FLOOR_ID","STATUS_ID") VALUES
	 (false,2,1,3,0),
	 (false,3,1,3,0),
	 (false,2,2,11,0),
	 (false,3,2,11,0),
	 (false,1,2,34,0),
	 (false,2,2,34,0),
	 (false,3,2,34,0),
	 (false,2,1,2,0);
INSERT INTO g10."SPACE_STATUS" ("DESCRIPTION") VALUES
	 ('empty'),
	 ('full'),
	 ('notAvailable');
INSERT INTO g10."RESERVATION_TYPE" ("DESCRIPTION") VALUES
	 ('single'),
	 ('guaranteed'),
	 ('walkIn');
INSERT INTO g10."RESERVATION_STATUS" ("DESCRIPTION") VALUES
	 ('created'),
	 ('canceled'),
	 ('inGarage'),
	 ('valid'),
	 ('complete');
INSERT INTO g10."RESERVATIONS" ("START_TIME","END_TIME","DATE_CREATED","EXTRA_GRACE","RES_CODE","MEMBER_ID","RESERVATION_TYPE_ID","VEHICLE_ID","STATUS_ID","GARAGE_ID","SPACE_ID") VALUES
	 ('2022-12-09 13:00:00-06','2022-12-09 23:00:00-06','2022-12-09 12:06:11.348-06',NULL,'KAEJTZCZ',16,1,NULL,1,5,NULL),
	 ('2022-12-08 12:00:00-06',NULL,'2022-12-09 12:03:40.571-06',NULL,'FTZVPRTA',16,2,NULL,1,4,NULL),
	 ('2022-12-08 12:00:00-06',NULL,'2022-12-09 12:03:17.268-06',NULL,'TNDWCDSZ',16,2,4,1,2,NULL),
	 ('2022-12-09 18:30:00-06','2022-12-09 19:00:00-06','2022-12-09 18:04:55.131-06',NULL,'UEDQMGWU',16,1,3,1,4,NULL),
	 ('2022-12-09 13:00:00-06','2022-12-09 23:00:00-06','2022-12-09 12:06:11.348-06',NULL,'MMNDHFWT',16,1,2,1,1,31);
INSERT INTO g10."GARAGES" ("DESCRIPTION","FLOOR_COUNT","LAT","LONG","OVERBOOK_RATE","IS_ACTIVE") VALUES
	 ('Easy Spaces',5,'23','23',1.5,true),
	 ('ParkingSpaceX',2,'34','86',1.5,true),
	 ('AlwaysUnavailable',3,'1','1',1.1,false),
	 ('Park-a-lot',2,'1','1',1.1,true),
	 ('Spotula',3,'1','1',1.5,true);
INSERT INTO g10."GARAGES" ("DESCRIPTION","FLOOR_COUNT","LAT","LONG","OVERBOOK_RATE","IS_ACTIVE") VALUES
	 ('Easy Spaces',5,'23','23',1.5,true),
	 ('ParkingSpaceX',2,'34','86',1.5,true),
	 ('AlwaysUnavailable',3,'1','1',1.1,false),
	 ('Park-a-lot',2,'1','1',1.1,true),
	 ('Spotula',3,'1','1',1.5,true);
INSERT INTO g10."PRICING" ("DESCRIPTION","COST","DAILY_MAX","RESERVATION_TYPE_ID") VALUES
	 ('single','8',50,1),
	 ('walkIn','10',50,3),
	 ('guaranteed','6',50,2);
INSERT INTO g10."USERS" ("USERNAME","PW","FIRST_NAME","LAST_NAME","EMAIL","PHONE","IS_OPERATOR") VALUES
	 ('prof_X','$2b$10$2KRKOMn2P2/GPKy4imH1ie4lZIAKSGozS6.59dcvTXO/tBFRTBj5W','Charles','Xavier','telepath@gmail.com','1234567890',false),
	 ('Do Not Delete','$2b$10$o6B90xsN9aM5zZgkV1xo2etgrCw49Xse8zWoFB6BX59KJvSQjGNqq','People','Person','user@domain.com','1234561212',false),
	 ('DrGhunaim','$2b$10$hOvlbMNkyw6GbszEM/Ijnuq7gChU79JUjTtW.sZRcho0b7dxGvsUm','Hussam','Ghunaim','hmg@fhsu.edu','1234567890',true),
	 ('peterParker','$2b$10$Dg13tpfG84a5v0QliQg.Lupo2Dcw31xPwWJxi3y4f/Pml/J32LjpW','Spider','Man','not_spiderman@gmail.com','1234567890',false);
