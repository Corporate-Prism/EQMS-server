import mongoose from "mongoose";

const DeviationCategorySchema = new mongoose.Schema(
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

const DeviationCategory = mongoose.model("DeviationCategory", DeviationCategorySchema);

export default DeviationCategory;
