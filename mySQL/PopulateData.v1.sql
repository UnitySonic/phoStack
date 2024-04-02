BEGIN;

USE phoStack;

-- Seed data for about table
INSERT INTO about (teamNumber, versionNumber, teamName, releaseDate, productName, productDescription)
VALUES (24, 2, "PhoStack", "2024-04-22", "PhoStack Driver Incentive Program", "Here at PhoStack we are building the tools to create safer driving habits!
Our software application promotes positive driver feedback by allowing driver sponsors to incentivize their drivers on good and bad driving behavior. To begin, drivers will need to apply to their sponsor's organization and receive approval. Sponsors can define behavior criteria for their approved drivers within our software and assign point values associated with behaviors. Drivers will accrue points by implementing good behavior and can purchase products from their sponsors catalog. Happy Driving!");

-- Seed data for Organization table
INSERT INTO Organization (orgName, orgDescription, orgStatus) VALUES 
('Amazon', 'This is the company description for Amazon', 'active'),
('Google', 'This is the company description for Google', 'active'),
('Tesla', 'This is the company description for Tesla', 'active');

-- Seed data for Behavior table
INSERT INTO Behavior (pointValue, behaviorName, behaviorDescription, behaviorStatus) VALUES 
(10, 'not speeding', 'going the speed limit', 'active'),
(20, 'saving a cat', 'Trinh saw a cat in the middle of the road. Instead of running it over, he stopped his car to save the cat.', 'individual'),
(-5, 'speeding', 'Going 15 over the speed limit', 'inactive'),
(-15, 'changing lanes too often', 'changing lanes over 20 times in 1 minute', 'active');

-- Seed data for PointLog table
INSERT INTO PointLog (behaviorId, pointGivenBy, pointGivenTo) VALUES 
(1, 'auth0|65b9a896724a3409a69ff940', 'auth0|65c19bdb336d930a6664aec5'),
(2, 'auth0|65c19bdb336d930a6664aec5', 'auth0|65c19bdb336d930a6664aec5'),
(3, null, 'auth0|65c19bdb336d930a6664aec5'),
(4, null, 'auth0|65c19bdb336d930a6664aec5');

-- Seed data for CatalogParam table
INSERT INTO CatalogParam (CatalogParamSearch, CatalogParamMinPrice, CatalogParamMaxPrice, CatalogParamCategories, OrganizationOrgID) VALUES 
('iphone', 10.50, 50.00, null, 1),
('iphone', 20.00, 100.00, null, 2),
('iphone', 5.00, 30.00, null, 3);

-- Seed data for User
INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, viewAs, selectedOrgId)
VALUES ('auth0|65db74563cd5642ab6486fbb', 'Robert', 'Flobert', 'DriverUser', 'sarasu2@clemson.edu', 'profile_picture_url_here', 'active', 'auth0|65db74563cd5642ab6486fbb', null);

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, viewAs, selectedOrgId)
VALUES ('auth0|65e21a8e65215f17aa508c6c', 'Joe', 'Schmo', 'DriverUser', 'sjeremysarasua@gmail.com', 'profile_picture_url_here', 'active', 'auth0|65e21a8e65215f17aa508c6c', null);

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs)
VALUES ('auth0|65b9a896724a3409a69ff940', 'Trinh', 'Tran', 'NewUser', 'trinht0517@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65b9a896724a3409a69ff940');

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs, selectedOrgId)
VALUES ('auth0|65c191a02a18b1ef030bdd1d', 'Sponsor', 'User', 'SponsorUser', 'muntran0517@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65c191a02a18b1ef030bdd1d', 1);

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs)
VALUES ('auth0|65c297e045eaef5c191a4ec5', 'Admin', 'User', 'AdminUser', 'trinht2002@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65c297e045eaef5c191a4ec5');

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs)
VALUES ('auth0|65cd306958eec057963119ae', 'TrinhProd', 'TranProd', 'NewUser', 'trinht0517@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65cd306958eec057963119ae');

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs, selectedOrgId)
VALUES ('auth0|65d104888e15898d2090754d', 'TrinhProd', 'TranProd', 'SponsorUser', 'muntran0517@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65d104888e15898d2090754d', 1);

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs, selectedOrgId)
VALUES ('auth0|65ce76a3ee8c93f9886e62e2', 'JeremySponsor', 'SarasuaSponsor', 'SponsorUser', 'jersarasua@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65ce76a3ee8c93f9886e62e2', 1);

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs)
VALUES ('auth0|65d3b4c270752b95a8d5f2ac', 'TrinhProd', 'TranProd', 'AdminUser', 'trinht2002@gmail.com', 'profile_picture_url_here', 'active', 0, 'auth0|65d3b4c270752b95a8d5f2ac');

INSERT INTO User (userId, firstName, lastName, userType, email, picture, userStatus, pointValue, viewAs)
VALUES ('auth0|65c19bdb336d930a6664aec5', 'pizza', 'chicken', 'NewUser', 'john.doe@example.com', 'profile_picture_url_here', 'active', 0, 'auth0|65c19bdb336d930a6664aec5');

INSERT INTO User_Organization(userId, orgId)
VALUES ('auth0|65c191a02a18b1ef030bdd1d', 1);

INSERT INTO User_Organization(userId, orgId)
VALUES ('auth0|65d104888e15898d2090754d', 1);

INSERT INTO User_Organization(userId, orgId)
VALUES ('auth0|65ce76a3ee8c93f9886e62e2', 1);

-- Seed data for DriverApplication table
INSERT INTO DriverApplication (userId, orgId, applicationStatus, employeeCode) VALUES 
('auth0|65c19bdb336d930a6664aec5', 1, 'new', '324ij21i4jnfnf');

-- Seed data for DriverApplicationLog table
INSERT INTO DriverApplicationLog (applicationId, applicationStatus, reason) VALUES 
(1, 'new', 'This is a new application'),
(1, 'approved', 'approved application');

-- Seed data for OrderInfo table
INSERT INTO OrderInfo (orderTotal, orderStatus, orderBy, orderFor) VALUES 
(100.00, 'Completed', 'auth0|65b9a896724a3409a69ff940', 'auth0|65b9a896724a3409a69ff940'),
(50.00, 'Processing', 'auth0|65b9a896724a3409a69ff940', 'auth0|65b9a896724a3409a69ff940');

-- Seed data for OrderInfo_Item table
INSERT INTO OrderInfo_Item (orderId, itemId, quantity) VALUES 
(1, 'v1|225635271055|524764581014', 1),
(1, 'v1|363652176607|632877015893', 1),
(2, 'v1|354393080164|623805477111', 1);

COMMIT;