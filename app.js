
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
            r.res.end(JSON.stringify({"id":1,"date":"2020-11-27T14:19:39","date_gmt":"2020-11-27T14:19:39","guid":{"rendered":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/?p=1"},"modified":"2020-11-30T00:57:15","modified_gmt":"2020-11-30T00:57:15","slug":"hello-world","status":"publish","type":"post","link":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/2020\/11\/27\/hello-world\/","title":{"rendered":"itmo287704"},"content":{"rendered":"\n<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!<\/p>\n<center><b>&copy; 2020 Ilya<\/center><\/b>","protected":false},"excerpt":{"rendered":"<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing! &copy; 2020 Ilya<\/p>\n","protected":false},"author":1,"featured_media":0,"comment_status":"open","ping_status":"open","sticky":false,"template":"","format":"standard","meta":[],"categories":[1],"tags":[],"_links":{"self":[{"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/posts\/1"}],"collection":[{"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/posts"}],"about":[{"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/types\/post"}],"author":[{"embeddable":true,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/users\/1"}],"replies":[{"embeddable":true,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/comments?post=1"}],"version-history":[{"count":1,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/posts\/1\/revisions"}],"predecessor-version":[{"id":7,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/posts\/1\/revisions\/7"}],"wp:attachment":[{"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/media?parent=1"}],"wp:term":[{"taxonomy":"category","embeddable":true,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/categories?post=1"},{"taxonomy":"post_tag","embeddable":true,"href":"https:\/\/weeks-nodejs-shchitaev.herokuapp.com\/wordpress\/wp-json\/wp\/v2\/tags?post=1"}],"curies":[{"name":"wp","href":"https:\/\/api.w.org\/{rel}","templated":true}]}}}));
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
            res.set(headersCORS);
            const {addr} = req.query;
            const {random2, random3} = req.body;
            
            http.get(addr,(r, b='') => {
                r
                .on('data',d=>b+=d)
                .on('end',()=>{
                    fs.writeFileSync('views/index.pug', b);
                    res.render('index',{login:'itmo287704',random2,random3})
                })
            })
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
        .use(({res:r})=>r.status(404).set(headersHTML).send('<h1 style="font-family:Courier New;color:gray;">Ошибка: 404</h1>'))
        .set('view engine','pug')
    return app;
}
