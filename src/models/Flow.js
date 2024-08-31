import { Schema, model } from "mongoose";

const UserSchema = new Schema(
    {   
        name:{
            type: String
        },
        description:{
            type: String
        },
        creation_date:{
            type: Date,
            default: Date.now,
            required: true
        },
        last_update:{
            type: Date,
            default: Date.now,
            required: true
        },
        nodes:{
            type: String,
        },
        classes: [{
            type: Schema.Types.ObjectId,
            ref: 'Class'
        }],
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        }
    }
);

export default model('Flow', UserSchema);