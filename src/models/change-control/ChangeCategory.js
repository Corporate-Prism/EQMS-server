import mongoose from "mongoose";

const ChangeCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    }
  },
  { timestamps: true }
);

const ChangeCategory = mongoose.model("ChangeCategory", ChangeCategorySchema);

export default ChangeCategory;