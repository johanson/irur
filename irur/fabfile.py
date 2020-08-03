#!/usr/bin/env python3
import time
import os
import json
import fabric.contrib.project as project
from fabric.api import hosts, local, run
from fabric.decorators import task
from fabric.colors import green, red
import json

ha = {
    'user': 'root',
    'host': '192.168.0.100',
    'port': 2222,
    'dir': '/root/addons/irur/'
}

rsync_remote = '{}@{}:{}'.format(ha['user'], ha['host'], ha['port'])
rsync_local_dir = os.path.dirname(os.path.realpath(__file__)) + '/'
rsync_extra_opts = ('--archive --compress --progress '
                    '--exclude \'node_modules\' --quiet')


@task
@hosts(rsync_remote)
def deploy():

    with open('config.json', 'r+') as f:
        conf = json.load(f)

        addon_name = conf['name']
        addon_temp_name = '{}_LOCAL'.format(addon_name)
        addon_version = conf['version']
        split = conf['version'].split('.')
        patch = str(int(split[2]) + 1)
        addon_version_new = "{}.{}.{}".format(split[0], split[1], patch)

        print(green('Temporarely change the name to {}').format(addon_temp_name))
        conf['name'] = addon_temp_name
        print(green('Bump project version'))
        conf['version'] = addon_version_new

        f.seek(0)
        json.dump(conf, f, indent=2)
        f.truncate()

        print(green('Build the project with vue-cli'))
        build()

        print(green('Synchronizing remote directory'))
        project.rsync_project(remote_dir=ha['dir'],
                              extra_opts=rsync_extra_opts,
                              local_dir=rsync_local_dir,
                              delete=False)

        print(green('Change project name back to {0}').format(addon_name))
        conf['name'] = addon_name
        f.seek(0)
        json.dump(conf, f, indent=2)
        f.truncate()

        print(green('Updating add-on remotely'))
        run('source /etc/profile.d/homeassistant.sh;'
            'ha addons reload;'
            'ha addons update local_irur')

        f.close()


@task
def serve():
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js serve')


@task
def build():
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js build')


@task
def lint():
    local('node_modules/@vue/cli-service/bin/vue-cli-service.js lint')


@task
def api():
    local('node server.js --dev')