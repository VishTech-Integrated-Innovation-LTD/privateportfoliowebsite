import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import Category from "./Category";
import CollectionItem from "./CollectionItem";
import Collection from "./Collection";

// Define the attributes
interface ArchiveAttributes {
    sn?: number;
    id?: string;
    title: string;
    description: string
    CategoryId: string
    mediaType: string
    visibility: 'public' | 'private';
    isOnTheMainPage: boolean
    cloudServiceUrl: string
} 

// Define the instance type
interface ArchiveInstance extends Model<ArchiveAttributes>, ArchiveAttributes { }

// Define Models object for associate
// ModelStatic: a type representing a Sequelize model constructor 
// (the return type of sequelize.define).
interface Models {
  CollectionItem: ModelStatic<Model>;
  Collection: ModelStatic<Model>;
}

// Define the base model and cast after defining
const Archive = sequelize.define<ArchiveInstance>(
    "Archive",
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        CategoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Categories', key: 'id' }
        },
        mediaType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        visibility: {
            type: DataTypes.ENUM('public', 'private'),
            allowNull: false,
            defaultValue: 'public',
        },
        isOnTheMainPage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        cloudServiceUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

// Extend the model with `associate`
// (Archive as typeof Archive & { associate?: (models: Models) => void }).associate = (models: Models) => {
//   Archive.hasMany(models.CollectionItem, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
//   });

  // After defining the Archive model
// Archive.belongsToMany(Collection, {
//   through: CollectionItem,
//   foreignKey: 'ArchiveId',
//   otherKey: 'CollectionId',
//   as: 'Collections' // Important: matches the alias in query
// });
// };

// (Archive as any).associate = (models: any) => {
//   Archive.hasMany(models.CollectionItem, { foreignKey: 'ArchiveId' });

//   Archive.belongsToMany(models.Collection, {
//     through: models.CollectionItem,
//     foreignKey: 'ArchiveId',
//     otherKey: 'CollectionId',
//     as: 'Collections'
//   });

// //   Archive.belongsTo(models.Category);
// };



(Archive as typeof Archive & { associate?: (models: any) => void }).associate = (models: any) => {
  Archive.hasMany(models.CollectionItem, {
    foreignKey: 'ArchiveId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Archive.belongsToMany(models.Collection, {
    through: models.CollectionItem,
    foreignKey: 'ArchiveId',
    otherKey: 'CollectionId',
    as: 'Collections'
  });

  Archive.belongsTo(models.Category);
};


Archive.belongsTo(Category);


export default Archive;
