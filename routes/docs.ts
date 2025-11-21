import express from "express";
import { openApiDocument } from "../docs/swagger";
import swaggerUI from "swagger-ui-express";
import { scalarHtml } from "./scalar.html";

const router = express.Router();

// OpenAPI JSON
router.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiDocument);
});

// Swagger UI
router.use("/swagger", swaggerUI.serve);
router.get("/swagger", swaggerUI.setup(openApiDocument));

// Scalar UI
router.get("/scalar", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval';"
  );
  res.send(scalarHtml);
});

export default router;
