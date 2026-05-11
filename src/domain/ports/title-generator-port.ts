export interface TitleGenerationInput {
  userMessage: string;
  assistantMessage: string;
}

export interface TitleGeneratorPort {
  generate(input: TitleGenerationInput): Promise<string>;
}
