
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m, puppeteer) {
    const app = express();
    const path = import.meta.url.substring(7);
    const headersHTML = {'Content-Type':'text/html; charset=utf-8',...CORS}
    const headersTEXT = {'Content-Type':'text/plain',...CORS}
    const headersJSON={'Content-Type':'application/json',...CORS}
    const headersCORS={...CORS}; 
    
    app 
    .use(express.static('./public/.'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    
        .all('/login/', r => {
            r.res.set(headersTEXT).send('itmo287704');
        })
        .all('/code/', r => {
            r.res.set(headersTEXT)
            fs.readFile(path,(err, data) => {
                if (err) throw err;
                r.res.end(data);
              });           
        })
        .all('/wordpress/wp-json/wp/v2/posts/1', r => {
            r.res.set(headersJSON)
            r.res.end(JSON.stringify({ "title":{"rendered":"itmo287704"}}));
            })      
        .all('/sha1/:input/', r => {
            r.res.set(headersTEXT).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) =>{
            res.set(headersTEXT);
            let data = '';
            http.get(req.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                res.send(data)
            })
        })
    
        .post('/req/', r =>{
            r.res.set(headersTEXT);
            const {addr} = r.body;
            r.res.send(addr)
        })
        .post('/insert/', async r=>{
            r.res.set(headersTEXT);
            const {login,password,URL}=r.body;
            const newUser = new User({login,password});
            try{
                await m.connect(URL, {useNewUrlParser:true, useUnifiedTopology:true});
                try{
                    await newUser.save();
                    r.res.status(201).json({'Добавлено: ':login});
                }
                catch(e){
                    r.res.status(400).json({'Ошибка: ':'Нет пароля'});
                }
            }
            catch(e){
                console.log(e.codeName);
            }      
        })
        .post('/render', (req, res) => {
       const { addr } = req.query;
       const { random2, random3 } = req.body;
       
       http.get(addr, (r, b = '') => {
        r
        .on('data', d => b += d)
        .on('end', () => {
            //fs.writeFileSync('./views/index.pug', b);
            res.render('random', { random2, random3 });
           });
        });
    })    
    .get('/test/', async r => {
        const { URL } = r.query;
        const browser = await puppeteer.launch({
                args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                      ],
                        });
        const page = await browser.newPage();
        console.log(URL);
        await page.goto(URL);
        await page.waitForSelector('#bt');
        await page.click('#bt'); 
        await page.waitForSelector('#inp');
        const got = await page.$eval('#inp', el => el.value);
        browser.close();
        r.res.send(got); 
    })
    
        .use((err, req, res, next) => {
        if (err.statusCode == 406) return res.status(406).json({message: 'Ошибка согласования контента'});
        res.status(500).send('<h1 style="font-family:Courier New;color:gray;">Ошибка: 500</h1>'); 
                                      })
        .use(({res:r})=>r.status(404).set(headersHTML).send('<h1 style="font-family:Courier New;color:gray;">Ошибка: 404</h1>'))
        .set('view engine','pug')
    return app;
}
