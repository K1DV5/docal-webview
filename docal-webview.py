# -args(D:\K1DV5\Documentsb\Code\docal\RnD\introduce-dcl\foo.dcl)
import re
from os import path, startfile
import webview
import xml.etree.ElementTree as ET
from argparse import ArgumentParser
from docal import document
from docal.document import calculations, EXCEL_SEP
from docal.parsing import GREEK_LETTERS, PRIMES, MATH_ACCENTS
from docal.__main__ import args as cli_args


class Api():
    def __init__(self):
        self.default_calc_file = 'Untitled.dcl'
        if cli_args.script:
            self.calc_file = cli_args.script
            # webview.evaluate_js(f'fromFile({self.open_calc_file(self.calc_file)})')
        else:
            self.calc_file = self.default_calc_file
        self.calc_types = ('docal calculation files (*.dcl)', 'All files (*.*)')
        self.doc_types = ('Document files (*.tex;*.docx)', 'All files (*.*)')
        self.working_dict = {}
        # for rendering
        self.process = calculations([], 'latex', self.working_dict).process
        # the file opened when open_outfile() is called
        self.doc_in = self.doc_out = None

    def new_calc_file(self, arg):
        webview.set_title('docal')

    def open_calc_file(self, arg):
        selected = [self.calc_file] if arg == 1 else webview.create_file_dialog(file_types=self.calc_types)
        if selected:
            with open(selected[0]) as file:
                content = file.read()
            tree = ET.fromstring(content)
            # change to the list with elements having assigns as last line
            chunks = []
            for child in tree:
                chunks.append([child.tag, self.data_convert(child.text, child.tag)])
            self.calc_file = selected[0]
            webview.set_title('docal - ' + selected[0])
            return {
                    'in': tree.attrib['in'],
                    'out': tree.attrib['out'],
                    'level': tree.attrib['level'],
                    'calc': chunks,
                    }

    def open_excel_file(self, fname):
        selected = webview.create_file_dialog(file_types=('Excel file (*.xlsx)',))
        if selected:
            return selected[0]

    def save_calc_file(self, args):
        if self.calc_file == self.default_calc_file or args['saveas']:
            selected = webview.create_file_dialog(webview.SAVE_DIALOG,
                                                  save_filename=self.calc_file,
                                                  file_types=self.calc_types)
            if selected:
                self.calc_file = selected
            else:
                return path.basename(self.calc_file)
        chunks = args['calc']
        attrib = {'in': args['in'], 'out': args['out'], 'level': args['level']}
        document = ET.Element('document', attrib)
        for typ, content in chunks:
            child = ET.SubElement(document, typ)
            child.text = self.data_convert(content)
        tree = ET.ElementTree(document)
        tree.write(self.calc_file, 'utf-8')
        webview.set_title('docal - ' + self.calc_file)

    def data_convert(self, content, typ=None):
        if type(content) == str:
            if typ == 'excel':
                # excel data string
                data = {}
                for cont in content.split('\n'):
                    if cont.strip():
                        cont_sp = cont.split(EXCEL_SEP)
                        data[cont_sp[0]] = cont_sp[1]
                return data
            return content
        elif type(content) == dict:
            return '\n'.join([key + EXCEL_SEP + val for key, val in content.items()])

    def select_doc_file(self, direc=None):
        if direc is None:
            selected = webview.create_file_dialog(
                webview.SAVE_DIALOG, save_filename='Untitled.docx')
        else:
            selected = webview.create_file_dialog(
                webview.OPEN_DIALOG, file_types=self.doc_types)
        if selected:
            return selected if direc is None else selected[0]

    def open_document(self, data):
        if data[0]:
            startfile(data[0])
        else:
            if data[1]:
                # open the out file
                if self.doc_out:
                    startfile(self.doc_out)
            elif self.doc_in:
                startfile(self.doc_in)

    def send_calcs(self, data):
        try:
            doc = document(data['in'], data['out'], data['clear'], data['level'])
            for chunk in data['calc']:
                doc.send(chunk[1], chunk[0])
            doc.write()
        except Exception as err:
            return ['Error', [str(err)]]
        else:
            self.doc_in = doc.document_file.infile
            self.doc_out = doc.document_file.outfile
            if doc.log:
                return ['Log', doc.log]

    def process_and_tex(self, inputs: list):
        flush, chunks = inputs
        # to update all without using pre-existing values
        if flush:
            self.working_dict = {}
            for code in self.pre_code:
                exec(code, self.working_dict)
        processed = []
        for chunk in chunks:
            if chunk:
                try:
                    built = ''
                    processed_ls = self.process(self.ascii_2_py(chunk), self.working_dict)
                    c_tag = None
                    for tag, part in processed_ls:
                        if tag != c_tag and tag:
                            built += f'[#TAG]{tag}\n\n'
                            c_tag = tag
                        built += part + '\n'
                    for o, r in self.replaced.items():
                        built = built.replace(o, r)
                    # so the user can click end edit, put something
                    built = built if built.strip() else '[HIDDEN]'
                    chunk_tex = built.split('\n\n')
                    processed.append(chunk_tex)
                except Exception as exc:
                    processed.append([f'[ERROR:] {exc.args[0]}'])
                    # raise exc
            else:
                processed.append(chunk)
        # this is for performance, selective updating
        if flush:
            self.current_tex = []
            for index, (current, new) in enumerate(zip(self.current_tex, processed)):
                if current == new:
                    processed[index] = 0
        self.current_tex += processed

        return processed

    def open_help(self, arg):
        startfile(path.relpath('assets/help.pdf'))

    def quit(self, arg):
        # until i find a better way
        webview.destroy_window()

    def log(self, what):
        print(what)


webview.create_window('docal', 'assets/index.html', js_api=Api(), width=1200, height=700, debug=True)
