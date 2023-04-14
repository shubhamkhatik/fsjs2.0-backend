import mongoose from "mongoose";
const CollectionSchema = new mongoose.Schema({
    name:{
        type:"string",
        required:["true","please provide collection name"],
        trim:true,
        maxLength : [
            120,
            "Collection name should not be more than 120 chars"
        ],
    }
},{timeStamps:true});


export default mongoose.model("Collection",CollectionSchema)
// collections