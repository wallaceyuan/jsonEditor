import React, { Component } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

var jsonCode = [
  '{',
  '    "p1": "v3",',
  '    "p2": false',
  "}"
].join('\n');

var modelUri = monaco.Uri.parse("a://b/foo.json"); // a made up unique URI for our model
var model = monaco.editor.createModel(jsonCode, "json", modelUri);
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: [{
    uri: "http://myserver/foo-schema.json", // id of the first schema
    fileMatch: [modelUri.toString()], // associate with our model
    schema: {
        type: "object",
        properties: {
            p1: {
                enum: ["v1", "v2"]
            },
            p2: {
                $ref: "http://myserver/bar-schema.json" // reference the second schema
            }
        }
    }
  }]
});

export default class JsonMonaco extends Component {
    constructor(props) {
      super(props)
    }
    componentDidMount(){
      this.monacoInstance = monaco.editor.create(document.getElementById("monaco"),{
        model: model
      })
    }
    componentWillMount(){
      this.monacoInstance && this.monacoInstance.dispose();//使用完成销毁实例
    }
    render(){
      return(
        <div id="monaco" style={{width:'1000px',height:'500px'}}></div>
      )
    }
}
