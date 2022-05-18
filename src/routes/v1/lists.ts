import Router from '@koa/router';

import listMiddleware from '../../middleware/list';
import authMiddleware from '../../middleware/auth';
import { UnitModel } from '../../models';
import { Types } from 'mongoose';

const listsRouter = new Router();
listsRouter.prefix('/v1/lists');

listsRouter.get('/:id/units', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;

  ctx.body = await UnitModel.findByIds(list.units);
});

listsRouter.post('/:id/units', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;
  const data = ctx.request.body;

  const unit = new UnitModel({
    ...data,
    project: Types.ObjectId(list.project),
  });
  await unit.save();

  list.units.push(unit._id);
  await list.save();

  ctx.body = await UnitModel.findById(unit._id);
});

export default listsRouter;