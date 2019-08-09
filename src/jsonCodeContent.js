import React, { Component } from 'react';
import JSonCode from './main';
const value = {"aec":{"hw":true,"sw":true,"type":0,"level":1},"agc":{"hw":true,"sw":true,"digital_gain":12,"limiter_enable":true,"mode":1,"target_dbov":-3}}

export default class JsonCodeContent extends Component {
    constructor(props) {
      super(props);
    }
    componentDidMount(){
      new JSonCode({
        container: this.textCode
      });
    }
    render(){
      return(
        <textarea id="code" name="code" ref={ref=>this.textCode = ref}
          defaultValue={JSON.stringify(value,null,2)}
        />
      )
    }
}
