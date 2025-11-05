import mongoose from "mongoose";
import Department from "../Department.js";

const DeviationSchema = new mongoose.Schema(
    {
        deviationNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        reportedAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "Draft",
                "Under Department Head Review",
                "Approved By Department Head",
                "Accepted By QA",
                "Investigation Team Assigned",
                "Team Impact Assessment Done"
                // "Submitted",
                // "Returned for Revision",
                // "Under Department Head Review",
                // "Under QA Review",
                // "Under Investigation",
                // "Under Impact Assessment",
                // "Under CAPA",
                // "Under QA Verification",
                // "Closed",
                // "Rejected",
            ],
            default: "Draft",
        },

        deviationType: {
            type1: {
                type: String,
                enum: ["Planned", "Unplanned"],
                required: true,
            },
            type2: {
                type: String,
                enum: ["GMP", "Non-GMP"],
                required: true,
            },
            type3: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "DeviationCategory",
                required: true,
            },
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
        },
        item: {
            type: {
                type: String,
                enum: ["product", "material"],
                required: true,
            },
            product: {
                productName: String,
                productCode: String,
                productBatchNumber: String,
            },
            material: {
                materialName: String,
                materialCode: String,
                materialBatchNumber: String,
            },
        },
        equipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
        },
        document: {
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "document.documentModel",
                required: false,
            },
            documentModel: {
                type: String,
                enum: [
                    "Manual",
                    "Policy",
                    "Procedure",
                    "WorkInstruction",
                ],
                required: false,
            },
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        detailedDescription: {
            question1: {
                type: String,
                default: "What occurred?",
            },
            answer1: {
                type: String,
                trim: true,
            },
            question2: {
                type: String,
                default: "How was it identified?",
            },
            answer2: {
                type: String,
                trim: true,
            },
            attachments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Attachments",
                },
            ],
        },
        immediateMeasuresTaken: {
            type: String,
            trim: true,
        },
        immediateImpactAssessment: {
            type: String,
            trim: true,
        },
        relatedRecords: {
            attachments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Attachments",
                },
            ],
        },
        impactAssessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviationImpact",
        },
        riskAssessment: {
            type: Number,
            min: 1,
            max: 10,
        },
        securityLevel: {
            type: String,
            enum: ["Minor", "Major", "Critical"],
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },
        submittedAt: {
            type: Date,
            default: null,
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
        reviewedAt: { type: Date },
        reviewComments: { type: String },
        qaReviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
        qaReviewedAt: { type: Date },
        qaComments: { type: String },
        investigationTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InvestigationTeam",
            default: null
        },
        investigationAssignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
        },
        teamImpactAssessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviationImpact",
            default: null,
        },
    },
    { timestamps: true }
);

DeviationSchema.pre("validate", async function (next) {
    if (this.deviationNumber) return next();

    try {
        const department = await Department.findById(this.department);
        if (!department) throw new Error("Department not found");
        let prefix = department.departmentName.substring(0, 3).toUpperCase();
        const otherDepts = await Department.find({
            _id: { $ne: this.department },
            departmentName: { $regex: new RegExp(`^${prefix}`, "i") },
        });
        if (otherDepts.length > 0) {
            const randomNum = Math.floor(100 + Math.random() * 900);
            prefix = `${prefix}${randomNum}`;
        }
        const count = await mongoose
            .model("Deviation")
            .countDocuments({ department: this.department });
        this.deviationNumber = `${prefix}-DEV${String(count + 1).padStart(3, "0")}`;
        next();
    } catch (err) {
        next(err);
    }
});

const Deviation = mongoose.model("Deviation", DeviationSchema);
export default Deviation;