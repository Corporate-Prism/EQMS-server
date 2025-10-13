import mongoose from "mongoose";
import Deviation from "../../models/deviation/Deviation.js";
import Attachments from "../../models/deviation/Attachments.js";
import DeviationImpact from "../../models/deviation/DeviationImpact.js";
import { uploadFilesToCloudinary } from "../../../utils/uploadToCloudinary.js";

export const createDeviation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body;
    const impactAssessments = body.impactAssessments
      ? JSON.parse(body.impactAssessments)
      : [];

    const detailedFiles = req.files["detailedDescriptionAttachments"] || [];
    const relatedFiles = req.files["relatedRecordsAttachments"] || [];

    const detailedUrls = await uploadFilesToCloudinary(detailedFiles, "eqms/deviation/detailed");
    const relatedUrls = await uploadFilesToCloudinary(relatedFiles, "eqms/deviation/related");

    const deviation = await Deviation.create(
      [
        {
          reportedAt: body.reportedAt,
          deviationType: {
            type1: body.deviationType1,
            type2: body.deviationType2,
            type3: body.deviationType3,
          },
          department: body.department,
          location: body.location,
          item: {
            type: body.itemType,
            ...(body.itemType === "product"
              ? {
                  product: {
                    productName: body.productName,
                    productCode: body.productCode,
                    productBatchNumber: body.productBatchNumber,
                  },
                }
              : {
                  material: {
                    materialName: body.materialName,
                    materialCode: body.materialCode,
                    materialBatchNumber: body.materialBatchNumber,
                  },
                }),
          },
          equipment: body.equipment,
          document: {
            documentId: body.documentId,
            documentModel: body.documentModel,
          },
          summary: body.summary,
          detailedDescription: {
            question1: body.question1,
            answer1: body.answer1,
            question2: body.question2,
            answer2: body.answer2,
          },
          immediateMeasuresTaken: body.immediateMeasuresTaken,
          immediateImpactAssessment: body.immediateImpactAssessment,
          riskAssessment: body.riskAssessment,
          securityLevel: body.securityLevel,
        },
      ],
      { session }
    );

    const createdDeviation = deviation[0];
    const detailedAttachments = await Attachments.insertMany(
      detailedUrls.map((url) => ({
        attachmentUrl: url,
        deviationId: createdDeviation._id,
        type: "detailedDescription",
      })),
      { session }
    );

    const relatedAttachments = await Attachments.insertMany(
      relatedUrls.map((url) => ({
        attachmentUrl: url,
        deviationId: createdDeviation._id,
        type: "relatedRecords",
      })),
      { session }
    );

    createdDeviation.detailedDescription.attachments = detailedAttachments.map((a) => a._id);
    createdDeviation.relatedRecords = {
      attachments: relatedAttachments.map((a) => a._id),
    };

    let deviationImpactDoc = null;
    if (impactAssessments.length > 0) {
      const [createdImpact] = await DeviationImpact.create(
        [
          {
            deviationId: createdDeviation._id,
            answers: impactAssessments.map((ia) => ({
              questionId: ia.questionId,
              answer: ia.answer,
              comment: ia.comment,
            })),
          },
        ],
        { session }
      );

      deviationImpactDoc = createdImpact;
      createdDeviation.impactAssessment = createdImpact._id;
    }

    await createdDeviation.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Deviation created successfully with single impact assessment and attachments",
      deviation: {
        ...createdDeviation.toObject(),
        impactAssessment: deviationImpactDoc,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating deviation:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};