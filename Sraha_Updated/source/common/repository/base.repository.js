export const createRepository = (model) => ({
  findOne: (filter = {}) => model.findOne(filter),

  findById: (id) => model.findById(id),

  find: (filter = {}) => model.find(filter),

  create: (data) => model.create(data),

  updateById: (id, changes) => model.findByIdAndUpdate(id, changes, { new: true }),

  //updateOne
  updateOne: (filter, changes) => model.findOneAndUpdate(filter, changes, { new: true }),

  updateMany: (filter, changes) => model.updateMany(filter, changes),

  deleteById: (id) => model.findByIdAndDelete(id),

  deleteMany: (filter = {}) => model.deleteMany(filter),

  count: (filter = {}) => model.countDocuments(filter),

  //2: simple offset-based pagination
  paginate: async (filter = {}, page = 1, size = 10, sort = {}) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(size) || 10, 1);

    const [data, total] = await Promise.all([
      model
        .find(filter)
        .sort(sort)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      model.countDocuments(filter),
    ]);

    return { data, total, page: currentPage, pages: Math.ceil(total / pageSize) };
  },
});