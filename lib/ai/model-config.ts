export function getDefaultOpenAiModel() {
  return process.env.DEFAULT_OPENAI_MODEL?.trim() || "gpt-4.1-nano";
}

export function hasOpenAiApiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
