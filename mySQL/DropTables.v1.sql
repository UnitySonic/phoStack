BEGIN;

USE phoStack;

DROP TABLE IF EXISTS about;
DROP TABLE IF EXISTS PointLog;
DROP TABLE IF EXISTS CatalogParam;
DROP TABLE IF EXISTS DriverApplication;
DROP TABLE IF EXISTS DriverApplicationLog;
DROP TABLE IF EXISTS OrderInfo_Item;
DROP TABLE IF EXISTS OrderInfo;
DROP TABLE IF EXISTS Behavior;
DROP TABLE IF EXISTS User_Organization;
DROP TABLE IF EXISTS CarEvent;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Organization;
DROP TABLE IF EXISTS ShippingAddress;
DROP TABLE IF EXISTS Util;

COMMIT;
