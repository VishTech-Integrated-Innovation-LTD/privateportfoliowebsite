import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
import Archive from "./Archive";
import Draft from "./Draft";

// Define the attributes
interface CategoryAttributes {
  sn?: number;
  id?: string;
  name: string;
  description: string
}

// Define the instance type
interface CategoryInstance extends Model<CategoryAttributes>, CategoryAttributes { }

// Define Models object for associate
// ModelStatic: a type representing a Sequelize model constructor 
// (the return type of sequelize.define).
interface Models {
  Archive: ModelStatic<Model>;
  Draft: ModelStatic<Model>;
}


// Define the base model and cast after defining
const Category = sequelize.define<CategoryInstance>(
  "Category",
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
  },
  {
    timestamps: true,
  }
);

// Extend the model with `associate`
(Category as typeof Category & { associate?: (models: Models) => void }).associate = (models: Models) => {
  Category.hasMany(models.Archive);
  Category.hasMany(models.Draft);
};


export default Category;
