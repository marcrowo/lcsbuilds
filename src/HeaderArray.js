import React, { Component } from 'react';
import Header from './Header.js';

const ArrayList = ({ array }) => (
    <ul>
        {array.map(element =>
                <li key={element}>
                    {element}
                </li>
        )}
    </ul>
);

const HeaderArray = ({ title, array }) => {
    return (
        <div>
            <Header/>
            <h3>{title}</h3>
            <ArrayList array={array}/>
        </div>
    );
};

export default HeaderArray;
