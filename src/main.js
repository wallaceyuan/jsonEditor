import jsonlint from 'jsonlint-mod';
import { JSHINT } from 'jshint';

import CodeMirror from './json-code/lib/codemirror';
import './json-code/lib/codemirror.css';

import './json-code/mode/javascript/javascript';

// Fold 支持代码折叠
import './json-code/addon/fold/foldcode';
import './json-code/addon/fold/foldgutter';
import './json-code/addon/fold/brace-fold';
import './json-code/addon/fold/foldgutter.css';

// Search
import './json-code/addon/dialog/dialog.css';
import './json-code/addon/dialog/dialog';
import './json-code/addon/search/matchesonscrollbar.css';
import './json-code/addon/search/searchcursor';
import './json-code/addon/search/search';
import './json-code/addon/search/matchesonscrollbar';
import './json-code/addon/search/jump-to-line';
import './json-code/addon/scroll/annotatescrollbar';

//lint
import './json-code/addon/lint/lint.css';
import './json-code/addon/lint/lint';
import './json-code/addon/lint/json-lint';
import './json-code/addon/lint/javascript-lint';
import './json-code/addon/edit/closebrackets';


import './json-code/theme/pastel-on-dark.css';

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
      gutters: ["CodeMirror-lint-markers", 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };
    this.initEditor();
  }
  initEditor = ()=>{
    this.ediror = CodeMirror.fromTextArea(this.container, this.options);
    this.ediror.setOption("theme", 'pastel-on-dark');
    // this.ediror.on('beforeChange',(cm, e) => {
    //   const start = e.from.line
    //   const end = e.to.line;
    //   var content = ''
    //   for(var i = start;i<=end;i++){
    //     content+= this.ediror.getLine(i)
    //   }
    //   if(content.slice(e.from.ch).match(/\"\:/g)){
    //     e.canceled = true;
    //   }
    // })
  }
  getValue = ()=>{
    return this.ediror.getValue();
  }
}

module.exports = JSonCode;
