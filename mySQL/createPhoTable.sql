/* Authors: Tim Koehler and Michael Merritt */

/* Create the Pizzeria schema */
DROP SCHEMA IF EXISTS phoStackProd;
CREATE SCHEMA phoStackProd;
use phoStackProd;

/* Create database tables */
CREATE TABLE organization(
	orgID INT AUTO_INCREMENT PRIMARY KEY,
	orgName VARCHAR(50) NOT NULL
    );



CREATE TABLE catalog_param (
    CatalogParamID INT AUTO_INCREMENT PRIMARY KEY,
    CatalogParamSearch VARCHAR(255),
    CatalogParamMinPrice DECIMAL(10,2),
    CatalogParamMaxPrice DECIMAL(10,2),
    CatalogParamCategories VARCHAR(255),
    CatalogParamCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    OrganizationOrgID int NOT NULL,
    FOREIGN KEY (OrganizationOrgID) REFERENCES organization(orgID)
);

CREATE TABLE behaviour(
	behaviourID INT AUTO_INCREMENT PRIMARY KEY,
    behaviourPointValue NUMERIC(4,0) NOT NULL,
    behaviourName VARCHAR(50) NOT NULL,
    behaviourDescription VARCHAR(500) NOT NULL,
    behaviourOrgID INT NOT NULL,
    behaviourSpecial Numeric (1,0),
    FOREIGN KEY(behaviourOrgID) REFERENCES organization(orgId)
);


CREATE TABLE user(
	userID INT AUTO_INCREMENT PRIMARY KEY,
    userPoints NUMERIC(4,0),
    userOrgID INT,
    FOREIGN KEY(userOrgID) REFERENCES organization(orgID)
);
CREATE TABLE point_log(
	pointBehaviourID INT,
    pointUserID INT,
    pointTimestamp DATETIME NOT NULL,
    pointAmount NUMERIC(4,0),
    PRIMARY KEY(pointBehaviourID, pointUserID),
  
    FOREIGN KEY(pointBehaviourID) REFERENCES behaviour(behaviourID),
    FOREIGN KEY(pointUserID) REFERENCES user(userID)
);



CREATE TABLE sponsor_user(
	sponserID INT AUTO_INCREMENT PRIMARY KEY,
    sponsorOrgID INT NOT NULL,
    FOREIGN KEY(sponsorOrgID) REFERENCES organization(orgID)
);


CREATE TABLE driver_application(
	appID INT AUTO_INCREMENT PRIMARY KEY,
    appUserID INT NOT NULL,
    appOrgID INT NOT NULL,
    appStatus VARCHAR(500) NOT NULL,
    
    FOREIGN KEY(appOrgID) REFERENCES organization(orgID),
    FOREIGN KEY(appUserID) REFERENCES user(userID)
);

CREATE TABLE driver_application_update(
	app_updateID INT PRIMARY KEY,
    app_updateTimeStamp DATETIME NOT NULL,
    app_updateStatus VARCHAR(500) NOT NULL,
    app_updateReason VARCHAR(500) NOT NULL,
    
    FOREIGN KEY(app_updateID) REFERENCES driver_application(appID)
  
);


CREATE TABLE user_order(
	orderID INT AUTO_INCREMENT PRIMARY KEY,
    orderTimeStamp DATETIME NOT NULL,
    orderStatus VARCHAR(500) NOT NULL,
    orderUserID INT NOT NULL,
    
    FOREIGN KEY(orderUserID) REFERENCES user(userID)
  
);
CREATE TABLE item(
	itemID INT AUTO_INCREMENT PRIMARY KEY,
    itemName VARCHAR(500) NOT NULL
);
CREATE TABLE order_item(
	orderID INT AUTO_INCREMENT PRIMARY KEY,
    itemID INT NOT NULL,
   
    
    FOREIGN KEY(orderID) REFERENCES user_order(orderID),
    FOREIGN KEY(itemID) REFERENCES item(itemID)
  
);



