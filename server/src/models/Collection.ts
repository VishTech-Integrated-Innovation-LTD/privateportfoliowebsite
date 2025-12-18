import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import CollectionItem from "./CollectionItem";


// Define the attributes
interface CollectionAttributes {
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
(Collection as typeof Collection & { associate?: (models: Models) => void }).associate = (models: Models) => {
  Collection.hasMany(models.CollectionItem, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Collection;
