#!/usr/bin/env python3
import os
import json
import fabric.contrib.project as project
from fabric.api import hosts, local, run
from fabric.decorators import task
from fabric.colors import green
from dotenv import load_dotenv


class Config:
    def __init__(self):
        self.file = {}
        self.location = 'config.json'
        self.open()

    def open(self):
        with open(self.location) as f:
            self.file = json.load(f)
            f.close()

    def save(self):
        with open(self.location, 'r+') as f:
            f.seek(0)
            json.dump(self.file, f, indent=2)
            f.truncate()


load_dotenv()
config = Config()

ha = {
    'user': os.getenv('DEV_USER'),
    'host': os.getenv('DEV_HOST'),
    'port': os.getenv('DEV_PORT'),
    'dir': os.getenv('DEV_DIR')
}

rsync_remote = '{}@{}:{}'.format(ha['user'], ha['host'], ha['port'])
rsync_local_dir = os.path.dirname(os.path.realpath(__file__)) + '/'
rsync_extra_opts = ('--archive --compress --progress '
                    '--exclude \'node_modules\' --quiet')


@hosts(rsync_remote)
@task
def deploy(bump_version=True, sync=True, reload=True):
    """
    Compile and upload the project to the HA server for Docker
    :param bump_version: Bump addon version number before
                         pushing to remote server, defaults to `True`
    :type  bump_version: bool, optional
    :param sync:         Synchronize working directy to remote server
    :type  sync:         bool, optional
    :param reload:       Reload and update addon over SSH
    :type  reload:       bool, optional
    """

    if bump_version:
        bump()

    conf = config.file

    proj_name = conf['name']
    proj_prefix = 'dev-{}'.format(proj_name)

    print(green('Temporarily change the name to {}').format(proj_prefix))
    conf['name'] = proj_prefix

    config.save()

    print(green('Build the project with vue-cli'))
    build()

    if sync:
        print(green('Synchronizing remote directory'))
        project.rsync_project(remote_dir=ha['dir'],
                              extra_opts=rsync_extra_opts,
                              local_dir=rsync_local_dir,
                              delete=False)

    print(green('Change project name back to {0}').format(proj_name))
    conf['name'] = proj_name
    config.save()

    if reload:
        print(green('Updating add-on remotely'))
        run('source /etc/profile.d/homeassistant.sh;'
            'ha addons reload;'
            'ha addons update local_irur')


@task
def serve():
    """Compile with hot-reload for development"""
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js serve')


@task
def build():
    """Compile and minify for production"""
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js build')


@task
def lint():
    """Lint and fix files"""
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js lint')


@task
def api():
    """Start a node server for the backend api"""
    print(green('Starting API webserver at http://localhost:{0}'
                .format(os.getenv('VUE_APP_SERVER_PORT')))),
    local('node server.js --dev')


@task
def bump():
    """Bump addon version number"""
    conf = config.file
    version = conf['version']
    split = version.split('.')
    patch = str(int(split[2]) + 1)
    new_version = "{}.{}.{}".format(split[0], split[1], patch)
    print(green('Bump project version from {0} to {1}'
                .format(version, new_version)))
    conf['version'] = new_version
    config.save()
