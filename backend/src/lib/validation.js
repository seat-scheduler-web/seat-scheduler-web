function hasRequiredFields(body, fields) {
  return fields.every((field) => body[field] !== undefined && body[field] !== "");
}

function isPositiveId(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

export { hasRequiredFields, isNonEmptyString, isPositiveId, isValidDate };
