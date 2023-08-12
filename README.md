# Project Name

Project: scoreapi

## Table of Contents

- [Getting Started](#getting-started)
- [Major Version](#Major-Version)
- [Minor Version](#Minor-Version)
- [Patch Version](#Patch-Version)
- [Current Version](#Current-Version)
- [Side Note](#Side-Note)
- [Commit Message](#Commit-Message)


## Getting Started

To set up and run the project locally, follow these steps:

1. Clone the repository: `git clone git@github.com:kalijson/SocreAPI.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the API documentation at [http://localhost:3000/documentation](http://localhost:3000/documentation)

## Major Version 
 *version: 1.0.0*
- Project backbone established.
- Sequelize ORM integrated for database interactions.
- Swagger documentation set up for API endpoints.

 *version: 2.0.0*
- @fastify/auth and @fastify/jwt uninstalled switched to jsonwebtoken
- changes done to tblUserLoginInfo to have a belongsTo relationship to UserTable
- swagger changed to incorporate JWT tokens
- middleware added to run on '/' test route that reads the token, and checks its validity, saves device info of incorrect tokens to **later on** prevent DOS attack.
- folder structure changed

 *version: 3.0.0*
- sequelize multicall and multisync problem solved
- method of quering database changed

## Minor Version
*version: 1.1.1*
- tbUsers and tbUserLoginInfos models created

*version: 1.2.1*
- userSignup api created to generate JWT token so we can start working with login
- *userSignup api is **not** completed*, just the **bare minimum** to generate JWT token.
- JWT incorporated in fastify to return token to login
- bcrypt incorporated in fastify to hash password

*version: 2.1.0*
- @fastify/cors installed to incorporate localhost

*version: 1.3.1*
- signInUser api created, on successfull login we generate JWT token.
- swagger for the above mentioned api has been completed.
- test complete

*version: 1.4.1*
- on login all tblUserLoginInfo has been set in the table
- initially ***WrUserType*** has been set to 0 by default: during sigin/signup
- ua-parser-js package has been used to breakdown device information
- enum alternative has been used for **WrUserType**


## Patch Version
 *version: 1.0.1*
- .env file added
*version: 2.1.1*
- authentication error solved

## Current Version
 *version: 2.1.1*


## Side Note
- Update the version number in the `package.json` file to reflect the latest changes.
- The env.txt contains env data I've used, use it for ref. when making your own changes

## Commit Message
Follow the following process while writing the message on your commit
- **type: subject**

*type*

- feat: A new feature introduced.
- fix: A bug fix.
- chore: Routine tasks, maintenance, or housekeeping.
- docs: Documentation updates.
- style: Code style changes (whitespace, formatting, etc.) that don't affect functionality.
- refactor: Code changes that neither fix a bug nor add a feature.
- test: Adding or modifying tests.

*subject*
- A concise description of the change. Keep it short (50 characters or less).