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
  orgDescription VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Behavior (
  behaviorId INT AUTO_INCREMENT PRIMARY KEY,
  pointValue INT NOT NULL,
  behaviorName VARCHAR(50),
  behaviorDescription VARCHAR(255),
  behaviorStatus VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS PointLog(
  logId INT AUTO_INCREMENT PRIMARY KEY,
  behaviorId INT NOT NULL,
  pointGivenBy VARCHAR(50),
  pointGivenTo VARCHAR(50),
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (behaviorId) REFERENCES Behavior(behaviorId) 
);

CREATE TABLE IF NOT EXISTS CatalogParam (
	CatalogParamId INT AUTO_INCREMENT PRIMARY KEY,
  CatalogParamSearch VARCHAR(255),
  CatalogParamMinPrice DECIMAL(10,2),
  CatalogParamMaxPrice DECIMAL(10,2),
  CatalogParamCategories VARCHAR(255),
  CatalogParamCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  OrganizationOrgID int NOT NULL,
  FOREIGN KEY (OrganizationOrgID) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS DriverApplication (
  applicationId INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  orgId INT NOT NULL,
  applicationStatus VARCHAR(50),
  employeeCode VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orgId) REFERENCES Organization(orgId)
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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS OrderInfo_Item (
  orderId INT,
  itemId VARCHAR(50),
  quantity INT DEFAULT 1,

  PRIMARY KEY(orderId, itemId)
);

COMMIT;