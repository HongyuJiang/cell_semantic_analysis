import axios from 'axios';

export default class DataProvider {
    static getCellInfo() {

        return axios.get('/static/cell_info.json');
    }
    static getRegionJson() {

        return axios.get('https://raw.githubusercontent.com/longwosion/geojson-map-china/master/geometryCouties/510700.json');
    }
    static getCellFeatures() {

        return axios.get('/static/cell_features.json');
    }

    static getUserEmbData() {

        return axios.get('/static/user_emb.json');
    }

    static getUserBehavior() {

        return axios.get('/static/persons_behaviors.json');
    }

    static getCellEmb() {

        return axios.get('/static/cell_emb.json');
    }

}