import store from './Store.js';
import axios from 'axios';

const getData = (url, successString, errorString, prop = null, fetch_again = false) => {
    let currentStore = store.getState();
    prop = prop === null ? url.slice(1, url.length) : prop;

    // do not fetch again if already calculated
    // test for default state
    if (!fetch_again && currentStore[prop][0] !== 'loading...' && currentStore[prop][0] !== errorString) {
        return;
    }
    else {
        //use EC2 instead of localhost
        url = "http://ec2-54-167-224-62.compute-1.amazonaws.com" + url;
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
