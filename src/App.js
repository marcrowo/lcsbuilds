import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const ArrayList = ({ array }) => (
    <ul>
        {array.map(element =>
                <li key={element}>
                    {element}
                </li>
        )}
    </ul>
);

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>lcsbuilds-react</h2>
                </div>
                <ArrayList array={this.props.teams}/>
            </div>
        );
    }
}

export default App;
