// src/models/index.ts
import './Archive';
import './Collection';
import './CollectionItem';
import './Category';

import sequelize from '../db';

// Call all associations
const models = sequelize.models;

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export default sequelize;