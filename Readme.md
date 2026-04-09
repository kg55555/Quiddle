# Quiddle
## Team name incoming
### Kevin, DV, Justin

This is the repository for our final project Quiddle, which is a quiz creation/taking website designed to
tackle the challenge of students looking for practice resources.

The structure of the project consists of the client folder, which has the Vite React frontend and the server folder,
which contains the ExpressJS backend. Selenium functional tests are located in the tests folder, while unittests are within
their respective subfolders in client and server. 

The project can be run by cloning locally and having a correct setup of the environment variables, which consist of the variables
below in the client folder.

VITE_APP_BACKEND_URL=
VITE_APP_FRONTEND_URL=

As for the server, there are these variables listed below.

DATABASE_URL=
PORT=
ENVIRONMENT=
FRONTEND_URL=
SMTP_USER=
GOOGLE_APP_PASS=
SMTP_TEST_RECEIVER=
PRIVATE_KEY=
PUBLIC_KEY=

A gmail account is used for sending verfication emails while private/public keys are used for jwt authentication.

There is a Github Actions setup for the automated execution of unittests and functional tests on a push to the dev and main branches, which
is located in the .github/workflows/test.yml file. 
