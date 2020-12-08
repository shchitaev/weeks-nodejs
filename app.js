export default (express, bodyParser, createReadStream, crypto, http, CORS, writeFileSync, User, UserController, LOGIN, puppeteer, unlinkSync) => {
    const app = express();

    const basePage = `<input type="text" id="inp"><button onclick="this.previousSibling.value='qq'" id="bt">=)</button>`;

    const path = import.meta.url.substring(7);
    if (typeof UserController !== 'function') {
        UserController = () => function (r, res, next) {
            return next();
        };
    }
    app
    .use(express.static('./public'))
    .use((r, res, next) => r.res.set(CORS) && next())
    .use((r, res, next) => {
        r.res.locals.title = 'Пример шаблонизатора';
        next();
    })
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json());


    app
    .get('/test/', async r => {
        const { URL } = r.query;
        const browser = await puppeteer.launch({headless: true, args:['--no-sandbox'] });
        const page = await browser.newPage();
        console.log(URL);
        await page.goto(URL);
        await page.waitForSelector('#bt');
        await page.click('#bt'); 
        await page.waitForSelector('#inp');
        const got = await page.$eval('#inp', el => el.value);
        browser.close();
        r.res.send(got); 
    }); 


    app
    .all('/req/', (req, res) => {
        const addr = req.method === 'POST' ? req.body.addr : req.query.addr;

        http.get(addr, (r, b = '') => {
            r
            .on('data', d => b += d)
            .on('end', () => res.send(b));
        });
    })
    .post('/render', (req, res) => {
       const { addr } = req.query;
       const { random2, random3 } = req.body;
       
       http.get(addr, (r, b = '') => {
        r
        .on('data', d => b += d)
        .on('end', () => {
            writeFileSync(path.replace('app.js', '') + 'views/random.pug', b);
            res.render('random', { random2, random3 });
           });
        });
    })     
    .get('/login/', (req, res) => res.send(LOGIN || 'itmo287704'))  
    .get('/sha1/:input', r => {
        const shasum = crypto.createHash('sha1');
        shasum.update(r.params.input);
        r.res.send(shasum.digest('hex')); 
    })  
    .get('/code/', (req, res) => {
        res.set({ 'Content-Type': 'text/plain; charset=utf-8' });
        createReadStream(path).pipe(res);
    })
    .use('/user', UserController(express, User))
    .all('/*', r => r.res.send('itmo287704'))

    .set('view engine', 'pug');
   
   
    return app;

};
