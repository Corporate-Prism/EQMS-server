// import mongoose from "mongoose";

// const DeviationImpactSchema = new mongoose.Schema(
//   {
//     deviationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Deviation",
//       required: true,
//     },
//     answers: [
//       {
//         questionId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Question",
//           required: true,
//         },
//         answer: {
//           type: mongoose.Schema.Types.Mixed, 
//           required: true,
//         },
//         comment: {
//           type: String,
//           trim: true,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const DeviationImpact = mongoose.model("DeviationImpact", DeviationImpactSchema);
// export default DeviationImpact;

import mongoose from "mongoose";

const DeviationImpactSchema = new mongoose.Schema(
  {
    deviationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deviation",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        comment: {
          type: String,
          trim: true,
        },
      },
    ]
  },
  { timestamps: true }
);

const DeviationImpact = mongoose.model("DeviationImpact", DeviationImpactSchema);
export default DeviationImpact;