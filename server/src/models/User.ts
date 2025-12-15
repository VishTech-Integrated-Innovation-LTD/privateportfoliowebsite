// Importing necessary Sequelize dependencies: DataTypes for defining column types,
// Model for creating the model class
import { DataTypes, Model } from 'sequelize';
// Importing the configured Sequelize instance for database connection.
import sequelize from '../db';

// Defining the UserAttributes interface to specify the shape of the User model's attributes.
// This ensures type safety for the model's fields and their expected values.
interface UserAttributes {
    sn?: number
    id?: string; 
    userName: string; 
    password: string; 
    userType: 'admin'; 
}

// Defining the UserInstance interface, which extends Sequelize's Model class and UserAttributes.
// This combines Sequelize's model functionality with the custom attributes for type-safe instances.
interface UserInstance extends Model<UserAttributes>, UserAttributes { }


// Defining the User model using sequelize.define, specifying the model name, attributes, and options.
// The generic type UserInstance ensures type safety for the model's instances.
const User = sequelize.define<UserInstance>(
    'User', 
    {
        // Defining the model's attributes (columns) with their data types.
       sn: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true 
  },
        id: {
            type: DataTypes.UUID, // UUID type for unique identifier.
            defaultValue: DataTypes.UUIDV4, // Automatically generates a UUID v4 for new records.
            primaryKey: true, // Marks this field as the primary key.
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        password: {
            type: DataTypes.STRING, // String type for the user's password (typically hashed).
            allowNull: false, 
        },
        userType: {
            type: DataTypes.ENUM('admin'), 
            allowNull: false,
            defaultValue: 'admin', 
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt columns to track record creation/update times.
    }
);


// Exporting the User model for use in other parts of the application.
export default User;
