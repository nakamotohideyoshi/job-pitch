# My Job Pitch

## Contributing

All development will be controlled through git, and will follow a standard [Feature Branch](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow.

No contributor should commit directly to the master branch, and all changes must be made via an approved pull request.

## Development Environment

To setup a local development environment, you will need a modern linux PC or VM.  Other OSs will work, but your mileage may vary!

The following instructions are for debian flavor distros (i.e. ubuntu)

### Install Virtualbox

```bash
  sudo apt-get install virtualbox
```

Or download install from https://www.virtualbox.org/

### Install Vagrant

```bash
sudo apt-get install vagrant
```

Or download and install from https://www.vagrantup.com/

### Get sources

```bash
mkdir ~/sources
cd ~/sources
git clone git@github.com:daggaz/my-job-pitch.git
```

### Vagrant up

This will create a virtual machine with the ubuntu operating system, and install all the prerequisists.

```bash
cd ~/sources/my-job-pitch/web/
vagrant up
```

### Run the deveopment server

To run the development server, we ssh to the new VM.

The contents of the `~/sources/my-job-pitch/web/` directory will be mounted on the VM at `/vagrant/`

```bash
vagrant ssh
cd /vagrant/src/
./manage.py migrate
./manage.py runserver 0.0.0.0:8000
```

The server should now be accessible from http://127.0.0.1:8080/

