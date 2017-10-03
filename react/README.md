# My Job Pitch
# Requirements
  - Node version: latest
  - Editor: Visual Studio Code or Atom
### Installation
Install the dependencies and devDependencies and start the server.
```sh
$ npm install
$ npm run dev
```
In order to call backend api, you need to enable CORS in backend.
Build Production
```sh
$ npm run  build
```
After finish building, please do followings:
1. Copy index.html from [frontend_src]/static/static/ to [backend_src]/web/templates/
2. Copy rest files from [frontend_src]/static/static/ to [backend_src]/web/static/
3. Copy favicon.ico from [frontend_src]/static/ to [backend_src]/web/static/
