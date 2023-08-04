# Project Name

Project: scoreapi

## Table of Contents

- [Getting Started](#getting-started)
- [Major Version](#Major-Version)
- [Minor Version](#Minor-Version)
- [Patch Version](#Patch-Version)
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

## Minor Version
*version: 1.1.1*
- tbUsers and tbUserLoginInfos models created

## Patch Version
 *version: 1.0.1*
- .env file added


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