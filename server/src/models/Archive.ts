import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import Category from "./Category";

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

Archive.belongsTo(Category);


export default Archive;
