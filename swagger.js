import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger config
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
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
