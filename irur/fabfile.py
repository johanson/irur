#!/usr/bin/env python3
"""Basic helping fabfile for developing."""
import os
import json
import fabric.contrib.project as project
from fabric.api import hosts, local, run, prompt, settings
from fabric.decorators import task
from fabric.colors import green, yellow
from dotenv import load_dotenv


class Config:
    """Manipulate config file."""

    CONFIG_FILE = "config.json"

    def __init__(self):
        """Load config.json as variable for each instance."""
        self.file = {}
        self.load()

    def load(self):
        """Load config.json and save it as instance variable."""
        with open(self.CONFIG_FILE) as f:
            self.file = json.load(f)
            f.close()

    def save(self):
        """Write the contents of variable to config.json file."""
        with open(self.CONFIG_FILE, "r+") as f:
            f.seek(0)
            json.dump(self.file, f, indent=2)
            f.truncate()


load_dotenv()
config = Config()

ha = {
    "user": os.getenv("DEV_USER"),
    "host": os.getenv("DEV_HOST"),
    "port": os.getenv("DEV_PORT"),
    "dir": os.getenv("DEV_DIR"),
}

rsync_remote = "{}@{}:{}".format(ha["user"], ha["host"], ha["port"])
rsync_local_dir = os.path.dirname(os.path.realpath(__file__)) + "/"
exclude_dirs = ["node_modules", "src"]
exclude = " ".join(["--exclude '{0}'".format(item) for item in exclude_dirs])
rsync_extra_opts = "--archive --compress {0} --stats".format(exclude)


@hosts(rsync_remote)
@task
# All the arguments end up as strings with Fabric
def deploy(bump_version="True", sync="True", reload="True"):
    """Compile and upload the project to the HA server for Docker.

    :param bump_version: Bump addon version number before
                         pushing to remote server, defaults to `True`
    :type  bump_version: bool, optional
    :param sync:         Synchronize working directy to remote server
    :type  sync:         bool, optional
    :param reload:       Reload and update addon over SSH
    :type  reload:       bool, optional
    """
    if bump_version == "True":
        bump()

    conf = config.file

    # When build fails or process is killed
    # it can leave the 'dev-' prefix in front.
    proj_name = conf["name"].replace("dev-", "")
    proj_prefix = "dev-{}".format(proj_name)

    print(green("Temporarily change the name to {}").format(proj_prefix))
    conf["name"] = proj_prefix

    config.save()

    print(green("Build the project with vue-cli"))
    build()

    if sync == "True":
        print(green("Synchronizing remote directory"))
        project.rsync_project(
            remote_dir=ha["dir"],
            extra_opts=rsync_extra_opts,
            local_dir=rsync_local_dir,
            delete=False,
        )

    print(green("Change project name back to {0}").format(proj_name))
    conf["name"] = proj_name
    config.save()

    if reload == "True":
        print(green("Updating add-on remotely"))
        run(
            "source /etc/profile.d/homeassistant.sh;"
            "ha addons reload;"
            "ha addons update local_irur"
        )


@task
def serve():
    """Compile with hot-reload for development."""
    local("node_modules/@vue/cli-service/bin/vue-cli-service.js serve")


@task
def build(bump_version="False", push="False"):
    """Compile and minify for production and push to live (master).

    :param bump_version: Bump addon version number before
                         building, defaults to `True`
    :type  bump_version: bool, optional
    :param push:         Push to master branch, defaults to `False`
    :type  push:         bool, optional
    """
    if bump_version == "True":
        bump()
    local("node_modules/@vue/cli-service/bin/vue-cli-service.js build")

    if push == "True":
        push_to_live = prompt(
            yellow("Commit and push to live (master)? [y/N]"), default="N"
        )

        if push_to_live == "Y":
            conf = config.file
            version = conf["version"]
            with settings(warn_only=True):
                local("git add config.json; git add dist")
                local("git commit -m '{0}'".format(version))
                local("git push origin master")
                print(green("All the changes are now live"))


@task
def lint():
    """Lint and fix files."""
    local("node_modules/@vue/cli-service/bin/vue-cli-service.js lint")


@task
def test():
    """Run unit tests with jest."""
    local("node_modules/@vue/cli-service/bin/vue-cli-service.js test:unit")


@task
def api():
    """Start a node server for the backend api."""
    print(
        green(
            "Starting API webserver at http://localhost:{0}".format(
                os.getenv("VUE_APP_SERVER_PORT")
            )
        )
    ),
    local("node server.js --dev")


@task
def bump():
    """Bump addon version number."""
    conf = config.file
    version = conf["version"]
    split = version.split(".")
    patch = str(int(split[2]) + 1)
    new_version = "{}.{}.{}".format(split[0], split[1], patch)
    print(green("Bump version from {0} to {1}".format(version, new_version)))
    conf["version"] = new_version
    config.save()
