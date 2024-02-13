BEGIN;

USE phoStack;

-- Seed data for about table
INSERT INTO about (teamNumber, versionNumber, teamName, releaseDate, productName, productDescription)
VALUES (24, 2, "PhoStack", "2024-04-22", "PhoStack Driver Incentive Program", "Here at PhoStack we are building the tools to create safer driving habits!
Our software application promotes positive driver feedback by allowing driver sponsors to incentivize their drivers on good and bad driving behavior. To begin, drivers will need to apply to their sponsor's organization and receive approval. Sponsors can define behavior criteria for their approved drivers within our software and assign point values associated with behaviors. Drivers will accrue points by implementing good behavior and can purchase products from their sponsors catalog. Happy Driving!");

-- Seed data for Organization table
INSERT INTO Organization (orgName, orgDescription) VALUES 
('Amazon', 'This is the company description for Amazon'),
('Google', 'This is the company description for Google'),
('Tesla', 'This is the company description for Tesla');

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

-- Seed data for DriverApplication table
INSERT INTO DriverApplication (userId, orgId, applicationStatus, employeeCode) VALUES 
('auth0|65b9a896724a3409a69ff940', 1, 'approved', 'iafjaiowj21ji41ij'),
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