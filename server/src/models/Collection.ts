import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import Archive from "./Archive";

// Define the attributes
interface CollectionAttributes {
    sn?: number;
    id?: string;
    name: string;
    description: string
    ArchiveId: string
}

// Define the instance type
interface CollectionInstance extends Model<CollectionAttributes>, CollectionAttributes { }

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
        },
        ArchiveId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Archives', key: 'id' }
        }
    },
    {
        timestamps: true,
    }
);

Collection.belongsTo(Archive);


export default Collection;
