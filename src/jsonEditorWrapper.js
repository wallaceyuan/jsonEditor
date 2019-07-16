import React, { Component } from 'react';
import JsonEditor from './jsonEditor'
import './style.css';
import { Button } from 'antd';

export default class JsonEditorWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorValue:''
    }
    this.getValue = this.getValue.bind(this);
  }
  getValue(){
    const node = this.jsonEditor;
    const model = node.editor;
    const value = model.getValue();
    this.setState({
      editorValue: value
    })
  }
  render() {
    const { editorValue } = this.state;
    return(
      <div>
        <pre className="pre" style={{ width:'50%', margin:'100px auto' }}>
          <JsonEditor ref={ref=>this.jsonEditor=ref}/>
        </pre>
        <Button onClick={this.getValue} />
        <p> { editorValue?  JSON.stringify(JSON.parse(this.state.editorValue),null,2): null }</p>
      </div>
    )
  }
}
