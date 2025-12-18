import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";

// Define the attributes
interface CollectionItemAttributes {
    sn?: number;
    id?: string;
    CollectionId: string;
    ArchiveId: string
}

// Define the instance type
interface CollectionItemInstance extends Model<CollectionItemAttributes>, CollectionItemAttributes { }

// Define the base model and cast after defining
const CollectionItem = sequelize.define<CollectionItemInstance>(
    "CollectionItem",
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
        CollectionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Collections', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        ArchiveId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Archives', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
    },
    {
        timestamps: true,
    }
);



export default CollectionItem;
