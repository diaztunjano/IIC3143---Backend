require('dotenv').config();
const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const jwt = require('jsonwebtoken');

const StockSerializer = new JSONAPISerializer('assets', {
  attributes: [
    'id',
    'ticker',
    'price',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
});
const router = new KoaRouter();

// http://localhost:3000/api/stock/ (obtengo todas los productos)
router.get('api.stocks.all', '/', async (ctx) => {
  try {
    const authHeader = ctx.request.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const assetsList = await ctx.orm.asset.findAll();
    if (assetsList.length === 0) {
      ctx.throw(404, 'No hay stock registrados');
    } else {
      ctx.status = 200;
      ctx.body = StockSerializer.serialize(assetsList);
    }
    }
  catch { ctx.throw(401, 'Token incorrecto');}
  }
});

module.exports = router;
