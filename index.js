const axios = require('axios')
const qs = require('qs')
const cheerio = require('cheerio')
const functions = require('@google-cloud/functions-framework')

functions.http('sepaperPOST', (req, resApp) => {

    let query = req.body.query
    // let query = 'https://doi.org/10.1515/sem-2017-0088'

    let normalHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Host': `sci-hub.se`,
        'Referer': `https://sci-hub.se/`,
        'Origin': `https://sci-hub.se`
    }


    axios({
        method: 'POST',
        url: `https://sci-hub.se`,
        data: qs.stringify({ 'request': query }),
        headers: normalHeaders
    }).then(async (res) => {
        let $ = cheerio.load(res.data)
        var matching;
        try {
            matching = $($('#article').children('embed')[0]).attr('src') || $($('#article').children('iframe')[0]).attr('src')
            if (!matching.includes('https://') && matching.includes('http://')) matching = matching.replace('http://', 'https://')
            if (!matching.includes('https://') && !matching.includes('http://') && matching.includes('//')) matching = matching.replace('//', 'https://')
            if (matching.indexOf('/') === 0 && !matching.includes('//') && !matching.includes('sci-hub.se')) matching = `https://sci-hub.se${matching}`

            if (matching) resApp.status(200).send(matching)
            // if (matching) console.log(matching)
        } catch (e) {
            resApp.sendStatus(404)
            // console.log('no')
            return
        }
    }).catch(err => {
        console.log(err)
    })
});