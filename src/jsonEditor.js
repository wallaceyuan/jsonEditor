import React, {Component} from 'react';
import './style.css'
//import err                    from './err';
import { format }             from './locale';
import defaultLocale          from './locale/en';
//if (!valid) console.log(validate.errors);
import jsonlint from 'jsonlint-mod';
import beautify from 'js-beautify/js/lib/beautify';
import minify from 'jsonminify';
import Clipboard from 'clipboard';
import $ from 'balajs';
import './style.css';

const doc = window.document;

export default class JsonEditor extends React.Component {
    constructor(props) {
        super(props);
        this.tokenize = this.tokenize.bind(this)
        this.newSpan = this.newSpan.bind(this)
        //this.updateInternalProps();
        this.updateInternalProps = this.updateInternalProps.bind(this);
        this.scheduledUpdate = this.scheduledUpdate.bind(this);
        this.jsonEditorGetValue = this.jsonEditorGetValue.bind(this);
        this.jsonEditorSetValue = this.jsonEditorSetValue.bind(this);
        this.initJsonEditor = this.initJsonEditor.bind(this);
        this.state ={ }
        this.editor ={
            text:{
                "analyzers":[{
                    "type":"normal"
                }],
                "clients":[ {
                    "cmd":"demo",
                    "count":2,
                    "param":"{\"app_id\":\"5b642463d225e2004d551af7\",\"mode\":\"av\",\"silent\":\"false\",\"msaddr\":\"\",\"ssaddr\":\"\",\"auto_pub\":\"true\",\"auto_sub\":\"true\",\"sub_only\":\"false\"}"
                }],
                "roomCount":3000,
                "roomMaxLiveTime":120,
                "roomMinLiveTime":120,
                "testDuration":600
            },
            getValue: this.jsonEditorGetValue,
            setValue: this.jsonEditorSetValue,
            addLineClass: this.jsonEditorAddLineClass
        }
        this.registerEvents();
        this.containerElement = undefined;
    }
    jsonEditorAddLineClass = ()=>{

    }
    jsonEditorSetValue = (value)=>{
        this.editor.text = value
    }
    jsonEditorGetValue = ()=>{
        const pre_dom = this.containerElement;
        let reg=/<\/?.+?\/?>/g;
        return pre_dom.innerHTML.replace(reg,'')
    }
    // registers events
    registerEvents() {
        // when Ctrl-Enter is pressed, run "go" method
        doc.addEventListener('keyup', (evt) => {
            // const ENTER_KEY = 13;
            // if (evt.ctrlKey && evt.keyCode === ENTER_KEY) {
                this.go();
            //}
        });
    }
    // the main function of this app
    go() {
        const { code } = this;
        const trimmedCode = code.trim();
        // if URL is given, fetch data on this URL
        if (trimmedCode.indexOf('http') === 0) {
            fetchExternal(
                trimmedCode,
                resp => this.validate(resp), // if fetching is OK, run validator
                err => this.notify(false, err) // if not, show an error
            );
        } else {
            // if non-url is given, run validator
            this.validate();
        }
        return this;
    }

    // reformats JSON depending on query.reformat value
    // code argument is optional
    reformat(givenCode) {
        let code = typeof givenCode === 'undefined' ? this.code : givenCode;
        // if reformat==compress, use minifier
        // if reformat==no, keep code as is
        // else beautify code
        // if (this.query.reformat === 'compress') {
        //     code = minify(code) || code;
        // } else if (this.query.reformat !== 'no') {
            code = beautify.js_beautify(code, {
                indent_with_tabs: true
            });
        // }
        this.code = code;
        return this;
    }

