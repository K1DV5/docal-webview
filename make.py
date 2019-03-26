from subprocess import run
from glob import glob
from os import walk, remove, path, getcwd
from shutil import copy, copytree, rmtree
import pkg_resources as pr
import zipfile as zf
import re

VERSION = pr.get_distribution('docal').version
NAME = 'docal'
ASSETS_DIR = path.join('dist', NAME, 'assets')

args = [
    'pyinstaller',
    'docal-webview.py',
    '-n', NAME,
    '--windowed',
    '--add-binary', 'C:\Programs\pandoc\pandoc.exe;.',
    '--add-data', 'C:\Programs\Python\Lib\site-packages\webview\lib\WebBrowserInterop.x64.dll;.',
]

args_add = [
    '--hidden-import', 'numpy',
    '--exclude-module', 'scipy',
    '--exclude-module', 'lib2to3',
]


def sync_version():
    '''make the version number in the front end about the same'''
    file = path.relpath('assets/index.js')

    with open(file) as js:
        new = re.sub(
            r'(?<=let docalVersion =)\s*\'\d+\.\d+\.\d+\'(?=\s*//\s*REPLACE THIS.*)',
            f" '{VERSION}'", js.read())

    with open(file, 'w') as js:
        js.write(new)


def copy_assets():
    if path.exists(ASSETS_DIR):
        rmtree(ASSETS_DIR)
    copytree('assets', path.join('dist', NAME, 'assets'))
    # help file
    copy(glob('help/help-*.pdf')[0], path.join(ASSETS_DIR, 'help.pdf'))


def build_zip():
    dirname = path.join('dist', NAME)
    file_paths = []
    for root, dirs, files in walk(dirname):
        file_paths += [path.join(root, f) for f in files]

    with zf.ZipFile(f'{dirname}-{VERSION}.zip', 'w', compression=zf.ZIP_DEFLATED) as package:
        for file in file_paths:
            package.write(file, file.replace(dirname, NAME))


# TASKS:
# -----------

sync_version()
run(args)
copy_assets()
build_zip()
