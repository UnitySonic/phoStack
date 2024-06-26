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
  userStatus VARCHAR(50) DEFAULT 'active',
  selectedOrgId INT,
  viewAs VARCHAR(50) 
);


CREATE TABLE IF NOT EXISTS User_Organization (
  userId VARCHAR(50) NOT NULL,
  orgId INT NOT NULL,
  memberStatus VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pointValue INT DEFAULT 0,

  PRIMARY KEY(userId, orgId),
  FOREIGN KEY (userId) REFERENCES User(userId),
  FOREIGN KEY (orgId) REFERENCES Organization(orgId)
);

CREATE TABLE IF NOT EXISTS Behavior (
  behaviorId INT AUTO_INCREMENT PRIMARY KEY,
  orgId INT,
  userId VARCHAR(50),
  pointValue INT NOT NULL,
  behaviorName VARCHAR(50),
  behaviorDescription VARCHAR(255),
  behaviorStatus VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orgId) REFERENCES Organization(orgId),
  FOREIGN KEY (userId) REFERENCES User(userId)
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

CREATE TABLE IF NOT EXISTS ShippingAddress(
  addressId INT AUTO_INCREMENT PRIMARY KEY,
  addressFirstName VARCHAR(50),
  addressLastName VARCHAR(50),
  addressLineOne VARCHAR(255),
  addressLineTwo VARCHAR(255),
  addressCity VARCHAR(50),
  addressState VARCHAR(50),
  addressZip VARCHAR(50),
  addressCountry VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS OrderInfo (
  orderId INT AUTO_INCREMENT PRIMARY KEY,
  orderTotal DECIMAL(10,2),
  orderStatus VARCHAR(50),
  orderBy VARCHAR(50),
  orderFor VARCHAR(50),
  orgId INT,
  addressId INT,
  dollarPerPoint DECIMAL(10,2) DEFAULT 0.01,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orderBy) REFERENCES User(userId),
  FOREIGN KEY (orderFor) REFERENCES User(userId),
  FOREIGN KEY (orgId) REFERENCES Organization(orgId),
  FOREIGN KEY (addressId) REFERENCES ShippingAddress(addressId)
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
  orgId INT,
  pointGivenBy VARCHAR(50),
  pointGivenTo VARCHAR(50),
  pointBalance INT DEFAULT 0,
  pointChange INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (behaviorId) REFERENCES Behavior(behaviorId),
  FOREIGN KEY (orderId) REFERENCES OrderInfo(orderId),
  FOREIGN KEY (orgId) REFERENCES Organization(OrgId)
);

CREATE TABLE IF NOT EXISTS CarEvent(
  carEventId INT AUTO_INCREMENT PRIMARY KEY,
  carEventUserId VARCHAR(50),
  carEventSpeed INT,
  carEventSpeedLimit INT,
  carEventCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (carEventUserId) REFERENCES User(userId)
);

CREATE TABLE IF NOT EXISTS Util(
  utilId INT AUTO_INCREMENT PRIMARY KEY,
  lastCarEventChecked INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Cart (
    cartId INT auto_increment PRIMARY KEY,
    userId varchar(50),
    orgId INT,
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (orgId) REFERENCES Organization(orgId)
);


CREATE TABLE IF NOT EXISTS CartItem (
    cartId INT,
    itemId varchar(50) ,
    quantity INT,
    PRIMARY KEY (cartId, itemId),
    FOREIGN KEY (cartId) REFERENCES Cart(cartId)
);

COMMIT;