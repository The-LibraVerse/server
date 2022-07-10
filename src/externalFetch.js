const axios = require('axios');

module.exports = {
    fetch(url) {
        return axios.get(url)
        .then(res => {
            // console.log('axios fetch:', res);
            return res.data;
        });
    }
}
