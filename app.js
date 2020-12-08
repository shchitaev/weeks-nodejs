export default (
  express,
  bodyParser,
  createReadStream,
  crypto,
  http,
  mongoose,
  User,
  CORS
) => {
  const app = express();
  app
    .use((req, res, next) => {
      res.set(CORS);
      next();
    })
    .use(bodyParser.urlencoded({ extended: true }))
    .get('/users/:url', async (req, res) => {
      const URL = req.body.URL;
      try {
        await mongoose.connect(URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      } catch (error) {
        console.log('error mongo', error);
      }

      const users = await User.find();
      res.locals.usersTitle = 'Users title';
      res.format({
        'aplication/json': () => res.json(users),
        'text/html': () => res.render('users', { users }),
      });
    })
    .get('/sha1/:input', (req, res) => {
      const { input } = req.params;
      const shasum = crypto.createHash('sha1');
      shasum.update(input);
      res.send(shasum.digest('hex'));
    })
    .get('/login/', (req, res) => res.send('itmo287704'))
    .get('/code/', (req, res) => {
      res.set({ 'Content-Type': 'text/plain; charset=utf-8' });
      createReadStream(import.meta.url.substring(7)).pipe(res);
    });

  app.post('/insert/', async (req, res) => {
    const { URL, login, password } = req.body;
    try {
      await mongoose.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const newUser = new User({ login, password });
      await newUser.save();
      res.status(201).send(`User was saved with login ${login}`);
    } catch (e) {
      res.send(e.codeName);
    }
  });

  app
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
    .set('view engine', 'pug');

  app.all('/req/', (req, res) => {
    let url = req.method === 'POST' ? req.body.addr : req.query.addr;
    http.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        res
          .set({
            'Content-Type': 'text/plain; charset=utf-8',
          })
          .end(data);
      });
    });
  });

  app
    .all('*', (req, res) => {
      res.send('itmo287704');
    })
    .use((error, req, res, next) =>
      res.status(500).set(CORS).send(`Error : ${error}`)
    )
    .set('view engine', 'pug');

  return app;
};
