# My Job Pitch

## Contributing

All development will be controlled through git, and will follow a standard [Feature Branch](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow.

No contributor should commit directly to the master branch, and all changes must be made via an approved pull request.

### Commit messages

Commit messages should be in the format:

`re #<issue number> - message`

## Android Development

The Android app is simply a user interface backed by a REST API.

### Release Procedure

To create a new release:

1. Checkout the commit of the code you want to release
2. Ensure that the `versioncode` has been incremented since the last release. For example, if the old `versioncode` was `17`, you should change it to `18`
3. Ensure that the `versionname` has been incremented since the last release. For example, if the old `versionname` was "1.1-beta.17", the next release might be named "1.1-beta.18"
4. Commit any changes you just made
5. Create a git tag with name `android-<versionname>` (i.e. `android-1.1-beta.18`):

   ```bash
   git tag android-1.1-beta.18
   git push android-1.1-beta.18
   ```

6. Generate a signed APK file (release or debug as required)
7. [Draft a new release](https://github.com/daggaz/my-job-pitch/releases/new):
   1. Select your new tag
   2. Set the name to the same as the tag name
   3. In the description, list the related issue numbers
   4. Attach the APK binary

## API/Web Development

The API and web interface are django apps. The instructions below will allow you to set up your own instance of these system.

The two mobile applications (in a debug build) will allow you to change the base url for the API to point at your own instance.

### Development Environment

To setup a local development environment, you will need a modern linux PC or VM.  Other OSs will work, but your mileage may vary!

The following instructions are for debian flavor distros (i.e. ubuntu)

#### Install Virtualbox

```bash
  sudo apt-get install virtualbox
```

Or download install from https://www.virtualbox.org/

#### Install Vagrant

```bash
sudo apt-get install vagrant
```

Or download and install from https://www.vagrantup.com/

#### Get sources

```bash
mkdir ~/sources
cd ~/sources
git clone git@github.com:daggaz/my-job-pitch.git
```

#### Vagrant up

This will create a virtual machine with the ubuntu operating system, and install all the prerequisists.

```bash
cd ~/sources/my-job-pitch/web/
vagrant up
```

#### Run the deveopment server

To run the development server, we ssh to the new VM.

The contents of the `~/sources/my-job-pitch/web/` directory will be mounted on the VM at `/vagrant/`

```bash
vagrant ssh
cd /vagrant/src/
./manage.py migrate
./manage.py runserver 0.0.0.0:8000
```

The server should now be accessible from http://127.0.0.1:8080/

