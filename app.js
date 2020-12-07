
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m, puppeteer) {
    const app = express();
    const path = import.meta.url.substring(7);
    const headersHTML = {'Content-Type':'text/html; charset=utf-8',...CORS}
    const headersTEXT = {'Content-Type':'text/plain',...CORS}
    const headersJSON={'Content-Type':'application/json',...CORS}

    app    
        .use(bodyParser.urlencoded({extended:true}))  
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
        .all('/render/',async(req,res)=>{
            r.res.set(headersHTML);
            const {addr} = req.query;
            const {random2, random3} = req.body;
            
            http.get(addr,(r, b='') => {
                r
                    .on('data',d=>b+=d)
                    .on('end',()=>{
                        writeFileSync(path.replace('app.js','')+'views/index.pug', b);
                        res.render('index',{random2:random3})
                    })

            })
        })
        .all('/test/', async r=>{
            r.res.set(headersTEXT)
            const {URL} = r.query;
            console.log(URL)
            const browser = await puppeteer.launch({headless: true, args:['--no-sandbox','--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.goto(URL);
            await page.waitForSelector("#inp");
            await page.click('#bt');
            const got = await page.$eval('#inp',el=>el.value);
            console.log(got);
            browser.close()
            r.res.send(got)
            
        })   
        .use(({res:r})=>r.status(404).set(headersHTML).send('itmo287704'))
        .set('view engine','pug')
    return app;
}
