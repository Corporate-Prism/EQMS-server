import gpt4all from "gpt4all";

const { loadModel, createCompletion } = gpt4all;

// (async () => {
//   try {
//     console.log("Loading model...");

//     const model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
//       modelPath: "./src/models",
//     });

//     console.log("Model loaded. Asking...");

//     const response = await createCompletion(
//       model,
//       "Generate an objective for the information security policy for a healthcare organization.",
//       { temp: 0.7 }
//     );

//     console.log("AI Response:\n", response.choices[0].message.content);
//   } catch (err) {
//     console.error("Error running GPT4All test:", err);
//   }
// })();

export const generatePolicyData = async (req, res) => {
  try {
    const { policyName, field } = req.body;

    console.log("Model loading");
    const model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
      modelPath: "../models",
    });

    // console.log("Model loaded. Asking...");

    const prompt = `Generate clear and concise ${field} for the policy named "${policyName}"`;

    const response = await createCompletion(model, prompt, { temp: 0.7 });

    return res
      .status(200)
      .json({ success: true, data: response.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
