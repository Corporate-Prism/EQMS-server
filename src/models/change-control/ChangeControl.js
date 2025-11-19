import mongoose from "mongoose";

const ChangeControlSchema = new mongoose.Schema(
    {
        changeControlNumber: {
            type: String,
            unique: true,
            trim: true,
        },
        capa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CAPA",
            required: true,
        },
        status: {
            type: String,
            enum: ["Draft"],
            default: "Draft"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
        },
    },
    { timestamps: true }
);

ChangeControlSchema.pre("validate", async function (next) {
    if (this.changeControlNumber) return next();
    try {
        const CAPA = mongoose.model("CAPA");
        const capa = await CAPA.findById(this.capa);
        if (!capa) throw new Error("CAPA not found");
        const count = await mongoose
            .model("ChangeControl")
            .countDocuments({ capa: this.capa });
        this.changeControlNumber = `${capa.capaNumber}-CC${String(count + 1).padStart(2, "0")}`;
        next();
    } catch (err) {
        next(err);
    }
});
const ChangeControl = mongoose.model("ChangeControl", ChangeControlSchema);
export default ChangeControl;