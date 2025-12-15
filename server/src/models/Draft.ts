import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import Category from "./Category";

// Define the attributes
interface DraftAttributes {
    sn?: number;
    id?: string;
    title: string;
    description: string
    CategoryId: string
    mediaType: string
    visibility: 'public' | 'private';
    cloudServiceUrl: string
}

// Define the instance type
interface DraftInstance extends Model<DraftAttributes>, DraftAttributes { }

// Define the base model and cast after defining
const Draft = sequelize.define<DraftInstance>(
    "Draft",
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
            defaultValue: 'private',
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

Draft.belongsTo(Category);


export default Draft;
