use phoStackProd;

INSERT INTO organization
VALUES
	(001,"Amazon"),
    (002, "Starbucks");


Insert INTO catalog_param
VALUES
	(001, "IPhone", 0, 100, "Tech", "2024-02-11 15:30:00", 001),
    (002, "Pencils", 0, 100, "Tools", "2024-02-5 15:30:00", 002);

INSERT INTO behaviour
VALUES
	(001, 10, "Good Driving", "Made it to dest without speeding", 001, 0),
    (002, 50, "Fast Driving", "Made it to dest  1h before estimated", 002, 0);

INSERT INTO user
VALUES
	(001, 10, 001),
    (002, 30, 002);

INSERT INTO point_log
VALUES
	(001, 001, "2024-02-11 15:30:00", 100);

INSERT INTO sponsor_user
VALUES
	(001, 001);

INSERT INTO driver_application
VALUES
	(001,001,001, "In Progress");

INSERT INTO driver_application_update
VALUES
	(001, "2024-02-11 15:30:00", "In Progress", "Reviewing Credentials");

INSERT INTO user_order
VALUES
	(001, "2024-02-11 15:30:00", "Shipping", 001),
    (002, "2024-02-11 15:30:00", "Delivered", 002);


INSERT INTO item
VALUES
	(001, "iPhone"),
    (002, "Pencil");


INSERT INTO order_item
VALUES
	(001, 001),
    (002, 002);


