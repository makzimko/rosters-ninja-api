import Router from '@koa/router';

import listMiddleware from '../../middleware/list';
import authMiddleware from '../../middleware/auth';
import { ListModel, UnitModel } from '../../models';
import { Types } from 'mongoose';

const listsRouter = new Router();
listsRouter.prefix('/v1/lists');

listsRouter.patch('/:id', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;
  const data = ctx.request.body;

  await list.edit(data);

  ctx.body = await ListModel.findById(list._id);
});

listsRouter.delete('/:id', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;
  const { destination } = ctx.request.body;

  if (!list) {
    ctx.throw(404);
  }

  if (list.predefined) {
    ctx.throw(400, 'Removing of predefined list if forbidden');
  }

  try {
    const movedUnits = await list.removeList(destination);

    ctx.body = {
      movedUnits,
    };
  } catch (e) {
    ctx.throw(400, e.message);
  }
});

listsRouter.get('/:id/units', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;
  const { units } = await ListModel.populate(list, 'units');

  ctx.body = units;
});

listsRouter.post('/:id/units', authMiddleware, listMiddleware, async ctx => {
  const { list } = ctx.state;
  const data = ctx.request.body;

  const unit = new UnitModel({
    ...data,
    project: Types.ObjectId(list.project),
    list: list._id,
  });
  await unit.save();

  list.units.push(unit._id);
  await list.save();

  ctx.body = await UnitModel.findById(unit._id);
});

export default listsRouter;
