// https://axios-http.com/zh/docs/api_intro

const loadContext = require('../test/testloadcontext');
it('http get test', async () => {
    const a = await loadContext();
    const http = a.beans.http;
    const response = await http.call({
        method: 'get',
        url: 'https://httpbin.org/get',
        headers: {
            'Accept': 'application/json',
            'Custom-Header': 'test_value'
        },
        params: {
            key1: 'value1',
            key2: 'value2'
        }
    });
    console.log(response);
}).timeout(100000);

it('http get test 2', async () => {
    const a = await loadContext();
    const http = a.beans.http;
    const response = await http.get({
        url: 'https://httpbin.org/get',
        headers: {
            'Accept': 'application/json',
            'Custom-Header': 'test_value'
        },
        params: {
            key1: 'value1',
            key2: 'value2'
        }
    });
    console.log(response);
}).timeout(100000);


it('http post test', async () => {
    const a = await loadContext();
    const http = a.beans.http;
    const response = await http.call({
        method: 'post',
        url: 'https://httpbin.org/post',
        headers: {'Content-Type': 'application/json'},
        data: {test: 'hello'}
    });
    console.log(response);
}).timeout(100000);
