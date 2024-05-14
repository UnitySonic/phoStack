<h1>Description</h1>
This repository is an archive of the senior semester project I did at Clemson. In this project the goal was to create a fictional website for trucking vendors, who could use the site to customize a rewards program for their drivers

<h1>Features</h1>

-The main feature of the website is it's catalogue. The catalogue is hooked up to Ebay's API, and displays real items from the website. These items can be assigned point values by the sponsors, and be "bought" by the drivers(The items aren't actually ordered). Sponsors can customize the point cost and type of items their drivers will see. When drivers place an order, they're sent an email notification, and are able to check the status of all of their orders. 

-Sponsors can define behaviours. Behaviours represent good or bad actions that add or subtract from a driver's point total respectively.

-Sponsors can also activate a driver view mode. This allows them to see the website from the perspective of one of their drivers. This helps with troubleshooting and even allows sponsors to place orders on their drivers behalf. 

-Automation: There is a system in place where random drivers are made automatically. These drivers undergo randomly generated "events" which represent whatever behaviours the sponsors designated as good or bad. 

-Sponsors have a dashboard where they can see the data of their drivers. They can also generate CSVs and see more detailed reporting including info like how much "money" was spent on items, and what drivers are performing best.


<h1>Running</h1>

1. "npm run dev" in a terminal window in the phostack-react/src directory to get the react frontend up
2. "node src/app.js" in the phostack-express/src directory to get the expressJS backend up

Both of these apps require you to provide your own .env.local file in order for the 3rd party services to function

phostack-react: Requires environmental variables for Auth0
phostack-express: Auth0 AWS(RDS/IAM User/SES), Ebay.