    notify(success, text) {
        // const result = $.one('#result');
        // $.one('#result-container').classList.add('shown');
        // // ie10 doesn't support 2nd argument in classList.toggle
        // result.classList[success ? 'add' : 'remove']('success');
        // result.classList[!success ? 'add' : 'remove']('error');
        // result.textContent = text;
        return this;
    }
    validate(givenCode) {
        let lineMatches;
        this.reformat(givenCode);
        const { code } = this;
        console.log('====code====',code)
        try {
            jsonlint.parse(code);
            this.notify(true, 'Valid JSON');
        } catch (e) {
            console.log('e',e)
            // retrieve line number from error string
            lineMatches = e.message.match(/line ([0-9]*)/);
            console.log('lineMatches',lineMatches)
            if (lineMatches && lineMatches.length > 1) {
                this.highlightErrorLine(+lineMatches[1] - 1,lineMatches);
            }
            console.log(lineMatches['input'])
            this.notify(false, e);
        }
        return this;
    }
    // highlights given line of code
    // if null is passed function removes highlighting
    highlightErrorLine(line,lineMatches) {
        if (typeof line === 'number') {
            this.errorLine = this.editor.addLineClass(line, 'background', 'line-error');
            //this.editor.setCursor(line);
        } else if (this.errorLine) {
            this.editor.removeLineClass(this.errorLine, 'background', 'line-error');
            this.errorLine = null
        }
        return this;
    }
    newSpan(param){
        return param
    }
    tokenize(something){
        console.log('something',something)
        if(typeof something !== 'object') return console.error('tokenize() expects object type properties only. Got \'' + typeof something + '\' type instead.');
        const locale = this.props.locale || defaultLocale;
        const newSpan = this.newSpan;
        /**
         *     DOM NODE || ONBLUR OR UPDATE
         */

        if('nodeType' in something){
            const
                containerNode = something.cloneNode(true),
                hasChildren   = containerNode.hasChildNodes();
            if(!hasChildren) return '';
            const children = containerNode.childNodes;
            let buffer = {
                tokens_unknown   : [],
                tokens_proto     : [],
                tokens_split     : [],
                tokens_fallback  : [],
                tokens_normalize : [],
                tokens_merge     : [],
                tokens_plainText : '',
                indented         : '',
                json             : '',
                jsObject         : undefined,
                markup           : ''
            }
            for(var i = 0; i < children.length; i++){
                let child = children[i];
                let info = {};
                switch(child.nodeName){
                    case 'SPAN' :
                        info = {
                            string : child.textContent,
                            type   : child.attributes.type.textContent
                        };  
                        buffer.tokens_unknown.push(info);
                    break;
                    case 'DIV' :
                        buffer.tokens_unknown.push({ string : child.textContent, type : 'unknown' });
                    break;
                    case 'BR' :
                        if(child.textContent==='')
                        buffer.tokens_unknown.push({ string : '\n', type : 'unknown' });
                    break;
                    case '#text' :
                        buffer.tokens_unknown.push({ string : child.wholeText, type : 'unknown' });
                    break;
                    case 'FONT' :
                        buffer.tokens_unknown.push({ string : child.textContent, type : 'unknown' });
                    break;
                    default :
                        console.error('Unrecognized node:',{child})
                    break;
                }
            }
            function quarkize(text,prefix=''){
                let
                    buffer = {
                        active    : false,
                        string    : '',
                        number    : '',
                        symbol    : '',
                        space     : '',
                        delimiter : '',
                        quarks    : []
                    };
                function pushAndStore(char,type){
                    switch(type){
                        case 'symbol' : case 'delimiter' :
                            if(buffer.active) buffer.quarks.push({
                                string : buffer[buffer.active],
                                type   : prefix + '-' + buffer.active
                            });
                            buffer[buffer.active] = '';
                            buffer.active  = type;
                            buffer[buffer.active] = char;
                        break;
                        default :
                            if(type!==buffer.active||([buffer.string,char].indexOf('\n')>-1)){
                                if(buffer.active) buffer.quarks.push({
                                    string : buffer[buffer.active],
                                    type   : prefix + '-' + buffer.active
                                });
                                buffer[buffer.active] = '';
                                buffer.active  = type;
                                buffer[buffer.active] = char;
                            }
                            else buffer[type] += char;
                        break;
                    }
                }
                function finalPush(){
                    if(buffer.active){
                        buffer.quarks.push({
                            string : buffer[buffer.active],
                            type   : prefix + '-' + buffer.active
                        });
                        buffer[buffer.active] = '';
                        buffer.active = false;
                    }
                }
                for(var i = 0; i < text.length; i++){
                    const char = text.charAt(i);
                    switch(char){
                        case '"'      : case "'"      : pushAndStore(char,'delimiter'); break;
                        case ' '      : case '\u00A0' : pushAndStore(char,'space');     break;
                        case '{'      : case '}'      :
                        case '['      : case ']'      :
                        case ':'      : case ','      : pushAndStore(char,'symbol');    break;
                        case '0'      : case '1'      :
                        case '2'      : case '3'      :
                        case '4'      : case '5'      :
                        case '6'      : case '7'      :
                        case '8'      : case '9'      :
                            if(buffer.active==='string') pushAndStore(char,'string');
                            else pushAndStore(char,'number');
                        break;
                        case '-'  :
                            if(i < text.length - 1)
                            if('0123456789'.indexOf(text.charAt(i + 1)) > -1){
                                pushAndStore(char,'number');
                                break;
                            }
                        case '.' :
                            if(i < text.length - 1 && i > 0)
                            if( 
                                '0123456789'.indexOf(text.charAt(i + 1)) > -1 &&
                                '0123456789'.indexOf(text.charAt(i - 1)) > -1
                            ){
                                pushAndStore(char,'number');
                                break;
                            }
                        default : pushAndStore(char,'string'); break;
                    }
                }
                finalPush();
                return buffer.quarks;
            }
            for(var i = 0; i < buffer.tokens_unknown.length; i++){
                let token = buffer.tokens_unknown[i];
                buffer.tokens_proto = buffer.tokens_proto.concat(quarkize(token.string,'proto'));
            }
            function validToken(string,type){
                const quotes = '\'"';
                let 
                    firstChar = '',
                    lastChar  = '',
                    quoteType = false;
                switch(type){
                    case 'primitive' : if(['true','false','null','undefined'].indexOf(string)===-1) return false; break;
                    case 'string' :
                        if(string.length < 2) return false;
                        firstChar = string.charAt(0),
                        lastChar  = string.charAt(string.length-1),
                        quoteType = quotes.indexOf(firstChar);
                        if(quoteType===-1)       return false;
                        if(firstChar!==lastChar) return false;
                        for(var i = 0; i < string.length; i++){
                            if(i > 0 && i < string.length - 1)
                            if(string.charAt(i)===quotes[quoteType])
                            if(string.charAt(i - 1)!=='\\')
                            return false;
                        }
                    break;
                    case 'key' :
                        if(string.length===0) return false;
                        firstChar = string.charAt(0),
                        lastChar  = string.charAt(string.length-1),
                        quoteType = quotes.indexOf(firstChar);
                        if(quoteType > -1){
                            if(string.length===1) return false;
                            if(firstChar!==lastChar) return false;
                            for(var i = 0; i < string.length; i++){
                                if(i > 0 && i < string.length - 1)
                                if(string.charAt(i)===quotes[quoteType])
                                if(string.charAt(i - 1)!=='\\')
                                return false;
                            }
                        } else {
                            const nonAlphanumeric = '\'"`.,:;{}[]&<>=~*%\\|/-+!?@^ \xa0';
                            for(var i = 0; i < nonAlphanumeric.length; i++){
                                const nonAlpha = nonAlphanumeric.charAt(i);
                                if(string.indexOf(nonAlpha) > -1) return false;
                            }
                        }
                    break;
                    case 'number' :
                        for(var i = 0; i < string.length ; i++){
                            if('0123456789'.indexOf(string.charAt(i))===-1)
                            if(i===0){
                                if('-'!==string.charAt(0)) return false;
                            }
                            else if('.'!==string.charAt(i)) return false;
                        }
                    break;
                    case 'symbol' : 
                        if(string.length > 1) return false;
                        if('{[:]},'.indexOf(string)===-1) return false;
                    break;
                    case 'colon' :
                        if(string.length > 1) return false;
                        if(':'!==string) return false;
                    break;
                    default : return true; break;
                }
                return true;
            }
            for(var i = 0; i < buffer.tokens_proto.length; i++){
                let token = buffer.tokens_proto[i];
                if(token.type.indexOf('proto')===-1){
                    if(!validToken(token.string,token.type)){
                        buffer.tokens_split = buffer.tokens_split.concat(quarkize(token.string,'split'));
                    } else buffer.tokens_split.push(token);
                } else buffer.tokens_split.push(token);
            }
            for(var i = 0; i < buffer.tokens_split.length; i++){
                let token = buffer.tokens_split[i];
                let
                    type     = token.type,
                    string   = token.string,
                    length   = string.length,
                    fallback = [];
                if(type.indexOf('-') > -1){
                    type = type.slice(type.indexOf('-') + 1);
                    if(type!=='string') fallback.push('string');
                    fallback.push('key');
                    fallback.push('error');
                }
                let tokul = {
                    string   : string,
                    length   : length,
                    type     : type,
                    fallback : fallback 
                };
                buffer.tokens_fallback.push(tokul);
            }
            function tokenFollowed(){
                const last = buffer.tokens_normalize.length - 1;
                if(last<1) return false;
                for(var i = last; i >= 0; i--){
                    const previousToken = buffer.tokens_normalize[i];
                    switch(previousToken.type){
                        case 'space' : case 'linebreak' : break;
                        default : return previousToken; break;
                    }
                }
                return false;
            }
            let buffer2 = {
                brackets   : [],
                stringOpen : false,
                isValue    : false
            };
            for(var i = 0; i < buffer.tokens_fallback.length; i++){
                let token = buffer.tokens_fallback[i];
                const
                    type   = token.type,
                    string = token.string;
                let normalToken = {
                    type   : type,
                    string : string
                };
                switch(type){
                    case 'symbol' : case 'colon' :
                        if(buffer2.stringOpen){
                            if(buffer2.isValue) normalToken.type = 'string';
                            else normalToken.type = 'key';
                            break;
                        }
                        switch(string){
                            case '[' : case '{' : 
                                buffer2.brackets.push(string);
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                            break;
                            case ']' : case '}' :
                                buffer2.brackets.pop();
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                            break;
                            case ',' :
                                if(tokenFollowed().type==='colon') break;
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                            break;
                            case ':' :
                                normalToken.type = 'colon';
                                buffer2.isValue = true;
                            break;
                        }
                    break;
                    case 'delimiter' :
                        if(buffer2.isValue) normalToken.type = 'string';
                        else normalToken.type = 'key';
                        if(!buffer2.stringOpen){ buffer2.stringOpen = string; break; }
                        if(i > 0){
                            const
                                previousToken = buffer.tokens_fallback[i - 1],
                                _string       = previousToken.string,
                                _type         = previousToken.type,
                                _char         = _string.charAt(_string.length - 1);
                            if(_type==='string' && _char==='\\') break;
                        }
                        if(buffer2.stringOpen===string){ buffer2.stringOpen = false; break; }
                    break;
                    case 'primitive' : case 'string' :
                        if(['false','true','null','undefined'].indexOf(string) > -1){
                            const lastIndex = buffer.tokens_normalize.length - 1;
                            if(lastIndex >= 0){
                                if(buffer.tokens_normalize[lastIndex].type !== 'string'){
                                    normalToken.type = 'primitive';
                                    break;
                                }
                                normalToken.type = 'string';
                                break;
                            }
                            normalToken.type = 'primitive';
                            break;
                        }
                        if(string==='\n') if(!buffer2.stringOpen){
                            normalToken.type = 'linebreak';
                            break;
                        }
                        if(buffer2.isValue) normalToken.type = 'string';
                        else normalToken.type = 'key';
                    break;
                    case 'space' :
                        if(buffer2.stringOpen)
                        if(buffer2.isValue) normalToken.type = 'string';
                        else normalToken.type = 'key';
                        break;
                    case 'number' :
                        if(buffer2.stringOpen)
                        if(buffer2.isValue) normalToken.type = 'string';
                        else normalToken.type = 'key';
                        break;
                    default :
                    
                    break;
                }
                buffer.tokens_normalize.push(normalToken);
            }
            for(var i = 0; i < buffer.tokens_normalize.length; i++){
                const token = buffer.tokens_normalize[i];
                let mergedToken = {
                    string  : token.string,
                    type    : token.type,
                    tokens  : [i]
                };
                if(['symbol','colon'].indexOf(token.type)===-1)
                if(i + 1 < buffer.tokens_normalize.length){
                    let count = 0;
                    for(var u = i + 1; u < buffer.tokens_normalize.length; u++){
                        const nextToken = buffer.tokens_normalize[u];
                        if(token.type!==nextToken.type) break;
                        mergedToken.string += nextToken.string;
                        mergedToken.tokens.push(u);
                        count++;
                    }
                    i += count;
                }
                buffer.tokens_merge.push(mergedToken);
            }
            const 
                quotes = '\'"',
                alphanumeric = (
                    'abcdefghijklmnopqrstuvwxyz' +
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    '0123456789' +
                    '_$'
                );
            var
                error = false,
                line  = buffer.tokens_merge.length > 0 ? 1 : 0;
            buffer2 = {
                brackets   : [],
                stringOpen : false,
                isValue    : false
            };
            function setError(tokenID,reason,offset=0){
                error = {
                    token  : tokenID,
                    line   : line,
                    reason : reason
                };
                buffer.tokens_merge[tokenID+offset].type = 'error';
            }
            function followedBySymbol(tokenID,options){
                if(tokenID===undefined) console.error('tokenID argument must be an integer.');
                if(options===undefined) console.error('options argument must be an array.');
                if(tokenID===buffer.tokens_merge.length-1) return false;
                for(var i = tokenID + 1; i < buffer.tokens_merge.length; i++){
                    const nextToken = buffer.tokens_merge[i];
                    switch(nextToken.type){
                        case 'space' : case 'linebreak' : break;
                        case 'symbol' : case 'colon' :
                            if(options.indexOf(nextToken.string)>-1) return i;
                            else return false;
                        break;
                        default : return false; break;
                    }
                }
                return false;
            }
            function followsSymbol(tokenID,options){
                if(tokenID===undefined) console.error('tokenID argument must be an integer.');
                if(options===undefined) console.error('options argument must be an array.');
                if(tokenID===0) return false;
                for(var i = tokenID - 1; i >= 0; i--){
                    const previousToken = buffer.tokens_merge[i];
                    switch(previousToken.type){
                        case 'space' : case 'linebreak' : break;
                        case 'symbol' : case 'colon' :
                            if(options.indexOf(previousToken.string)>-1) return true;
                            return false;
                        break;
                        default : return false; break;
                    }
                }
                return false;
            }
            function typeFollowed(tokenID){
                if(tokenID===undefined) console.error('tokenID argument must be an integer.');
                if(tokenID===0) return false;
                for(var i = tokenID - 1; i >= 0; i--){
                    const previousToken = buffer.tokens_merge[i];
                    switch(previousToken.type){
                        case 'space' : case 'linebreak' : break;
                        default : return previousToken.type; break;
                    }
                }
                return false;
            }
            let bracketList = [];
            for(var i = 0; i < buffer.tokens_merge.length; i++){
                if(error) break;
                let
                    token  = buffer.tokens_merge[i],
                    string = token.string,
                    type   = token.type,
                    found  = false;
                switch(type){
                    case 'space' : break;
                    case 'linebreak' : line++; break;
                    case 'symbol' :
                        switch(string){
                            case '{' : 
                            case '[' : 
                                found = followsSymbol(i,['}',']']);
                                if(found){
                                    setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: buffer.tokens_merge[found].string,
                                        secondToken: string
                                    }));
                                    break;
                                }
                                if(string==='['&&i>0)
                                if(!followsSymbol(i,[':','[',','])){
                                    setError(i,format(locale.invalidToken.tokenSequence.permitted, {
                                        firstToken: "[",
                                        secondToken: [":", "[", ","]
                                    }));
                                    break;
                                }
                                if(string==='{')
                                if(followsSymbol(i,['{'])){
                                    setError(i,format(locale.invalidToken.double, {
                                        token: "{"
                                    }));
                                    break;
                                }
                                buffer2.brackets.push(string);
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                                bracketList.push({ i : i, line : line, string : string });
                                break;
                            case '}' : 
                            case ']' :
                                if(string==='}')
                                if(buffer2.brackets[buffer2.brackets.length-1]!=='{'){
                                    setError(i,format(locale.brace.curly.missingOpen));
                                    break;
                                }
                                if(string==='}')
                                if(followsSymbol(i,[','])){
                                    setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: ",",
                                        secondToken: "}"
                                    }));
                                    break;
                                }
                                if(string===']')
                                if(buffer2.brackets[buffer2.brackets.length-1]!=='['){
                                    setError(i,format(locale.brace.square.missingOpen));
                                    break;
                                }
                                if(string===']')
                                if(followsSymbol(i,[':'])){
                                    setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: ":",
                                        secondToken: "]"
                                    }));
                                    break;
                                }
                                buffer2.brackets.pop();
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                                bracketList.push({ i : i, line : line, string : string });
                                break;
                            case ',' :
                                found = followsSymbol(i,['{']);
                                if(found){
                                    if(followedBySymbol(i,['}'])){
                                        setError(i,format(locale.brace.curly.cannotWrap, {
                                            token: ","
                                        }));
                                        break;
                                    }
                                    setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: "{",
                                        secondToken: ","
                                    }));
                                    break;
                                }
                                if(followedBySymbol(i,['}',',',']'])){
                                    setError(i,format(locale.noTrailingOrLeadingComma));
                                    break;
                                }
                                found = typeFollowed(i);
                                switch(found){
                                    case 'key' :
                                    case 'colon' :
                                        setError(i,format(locale.invalidToken.termSequence.prohibited, {
                                            firstTerm: found==='key' ? locale.types.key : locale.symbols.colon,
                                            secondTerm: locale.symbols.comma
                                        }));
                                        break;
                                    case 'symbol' :
                                        if(followsSymbol(i,['{'])){
                                            setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                                firstToken: "{",
                                                secondToken: ","
                                            }));
                                            break;
                                        }
                                        break;
                                    default : break;
                                }
                                buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1]==='[';
                                break;
                            default : break;
                        }
                        buffer.json += string;
                    break;
                    case 'colon' :
                        found = followsSymbol(i,['[']);
                        if(found&&followedBySymbol(i,[']'])){
                            setError(i,format(locale.brace.square.cannotWrap, {
                                token: ":"
                            }));
                            break;
                        }
                        if(found){
                            setError(i,format(locale.invalidToken.tokenSequence.prohibited, {
                                firstToken: "[",
                                secondToken: ":"
                            }));
                            break;
                        }
                        if(typeFollowed(i)!=='key'){
                            setError(i,format(locale.invalidToken.termSequence.permitted, {
                                firstTerm: locale.symbols.colon,
                                secondTerm: locale.types.key
                            }));
                            break;
                        }
                        if(followedBySymbol(i,['}',']'])){
                            setError(i,format(locale.invalidToken.termSequence.permitted, {
                                firstTerm: locale.symbols.colon,
                                secondTerm: locale.types.value
                            }));
                            break;
                        }
                        buffer2.isValue = true;
                        buffer.json += string;
                        break;
                    case 'key' : 
                    case 'string' :
                        let
                            firstChar     = string.charAt(0),
                            lastChar      = string.charAt(string.length - 1),
                            quote_primary = quotes.indexOf(firstChar);
                        if(quotes.indexOf(firstChar)===-1)
                        if(quotes.indexOf(lastChar)!==-1){
                            setError(i,format(locale.string.missingOpen, {
                                quote: firstChar
                            }));
                            break;
                        }
                        if(quotes.indexOf(lastChar)===-1)
                        if(quotes.indexOf(firstChar)!==-1){
                            setError(i,format(locale.string.missingClose, {
                                quote: firstChar,
                            }));
                            break;
                        }
                        if(quotes.indexOf(firstChar)>-1)
                        if(firstChar!==lastChar){
                            setError(i,format(locale.string.missingClose, {
                                quote: firstChar,
                            }));
                            break;
                        }
                        if('string'===type)
                        if(quotes.indexOf(firstChar)===-1 && quotes.indexOf(lastChar)===-1){
                            setError(i,format(locale.string.mustBeWrappedByQuotes));
                            break;
                        }
                        if('key'===type)
                        if(followedBySymbol(i,['}',']'])){
                            setError(i,format(locale.invalidToken.termSequence.permitted, {
                                firstTerm: locale.types.key,
                                secondTerm: locale.symbols.colon
                            }));
                        }
                        if(quotes.indexOf(firstChar)===-1 && quotes.indexOf(lastChar)===-1)
                        for(var h = 0; h < string.length; h++){
                            if(error) break;
                            const c = string.charAt(h);
                            if(alphanumeric.indexOf(c)===-1){
                                setError(i,format(locale.string.nonAlphanumeric, {
                                    token: c,
                                }));
                                break;
                            }
                        }
                        if(firstChar==="'") string = '"' + string.slice(1,-1) + '"';
                        else if (firstChar!=='"') string = '"' + string + '"';
                        if('key'===type)
                        if('key'===typeFollowed(i)){
                            if(i>0)
                            if(!isNaN(buffer.tokens_merge[i-1])){
                                buffer.tokens_merge[i-1] += buffer.tokens_merge[i];
                                setError(i,format(locale.key.numberAndLetterMissingQuotes));
                                break;
                            }
                            setError(i,format(locale.key.spaceMissingQuotes));
                            break;
                        }
                        if('key'===type)
                        if(!followsSymbol(i,['{',','])){
                            setError(i,format(locale.invalidToken.tokenSequence.permitted, {
                                firstToken: type,
                                secondToken: ["{", ","]
                            }));
                            break;
                        }
                        if('string'===type)
                        if(!followsSymbol(i,['[',':',','])){
                            setError(i,format(locale.invalidToken.tokenSequence.permitted, {
                                firstToken: type,
                                secondToken: ["[", ":", ","]
                            }));
                            break;
                        }
                        if('key'===type)
                        if(buffer2.isValue){
                            setError(i,format(locale.string.unexpectedKey));
                            break;
                        }
                        if('string'===type)
                        if(!buffer2.isValue){
                            setError(i,format(locale.key.unexpectedString));
                            break;
                        }
                        buffer.json += string;
                    break;
                    case 'number' : case 'primitive' :
                        if(followsSymbol(i,['{'])){
                            buffer.tokens_merge[i].type = 'key';
                            type = buffer.tokens_merge[i].type;
                            string = '"' + string + '"';
                        }
                        else
                            if(typeFollowed(i)==='key'){
                                buffer.tokens_merge[i].type = 'key';
                                type = buffer.tokens_merge[i].type;
                            }
                            else
                                if(!followsSymbol(i,['[',':',','])){
                                    setError(i,format(locale.invalidToken.tokenSequence.permitted, {
                                        firstToken: type,
                                        secondToken: ["[", ":", ","]
                                    }));
                                    break;
                                }
                        if(type!=='key')
                        if(!buffer2.isValue){
                            buffer.tokens_merge[i].type = 'key';
                            type = buffer.tokens_merge[i].type;
                            string = '"' + string + '"';
                        }
                        if(type==='primitive')
                        if(string==='undefined')
                            setError(i,format(locale.invalidToken.useInstead, {
                                badToken: "undefined",
                                goodToken: "null"
                            }));
                        buffer.json += string;
                    break;
                }
            }
            let noEscapedSingleQuote = '';
            for(var i = 0; i < buffer.json.length; i++){
                let
                    current = buffer.json.charAt(i),
                    next    = '';
                if(i + 1 < buffer.json.length){
                    next = buffer.json.charAt(i+1);
                    if(current==='\\' && next==="'"){
                        noEscapedSingleQuote += next;
                        i++;
                        continue;
                    }
                }
                noEscapedSingleQuote += current;
            }
            buffer.json = noEscapedSingleQuote;
            if(!error){
                const maxIterations = Math.ceil(bracketList.length / 2);
                let 
                    round = 0,
                    delta = false;
                function removePair(index){
                    bracketList.splice(index + 1,1);
                    bracketList.splice(index,1);
                    if(!delta) delta = true;
                }
                while(bracketList.length>0){
                    delta = false;
                    for(var tokenCount = 0; tokenCount < bracketList.length - 1; tokenCount++){
                        const pair = bracketList[tokenCount].string + bracketList[tokenCount+1].string;
                        if(['[]','{}'].indexOf(pair)>-1) removePair(tokenCount);
                    }
                    round++;
                    if(!delta) break;
                    if(round>=maxIterations) break;
                }
                if(bracketList.length>0){
                    const
                        _tokenString        = bracketList[0].string,
                        _tokenPosition      = bracketList[0].i,
                        _closingBracketType = _tokenString==='['?']':'}';
                    line = bracketList[0].line;
                    setError(_tokenPosition,format(locale.brace[_closingBracketType === ']' ? 'square' : 'curly'].missingClose));
                }
            }
            if(!error)
            if([undefined,''].indexOf(buffer.json)===-1)
            try{
                buffer.jsObject = JSON.parse(buffer.json);
            }
            catch(err){
                const 
                    errorMessage = err.message,
                    subsMark   = errorMessage.indexOf('position');
                if(subsMark===-1) throw new Error('Error parsing failed');
                const
                    errPositionStr = errorMessage.substring(subsMark + 9,errorMessage.length),
                    errPosition    = parseInt(errPositionStr);
                let
                    charTotal  = 0,
                    tokenIndex = 0,
                    token      = false,
                    _line      = 1,
                    exitWhile  = false;
                while(charTotal < errPosition && !exitWhile){
                    token = buffer.tokens_merge[tokenIndex];
                    if('linebreak'===token.type) _line++;
                    if(['space','linebreak'].indexOf(token.type)===-1) charTotal += token.string.length;
                    if(charTotal >= errPosition) break;
                    tokenIndex++;
                    if(!buffer.tokens_merge[tokenIndex+1]) exitWhile = true;
                }
                line = _line;
                let backslashCount = 0;
                for(let i = 0; i < token.string.length; i++){
                    const char = token.string.charAt(i);
                    if(char==='\\')
                        backslashCount = backslashCount > 0 ? backslashCount + 1 : 1;
                    else{
                        if(backslashCount % 2 !== 0 || backslashCount === 0)
                            if('\'"bfnrt'.indexOf(char)===-1){
                                setError(tokenIndex,format(locale.invalidToken.unexpected, {
                                    token: '\\'
                                }));
                            }
                        backslashCount = 0;
                    }
                }
                if(!error)
                setError(tokenIndex,format(locale.invalidToken.unexpected, {
                    token: token.string
                }));
            }
            let
                _line   = 1,
                _depth  = 0;
            function newIndent(){
                var space = []; 
                for (var i = 0; i < _depth * 2; i++) space.push('&nbsp;'); 
                return space.join('');
            }
            function newLineBreak(byPass=false){
                _line++;
                if(_depth > 0 || byPass){ return '<br>'; }
                return '';
            }
            function newLineBreakAndIndent(byPass=false){ 
                return newLineBreak(byPass) + newIndent();
            };
            if(!error)
            for(var i = 0; i < buffer.tokens_merge.length; i++){
                const
                    token  = buffer.tokens_merge[i],
                    string = token.string,
                    type   = token.type;
                switch(type){
                    case 'space' : case 'linebreak' : break;
                    case 'string' : case 'number'    : case 'primitive' : case 'error' : 
                        buffer.markup += ((followsSymbol(i,[',','[']) ? newLineBreakAndIndent() : '') + newSpan(i,token,_depth)); 
                    break;
                    case 'key' :
                        buffer.markup += (newLineBreakAndIndent() + newSpan(i,token,_depth));
                    break;
                    case 'colon' :
                        buffer.markup += (newSpan(i,token,_depth) + '&nbsp;');
                    break;
                    case 'symbol' :
                        switch(string){
                            case '[' : case '{' :
                                buffer.markup += ((!followsSymbol(i,[':']) ? newLineBreakAndIndent() : '') + newSpan(i,token,_depth)); _depth++;
                            break;
                            case ']' : case '}' :
                                _depth--;
                                const
                                    islastToken  = i === buffer.tokens_merge.length - 1,
                                    _adjustment = i > 0 ? ['[','{'].indexOf(buffer.tokens_merge[i-1].string)>-1  ? '' : newLineBreakAndIndent(islastToken) : '';
                                buffer.markup += (_adjustment + newSpan(i,token,_depth));
                            break;
                            case ',' :
                                buffer.markup += newSpan(i,token,_depth);
                            break;
                        }
                    break;
                }
            }
            if(error){
                let _line_fallback = 1;
                function countCarrigeReturn(string){
                    let count = 0;
                    for(var i = 0; i < string.length; i++){
                        if(['\n','\r'].indexOf(string[i])>-1) count++;
                    }
                    return count;
                }
                _line = 1;
                for(var i = 0; i < buffer.tokens_merge.length; i++){
                    const
                        token  = buffer.tokens_merge[i],
                        type   = token.type,
                        string = token.string;
                    if(type==='linebreak') _line++;
                    buffer.markup += newSpan(i,token,_depth);
                    _line_fallback += countCarrigeReturn(string);
                }
                _line++;
                _line_fallback++;
                if(_line < _line_fallback) _line = _line_fallback;
            }
            for(var i = 0; i < buffer.tokens_merge.length; i++){
                let token = buffer.tokens_merge[i];
                buffer.indented += token.string;
                if(['space','linebreak'].indexOf(token.type)===-1) buffer.tokens_plainText += token.string;
            }
            if(error){
                function isFunction(functionToCheck) {
                    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
                }
                if('modifyErrorText' in this.props)
                if(isFunction(this.props.modifyErrorText))
                error.reason = this.props.modifyErrorText(error.reason);
            }
            return {
                tokens   : buffer.tokens_merge,
                noSpaces : buffer.tokens_plainText,
                indented : buffer.indented,
                json     : buffer.json,
                jsObject : buffer.jsObject,
                markup   : buffer.markup,
                lines    : _line,
                error    : error
            };
        };

        /**
         *     JS OBJECTS || PLACEHOLDER
         */

        if(!('nodeType' in something)){
            let buffer = {
                inputText       : JSON.stringify(something),
                position        : 0,
                currentChar     : '',
                tokenPrimary    : '',
                tokenSecondary  : '',
                brackets        : [],
                isValue         : false,
                stringOpen      : false,
                stringStart     : 0,
                tokens          : []
            };
            function escape_character(){
                if(buffer.currentChar!=='\\') return false;
                buffer.inputText = deleteCharAt(buffer.inputText,buffer.position);
                return true;
            }
            function deleteCharAt(string,position){
                return string.slice(0, position) + string.slice(position + 1);
            }
            function determine_string(){
                if('\'"'.indexOf(buffer.currentChar)===-1) return false;
                if(!buffer.stringOpen){ 
                    add_tokenSecondary();
                    buffer.stringStart = buffer.position;
                    buffer.stringOpen = buffer.currentChar;
                    return true;
                }
                if(buffer.stringOpen===buffer.currentChar){ 
                    add_tokenSecondary();
                    const stringToken = buffer.inputText.substring(buffer.stringStart,buffer.position + 1);
                    add_tokenPrimary(stringToken);
                    buffer.stringOpen = false;
                    return true;
                }
                return false;
            }
            function determine_value(){
                if(':,{}[]'.indexOf(buffer.currentChar)===-1) return false;
                if(buffer.stringOpen) return false;
                add_tokenSecondary();
                add_tokenPrimary(buffer.currentChar);
                switch(buffer.currentChar){
                    case ':' : buffer.isValue = true; return true; break; 
                    case '{' : case '[' : buffer.brackets.push(buffer.currentChar); break;
                    case '}' : case ']' : buffer.brackets.pop(); break;
                }
                if(buffer.currentChar!==':') buffer.isValue = (buffer.brackets[buffer.brackets.length-1]==='[');
                return true;
            }
            function add_tokenSecondary(){
                if(buffer.tokenSecondary.length===0) return false;
                buffer.tokens.push(buffer.tokenSecondary);
                buffer.tokenSecondary = '';
                return true;
            }
            function add_tokenPrimary(value){
                if(value.length===0) return false;
                buffer.tokens.push(value);
                return true;
            }
            for(var i = 0; i < buffer.inputText.length; i++){
                buffer.position = i;
                buffer.currentChar = buffer.inputText.charAt(buffer.position);
                const
                    a = determine_value(),
                    b = determine_string(),
                    c = escape_character();
                if(!a&&!b&&!c) if(!buffer.stringOpen) buffer.tokenSecondary += buffer.currentChar;
            }
            let buffer2 = { brackets : [], isValue : false, tokens: [] };
            buffer2.tokens = buffer.tokens.map( token => {
                let
                    type   = '',
                    string = '',
                    value  = '';
                switch(token){
                    case ',' : 
                        type   = 'symbol';
                        string = token;
                        value  = token;
                        buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1]==='[');
                        break;
                    case ':' : 
                        type   = 'symbol';
                        string = token;
                        value  = token;
                        buffer2.isValue = true;
                        break; 
                    case '{' : case '[' : 
                        type   = 'symbol';
                        string = token;
                        value  = token;
                        buffer2.brackets.push(token);
                        buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1]==='[');
                        break;
                    case '}' : case ']' : 
                        type   = 'symbol';
                        string = token;
                        value  = token;
                        buffer2.brackets.pop();
                        buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1]==='[');
                        break;
                    case 'undefined' :
                        type   = 'primitive';
                        string = token;
                        value  = undefined;
                        break;
                    case 'null' :
                        type   = 'primitive';
                        string = token;
                        value  = null;
                        break;
                    case 'false' :
                        type   = 'primitive';
                        string = token;
                        value  = false;
                        break;
                    case 'true' :
                        type   = 'primitive';
                        string = token;
                        value  = true;
                        break;
                    default :
                        const C = token.charAt(0);
                        function stripQuotesFromKey(text){
                            if(text.length===0) return text;
                            if(['""',"''"].indexOf(text)>-1) return "''";
                            let wrappedInQuotes = false;
                            for(var i = 0; i < 2; i++){
                                if([text.charAt(0),text.charAt(text.length-1)].indexOf(['"',"'"][i])>-1){
                                    wrappedInQuotes = true;
                                    break; 
                                }
                            }
                            if(wrappedInQuotes && text.length >= 2) text = text.slice(1, -1);
                            const
                                nonAlphaNumeric = text.replace(/\w/g,''),
                                alphaNumeric    = text.replace(/\W+/g,''),
                                mayRemoveQuotes = ((nonAlphaNumeric,text) => {
                                    let numberAndLetter = false;
                                    for(var i = 0; i < text.length; i++){
                                        if(i===0) if(isNaN(text.charAt(i))) break;
                                        if(isNaN(text.charAt(i))){
                                            numberAndLetter = true;
                                            break;
                                        }
                                    }
                                    return !(nonAlphaNumeric.length > 0 || numberAndLetter);
                                })(nonAlphaNumeric,text),
                                hasQuotes = (string => { 
                                    for(var i = 0; i < string.length; i++){
                                        if(["'",'"'].indexOf(string.charAt(i))>-1) return true;
                                    }
                                    return false;
                                })(nonAlphaNumeric);
                            if(hasQuotes){
                                let newText = '';
                                const charList = text.split('');
                                for(var ii = 0; ii < charList.length; ii++){
                                    let char = charList[ii];
                                    if(["'",'"'].indexOf(char)>-1) char = '\\' + char;
                                    newText += char;
                                }
                                text = newText;
                            }
                            if(!mayRemoveQuotes)
                                return "'" + text + "'";
                            else
                                return text;
                        }
                        if('\'"'.indexOf(C) > -1){
                            if(buffer2.isValue) type = 'string'; else type = 'key';
                            if(type==='key') string = stripQuotesFromKey(token);
                            if(type==='string'){
                                string = '';
                                const charList2 = token.slice(1, -1).split('');
                                for(var ii = 0; ii < charList2.length; ii++){
                                    let char = charList2[ii];
                                    if('\'\"'.indexOf(char)>-1) char = '\\' + char;
                                    string += char;
                                }
                                string = "'" + string + "'";
                            }
                            value = string;
                            break;
                        }
                        if(!isNaN(token)){
                            type   = 'number'; 
                            string = token;
                            value  = Number(token);
                            break;
                        }
                        if(token.length > 0)
                        if(!buffer2.isValue){
                            type = 'key';
                            string = token;
                            if(string.indexOf(' ') > -1) string = "'" + string + "'";
                            value = string;
                            break;
                        }
                }
                return {
                    type   : type,
                    string : string,
                    value  : value,
                    depth  : buffer2.brackets.length
                }
            });
            let clean = '';
            for(var i = 0; i < buffer2.tokens.length; i++){
                let token = buffer2.tokens[i];
                clean += token.string;
            }
            function indent(number) { 
                var space = [];
                for (var i = 0; i < number * 2; i++) space.push(' ');
                return (number > 0 ? '\n' : '') + space.join('');
            };
            let indentation = '';
            for(var i = 0; i < buffer2.tokens.length; i++){
                let token = buffer2.tokens[i];
                switch(token.string){
                    case '[' : case '{' : 
                        const nextToken = i < (buffer2.tokens.length - 1) - 1 ? buffer2.tokens[i+1] : '';
                        if('}]'.indexOf(nextToken.string)===-1)
                            indentation += token.string + indent(token.depth);
                        else
                            indentation += token.string;
                        break;
                    case ']' : case '}' :
                        const prevToken = i > 0 ? buffer2.tokens[i-1] : '';
                        if('[{'.indexOf(prevToken.string)===-1)
                            indentation += indent(token.depth) + token.string;
                        else
                            indentation += token.string;
                        break;
                    case ':' : indentation += token.string + ' '; break;
                    case ',' : indentation += token.string + indent(token.depth); break;
                    default : indentation += token.string; break;
                }
            }
            let lines = 1;
            function indentII(number){ 
                var space = []; 
                if(number > 0 ) lines++;
                for (var i = 0; i < number * 2; i++) space.push('&nbsp;');
                return (number > 0 ? '<br>' : '') + space.join('');
            };
            let markup = ''; 
            const lastIndex = buffer2.tokens.length - 1;
            for(var i = 0; i < buffer2.tokens.length; i++){
                let token =  buffer2.tokens[i];
                let span = newSpan(i,token,token.depth);
                switch(token.string){
                    case '{' : case '[' :
                        const nextToken = i < (buffer2.tokens.length - 1) - 1 ? buffer2.tokens[i+1] : '';
                        if('}]'.indexOf(nextToken.string)===-1)
                            markup += span + indentII(token.depth);
                        else
                            markup += span;
                        break;
                    case '}' : case ']' :
                        const prevToken = i > 0 ? buffer2.tokens[i-1] : '';
                        if('[{'.indexOf(prevToken.string)===-1)
                            markup += indentII(token.depth) + ( lastIndex === i ? '<br>' : '' ) + span;
                        else
                            markup += span;
                        break;
                    case ':' : markup += span + ' '; break;
                    case ',' : markup += span + indentII(token.depth); break;
                    default  : markup += span; break;
                }
            }
            lines += 2;
            return {
                tokens   : buffer2.tokens,
                noSpaces : clean,
                indented : indentation,
                json     : JSON.stringify(something),
                jsObject : something,
                markup   : markup,
                lines    : lines
            };
        }
    }
    scheduledUpdate(){
        if('onKeyPressUpdate' in this.props) if(this.props.onKeyPressUpdate===false) return;
        const { updateTime } = this;
        if(updateTime===false) return;
        if(updateTime > new Date().getTime()) return;
        this.update();
    }
    updateInternalProps(){
        if((!('onKeyPressUpdate' in this.props)) || this.props.onKeyPressUpdate){
            if(!this.timer) this.timer = setInterval(this.scheduledUpdate,100);
        }
        else
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }
    }
    syntaxHighlight = (json)=>{
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return `<span ${cls!=='key'?'contenteditable=true':'contenteditable=false'} class="${cls}">${match}</span>`;
        });
	}
    assignRef = (component) => {
        this.containerElement = component;
    };
    componentDidMount() {
        this.initJsonEditor();
    }
    initJsonEditor =()=>{
        const form = this.form = doc.forms.main;
        // define 'code' accessors
        Object.defineProperty(this, 'code', {
            get() {
                return this.jsonEditorGetValue();
            },
            set(v) {
                form.code.value = v;
                this.editor.setValue(v);
            }
        });
    }
    render() {
        const { text='' } = this.editor;
        return(
            <div>
                <form name="main">
                    <textarea id="code" name="code" style={{ display: 'none' }}></textarea>
                </form>
                <span
                    ref={ref=>this.assignRef(ref)}
                    id="source" rows="20" cols="50"
                    contentEditable="true"
                    dangerouslySetInnerHTML={{__html: this.syntaxHighlight(text)}}
                    style = {{
                        display       : 'inline-block',
                        boxSizing     : 'border-box',
                        verticalAlign : 'top',
                        height        : '100%',
                        width         : '',
                        flex          : 1,
                        margin        : 0,
                        padding       : '5px',
                        overflowX     : 'hidden',
                        overflowY     : 'auto',
                        wordWrap      : 'break-word',
                        // whiteSpace    : 'pre-line',
                        color         : '#D4D4D4',
                        outline       : 'none',
                        background    : '#fff',
                        width         : '100%',
                        height        : '500px',
                    }}/>
            </div>
        )
    }
}
