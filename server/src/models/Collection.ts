import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import CollectionItem from "./CollectionItem";
import Archive from "./Archive";


// Define the attributes
interface CollectionAttributes {
    // itemCount: string;
    sn?: number;
    id?: string;
    name: string;
    description: string
}

// Define the instance type
interface CollectionInstance extends Model<CollectionAttributes>, CollectionAttributes { }

// Define Models object for associate
// ModelStatic: a type representing a Sequelize model constructor 
// (the return type of sequelize.define).
interface Models {
  CollectionItem: ModelStatic<Model>;
  Archive: ModelStatic<Model>
}

// Define the base model and cast after defining
const Collection = sequelize.define<CollectionInstance>(
    "Collection",
    {
        sn: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true
        },
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

// Extend the model with `associate`
// (Collection as typeof Collection & { associate?: (models: Models) => void }).associate = (models: Models) => {
//   Collection.hasMany(models.CollectionItem, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
//   });

  // Add belongsToMany association
//   Collection.belongsToMany(models.Archive, {
//     through: models.CollectionItem,
//     foreignKey: 'CollectionId',
//     otherKey: 'ArchiveId',
//     as: 'Archives'
//   });

// };


// (Collection as any).associate = (models: any) => {
// //   Collection.hasMany(models.CollectionItem, { foreignKey: 'CollectionId' });

//   Collection.belongsToMany(models.Archive, {
//     through: models.CollectionItem,
//     foreignKey: 'CollectionId',
//     otherKey: 'ArchiveId',
//     as: 'Archives'
//   });
// };

(Collection as typeof Collection & { associate?: (models: any) => void }).associate = (models: any) => {
  Collection.hasMany(models.CollectionItem, {
    foreignKey: 'CollectionId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Collection.belongsToMany(models.Archive, {
    through: models.CollectionItem,
    foreignKey: 'CollectionId',
    otherKey: 'ArchiveId',
    as: 'Archives'
  });
};

export default Collection;
