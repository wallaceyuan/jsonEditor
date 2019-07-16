//import React, { Component } from 'react';
import jsonlint from 'jsonlint-mod';
import { JSHINT } from 'jshint';

import CodeMirror from '../codemirror/lib/codemirror';
import '../codemirror/lib/codemirror.css';

import '../codemirror/mode/javascript/javascript';

// Fold 支持代码折叠
import '../codemirror/addon/fold/foldcode';
import '../codemirror/addon/fold/foldgutter';
import '../codemirror/addon/fold/brace-fold';
import '../codemirror/addon/fold/foldgutter.css';

// Search
import '../codemirror/addon/dialog/dialog.css';
import '../codemirror/addon/dialog/dialog';
import '../codemirror/addon/search/matchesonscrollbar.css';
import '../codemirror/addon/search/searchcursor';
import '../codemirror/addon/search/search';
import '../codemirror/addon/search/matchesonscrollbar';
import '../codemirror/addon/search/jump-to-line';
import '../codemirror/addon/scroll/annotatescrollbar';

//lint
import '../codemirror/addon/lint/lint.css';
import '../codemirror/addon/lint/lint';
import '../codemirror/addon/lint/json-lint';
import '../codemirror/addon/lint/javascript-lint';
import '../codemirror/addon/edit/closebrackets';

//simple
// import 'codemirror/addon/scroll/simplescrollbars';

import '../codemirror/theme/pastel-on-dark.css';
import './style.css';

window.JSHINT = JSHINT;
window.jsonlint = jsonlint;

class JSonCode {
  constructor(param) {
    const { container } = param;
    this.container = container
    this.initEditor = this.initEditor.bind(this);
    this.options = {
      mode: 'application/json',
      lineNumbers: true,
      lineWrapping: true,
      lineHeight: 10,
      lint: true,
      matchBrackets: true,
      indentWithTabs: true,
      foldGutter: true,
      styleActiveLine: true,
      scrollbarStyle: "native",
      keyEditable: false,
      gutters: ["CodeMirror-lint-markers", 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    };
    this.initEditor();
  }
  initEditor = ()=>{
    this.ediror = CodeMirror.fromTextArea(this.container, this.options);
    this.ediror.setOption("theme", 'pastel-on-dark');
    this.ediror.on('keydown',(cm, e) => {
        console.log('keydown')
        // ignore copy by codemirror.  and will copy by browser
        e.codemirrorIgnore = true;
    })
    this.ediror.on("keypress",(cm, e) => {
              console.log('keypress')
        // ignore copy by codemirror.  and will copy by browser
        e.codemirrorIgnore = true;
    });
  }
}

module.exports = JSonCode;
