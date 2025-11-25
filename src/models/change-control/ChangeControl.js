import mongoose from "mongoose";

const ChangeControlSchema = new mongoose.Schema(
    {
        changeControlNumber: {
            type: String,
            unique: true,
            trim: true,
        },
        initiatedAt: {
            type: Date,
            required: true,
        },
        justification: {
            type: String
        },
        status: {
            type: String,
            enum: [
                "Draft",
                "Under Department Head Review",
                "Approved By Department Head",
                "Accepted By QA",
                "Investigation Team Assigned",
                "Team Impact Assessment Done",
                "Historical Check Done",
                "Acknowledged By Approver 1",
                "Acknowledged By Approver 2",
                "Change Control Closed"

            ],
            default: "Draft",
        },
        changeType: {
            type1: {
                type: String,
                enum: ["Major", "Minor", "Administrative"],
                required: true,
            },
            type2: {
                type: String,
                enum: ["Permanent", "Temporary"],
                required: true,
            },
            type3: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ChangeCategory",
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
                enum: ["product", "material", "equipment"],
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
            equipment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Equipment"
            },
        },
        documents: [
            {
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "documents.documentModel",
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
            }
        ],
        currentSituation: {
            type: String,
            trim: true,
        },
        shortTitle: {
            type: String,
            trim: true,
        },
        detailedDescription: {
            question1: {
                type: String,
                default: "What change is proposed?",
            },
            answer1: {
                type: String,
                trim: true,
            },
            question2: {
                type: String,
                default: "Why it is required?",
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
        immediateImpactAssessment: {
            type: String,
            trim: true,
        },
        riskAssessment: {
            type: Number,
            min: 1,
            max: 10,
        },
        implementationTimeline: {
            startDate: {
                type: Date,
            },
            endDate: {
                type: Date,
            }
        },
        capa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CAPA",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
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
            ref: "ChangeControlInvestigationTeam",
            default: null
        },
        investigationAssignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
        },
        teamImpactAssessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChangeImpact",
            default: null,
        },
        similarChanges: [
            {
                change: { type: mongoose.Schema.Types.ObjectId, ref: "ChangeControl", }
            }
        ],
        historicalCheckedBy: {
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