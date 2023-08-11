const { expect } = require('chai');
const { app } = require('../src/app')
const axios = require('axios')

describe('HTTP Status Code Tests', async () => {

    before('Start the server', async () => {
        app.listen(8000);
        console.log(`App listening on port 8000!`)
    })

    it('GET /hello-world should 200', async () => {
        const response = await axios.get('http://localhost:8000/hello-world');
        expect(response.status).to.equal(200)
    })

    it('GET /does-not-exist should 404', async () => {

        let error = null;
        try {
            const response = await axios.get('http://localhost:8000/does-not-exist');
        }
        catch (err) {
            error = err
        }

        expect(error).to.not.be.null
        expect(error.response.status).to.equal(404)


    })
})