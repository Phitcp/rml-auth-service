import * as joi from 'joi';

export const envValidationSchema = joi.object({
  PORT: joi.number().required(),
  TRACE_ID_HEADER: joi.string().default('x-request-id'),
  DB_TYPE: joi.string().required(),
  JWT_SECRET: joi.string().required(),
});
