BEGIN;

CREATE SCHEMA IF NOT EXISTS phoStack;
USE phoStack;

CREATE TABLE IF NOT EXISTS about (
	id INT AUTO_INCREMENT PRIMARY KEY,
  teamNumber INT,
  versionNumber INT,
  teamName VARCHAR(50),
  releaseDate DATE,
  productName VARCHAR(50),
  productDescription VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS Organization (
  orgId INT AUTO_INCREMENT PRIMARY KEY,
  orgName VARCHAR(50),
  orgDescription VARCHAR(255),
  dollarPerPoint DECIMAL(10,2) DEFAULT 0.01,
  orgStatus VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Behavior (
  behaviorId INT AUTO_INCREMENT PRIMARY KEY,
  orgId INT,
  pointValue INT NOT NULL,
  behaviorName VARCHAR(50),
  behaviorDescription VARCHAR(255),
  behaviorStatus VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orgId) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS CatalogParam (
	CatalogParamId INT AUTO_INCREMENT PRIMARY KEY,
  CatalogParamSearch VARCHAR(255),
  CatalogParamMinPrice DECIMAL(10,2),
  CatalogParamMaxPrice DECIMAL(10,2),
  CatalogParamCategories VARCHAR(255),
  CatalogParamCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  OrganizationOrgID INT,

  FOREIGN KEY (OrganizationOrgID) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS User (
  userId VARCHAR(50) PRIMARY KEY,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  userType VARCHAR(50) DEFAULT "NewUser",
  email VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  picture VARCHAR(255),
  userStatus VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS NewUser (
  userId VARCHAR(50) PRIMARY KEY,

  FOREIGN KEY (userId) REFERENCES User(userId)
);

CREATE TABLE IF NOT EXISTS AdminUser (
  userId VARCHAR(50) PRIMARY KEY,

  FOREIGN KEY (userId) REFERENCES User(userId)
);


CREATE TABLE IF NOT EXISTS SponsorUser (
  userId VARCHAR(50) PRIMARY KEY,
  orgId INT,

  FOREIGN KEY (userId) REFERENCES User(userId),
  FOREIGN KEY (orgId) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS DriverUser (
  userId VARCHAR(50) PRIMARY KEY,
  orgId INT,
  pointValue INT DEFAULT 0,

  FOREIGN KEY (userId) REFERENCES User(userId),
  FOREIGN KEY (orgId) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS DriverApplication (
  applicationId INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(50),
  orgId INT,
  applicationStatus VARCHAR(50),
  employeeCode VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orgId) REFERENCES Organization(orgId),
  FOREIGN KEY (userId) REFERENCES User(userId)
);

CREATE TABLE IF NOT EXISTS DriverApplicationLog(
  logId INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT,
  applicationStatus VARCHAR(50),
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS OrderInfo (
  orderId INT AUTO_INCREMENT PRIMARY KEY,
  orderTotal DECIMAL(10,2),
  orderStatus VARCHAR(50),
  orderBy VARCHAR(50),
  orderFor VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orderBy) REFERENCES User(userId),
  FOREIGN KEY (orderFor) REFERENCES User(userId)
);

CREATE TABLE IF NOT EXISTS OrderInfo_Item (
  orderId INT,
  itemId VARCHAR(50),
  quantity INT DEFAULT 1,

  PRIMARY KEY(orderId, itemId),
  FOREIGN KEY (orderId) REFERENCES OrderInfo(orderId)
);

CREATE TABLE IF NOT EXISTS PointLog(
  logId INT AUTO_INCREMENT PRIMARY KEY,
  behaviorId INT,
  orderId INT,
  pointGivenBy VARCHAR(50),
  pointGivenTo VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (behaviorId) REFERENCES Behavior(behaviorId),
  FOREIGN KEY (orderId) REFERENCES OrderInfo(orderId)
);

COMMIT;