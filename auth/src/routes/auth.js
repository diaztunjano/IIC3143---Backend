require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
var assert = require('assert');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const KoaRouter = require('koa-router');
const jwtgenerator = require('jsonwebtoken');

const router = KoaRouter();

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 365 },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

function generateStaticToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 365 },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}


// http://localhost:3000/api/auth/generateToken
router.post('api.users.create', '/generateToken', async (ctx) => {
  try {

    if (true) {
      const user = ctx.orm.user.build(ctx.request.body);
      user.id = uuidv4();
      user.nick = "externalUser";
      user.email = "external@exchange.com"
      user.member = false;
      user.isAdmin = false;
      user.isActive = true;
      user.balance = 100000000;
      user.password = "AAAAAAAA111"
      await user.save({
        field: ['id', 'nick', 'email',
          'password', 'balance', 'member', 'isAdmin', 'isActive'],
      });
      const token = await generateStaticToken(user);

      ctx.body = {
        access_token: token,
        token_type: 'bearer',
      };
    } 
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.throw(400);
    ctx.body = ValidationError;
  }
});


// http://localhost:3000/api/auth/user_company_or_admin (post para login de usuario, compañia o admin)

// http://localhost:8080/api/auth/user_company_or_admin (post para login de usuario, compañia o admin)
router.post('api.auth.login', '/:kindUser', async (ctx) => {
  const { email, password } = ctx.request.body;
  if (ctx.params.kindUser == 'user') {
    const user = await ctx.orm.user.findOne({ where: { email } });
    if (!user) ctx.throw(404, 'Usuario no encontrado');
    const authenticated = await user.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    try {
      const token = await generateToken(user);
      const toSendUser = {
        nick: user.nick,
        email,
        id: user.id,
        balance: user.balance,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
      };
      ctx.body = {
        ...toSendUser,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  } else if (ctx.params.kindUser == 'company') {
    const company = await ctx.orm.company.findOne({ where: { email } });
    if (!company) ctx.throw(404, 'Compañía no encontrada');
    const authenticated = await company.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    try {
      const token = await generateToken(company);
      const toSendCompany = {
        name: company.name,
        email,
        id: company.id,
        balance: company.balance
      };
      ctx.body = {
        ...toSendCompany,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  } else {
    const user = await ctx.orm.user.findOne({ where: { email } });
    if (!user) ctx.throw(404, 'Usuario no encontrado');
    const authenticated = await user.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    if (!user.isAdmin) ctx.throw(401, 'Usuario no no es administrador');
    try {
      const token = await generateToken(user);
      const toSendUser = {
        nick: user.nick,
        email,
        id: user.id,
        balance: user.balance,
        isAdmin: true,
        isActive: true,
      };
      ctx.body = {
        ...toSendUser,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  }
});

// http://localhost:8080/api/auth/register/user_or_company (post para registrar un usuario o compañia)
router.post('api.users.create', '/register/:kindUser', async (ctx) => {
  try {
    if (ctx.params.kindUser == 'user') {
      const user = ctx.orm.user.build(ctx.request.body);
      user.id = uuidv4();
      await user.save({
        field: ['id', 'nick', 'email',
        'password', 'balance', 'member', 'isAdmin', 'isActive'],
      });
      ctx.body = user;
    } else {
      const company = ctx.orm.company.build(ctx.request.body);
      company.id = uuidv4();
      await company.save({
        field: ['id', 'name', 'email',
          'password', 'balance' ],
      });
      ctx.body = company;
    }
    if (ctx.body.dataValues.member) {
      const text = `Estimado/a:\nLe informamos que se ha creado exitosamente su cuenta\nSaludos!`;
      const msg = {
        to: ctx.body.dataValues.email,
        from: 'fintechemail1@gmail.com',
        subject: `Cuenta Creada`,
        text,
      };
      sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
    }
    ctx.status = 201;
    // const config = {
    //   method: 'POST',
    //   url: `https://insights-collector.newrelic.com/v1/accounts/${process.env.NEW_RELIC_ID}/events`,
    //   headers: { 'x-insert-key': `${process.env.NEW_RELIC_KEY}`,
    //               'Content-Type': 'application/json'},
    //   data: {'eventType': 'Register', 'id': ctx.body.dataValues.id}
    // }
    // console.log(config);
    
    var options = {
      method: 'POST',
      url: `https://insights-collector.newrelic.com/v1/accounts/${process.env.NEW_RELIC_ID}/events`,
      body: {
        "eventType": "RegisterUser",
        "id": "1"},
      headers: {
        'Api-Key': `${process.env.NEW_RELIC_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    console.log("options", options);
    // console.log("options", await axios(options));
    await axios(options);

    // function callback(error, response, body) {
    //   console.log(response.statusCode + " status code")
    //   assert.ok(response.statusCode == 200, 'Expected 200 OK response');
    //   var info = JSON.parse(body);
    //   assert.ok(info.success == true, 'Expected True results in Response Body, result was ' + info.success);
    //   console.log("End reached");
    // }
    console.log("options", options);

    // http.post(options, callback);
    console.log("post enviado");
  } catch (ValidationError) {
    ctx.throw(400);
    console.log(ValidationError);
    ctx.body = ValidationError;
  }
});

module.exports = router;
