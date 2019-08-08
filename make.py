from subprocess import run
from pprint import pprint
from glob import glob
from os import walk, remove, path, sep as pathsep, getcwd
from shutil import copy, copytree, rmtree
import pkg_resources as pr
import zipfile as zf
import re

VERSION = pr.get_distribution('docal').version
NAME = 'docal'
# NAME = 'docal-numpy'
DIR = path.join('dist', NAME)
ASSETS_DIR = path.join(DIR, 'assets')

args = [
    'pyinstaller',
    'docal-webview.py',
    '-n', NAME,
    '--windowed',
    '--add-data', 'C:\Programs\Python\Lib\site-packages\webview\lib\WebBrowserInterop.x64.dll;.',
    '--icon', 'docal.ico'
]

if 'numpy' in NAME:
    args += [
        '--hidden-import', 'numpy',
        '--exclude-module', 'scipy',
        '--exclude-module', 'lib2to3',
    ]


def touch_js():
    '''make the version number in the front end about the same'''

    # with the JS about
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

    with zf.ZipFile(f'{dirname}-{VERSION}-portable.zip', 'w', compression=zf.ZIP_DEFLATED) as package:
        for file in file_paths:
            package.write(file, file.replace(dirname, NAME))


# TASKS:
# -----------

sync_version()
if run(args).returncode == 0:
    copy_assets()
    build_zip()
