import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./src/routes/authRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import permissionRoutes from "./src/routes/permissionRoutes.js";
import rolePermissionRoutes from "./src/routes/RolePermissionRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import manualRoutes from "./src/routes/document/manualRoutes.js";
import policyRoutes from "./src/routes/document/policyRoutes.js";
import procedureRoutes from "./src/routes/document/procedureRoutes.js";
import workInstructionRoutes from "./src/routes/document/workInstructionsRoutes.js";
import gptRoutes from "./src/routes/gptRoutes.js";
import locationRoutes from "./src/routes/deviation/locationRoutes.js";
import equipmentRoutes from "./src/routes/deviation/equipmentRoutes.js";
import deviationCategoryRoutes from "./src/routes/deviation/deviationCategoryRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import attachmentRoutes from "./src/routes/deviation/attachmentRoutes.js";
import deviationRoutes from "./src/routes/deviation/deviationRoutes.js";
import documentRoutes from "./src/routes/document/documentRoutes.js";
import investigationTeamRoutes from "./src/routes/deviation/investigationTeamRoutes.js";
import capaRoutes from "./src/routes/capa/capaRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EQMS API Endpoints",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the EQMS API endpoint");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/rolePermissions", rolePermissionRoutes);
app.use("/api/v1/manuals", manualRoutes);
app.use("/api/v1/policies", policyRoutes);
app.use("/api/v1/procedures", procedureRoutes);
app.use("/api/v1/work-instructions", workInstructionRoutes);
app.use("/api/v1/gpt", gptRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/equipments", equipmentRoutes);
app.use("/api/v1/deviationCategories", deviationCategoryRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/attachments", attachmentRoutes);
app.use("/api/v1/deviations", deviationRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/investigation-teams", investigationTeamRoutes);
app.use("/api/v1/capa", capaRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import swaggerJSDoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";

// import authRoutes from "./src/routes/authRoutes.js";
// import roleRoutes from "./src/routes/roleRoutes.js";
// import otpRoutes from "./src/routes/otpRoutes.js";
// import { swaggerServe, swaggerSetup } from "./swagger.js";

// dotenv.config();

// const app = express();

// // Connect DB when Lambda cold-starts
// connectDB();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Swagger config
// // const swaggerOptions = {
// //   definition: {
// //     openapi: "3.0.0",
// //     info: {
// //       title: "EQMS API Endpoints",
// //       version: "1.0.0",
// //     },
// //     components: {
// //       securitySchemes: {
// //         bearerAuth: {
// //           type: "http",
// //           scheme: "bearer",
// //           bearerFormat: "JWT",
// //         },
// //       },
// //     },
// //   },
// //   apis: ["./src/routes/*.js"],
// // };

// // const swaggerSpec = swaggerJSDoc(swaggerOptions);
// // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use("/api-docs", swaggerServe, swaggerSetup);

// app.get("/", (req, res) => {
//   res.send("Welcome to the EQMS API endpoint");
// });

// // Routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/roles", roleRoutes);
// app.use("/api/v1/otp", otpRoutes);

// // Export the app (Important for Vercel)
// export default app;
