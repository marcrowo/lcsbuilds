import store from './Store.js';
import axios from 'axios';

const getData = (url, successString, errorString, prop = null) => {
    let currentStore = store.getState();
    prop = prop === null ? url.slice(1, url.length) : prop;

    // do not fetch again if already calculated
    // test for default state
    if (currentStore[prop].length !== 1 && currentStore[prop][0] !== errorString) {
        return;
    }
    else {
        axios.get(url)
            .then(function(response) {
                store.dispatch({
                    type: successString,
                    data: response.data,
                })
            })
            .catch(function(err) {
                console.log(err);
                store.dispatch({
                    type: errorString,
                })
            });
    }
};

export default getData;
